(() => {
  // Prevent multiple executions
  if (window.focusReaderExecuted) {
    console.log("FocusReader already executed, skipping");
    return;
  }
  window.focusReaderExecuted = true;

  console.log("FocusReader content script starting...");

  const IS_TOP = (window.top === window);
  const STATE_ATTR = "data-focusreader-active";
  const STYLE_ID   = "focusreader-style";
  const BAR_ID     = "focusreader-bar";

  // Store highlights per page
  const STORE_KEY = "focusreader-highlights::" + (location.origin + location.pathname);
  let highlights = []; // {id,text,context,index}

  function initializeFocusMode() {
    console.log("Initializing focus mode...");
    
    // ===== Toggle：已开启则退出 =====
    if (document.documentElement.getAttribute(STATE_ATTR) === "1") {
      console.log("Focus mode already active, exiting...");
      exitFocusMode();
      return;
    }

    // ===== 进入专注（只在顶层页面做样式与控制条）=====
    console.log("Entering focus mode...");
    document.documentElement.setAttribute(STATE_ATTR, "1");

    if (IS_TOP) {
      console.log("Top-level frame, applying focus mode");
      injectStyle();
      createBar();
      blockClicks();

      ensureDrawer();
      loadHighlightsAndRender(); // 进入时尝试恢复+渲染
    } else {
      // 不是顶层 frame 的情况下，不做任何净化，避免误伤图表等
      console.log("Not top-level frame, skipping focus mode");
      return;
    }
  }

  // Ensure DOM is ready before initializing
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFocusMode);
  } else {
    // DOM is already ready
    initializeFocusMode();
  }

   // ========= functions =========

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    
    try {
      const style = document.createElement("style");
      style.id = STYLE_ID;
      style.textContent = `
       /* 背景与正文排版 */
       html, body { background:#fdfdfd !important; }
       body {
         margin:0 !important;
         padding:48px 0 64px !important;
         font-size:18px !important;
         line-height:1.7 !important;
         color:#111 !important;
       }

       /* 隐藏常见“站点壳子” */
       header, nav, aside, footer,
       [role="banner"], [role="navigation"], [role="complementary"],
       .sidebar, .toolbar, .topbar, .site-header, .site-footer,
       .ads, .ad, .advert, .cookie, .newsletter, .share, .comment, .comments {
         display: none !important;
       }

       /* 主体宽度控制（含微信公众号选择器） */
       #js_content, .rich_media_content, article, main, .article, .post, .content, .entry, #content {
         max-width: 860px !important;
         margin: 0 auto !important;
         padding: 0 24px !important;
       }

       /* 媒体与图表：保持可见并自适应 */
       img, picture, video, canvas, svg, iframe, figure, object, embed {
         max-width: 100% !important;
         height: auto !important;
       }

       iframe {
         width: 100% !important;
         min-height: 320px !important;
         border: 0 !important;
       }

       /* 顶部控制条 */
       #${BAR_ID} {
         position: fixed; top: 0; left: 0; right: 0;
         height: 44px; display: flex; gap: 12px; align-items: center; justify-content: center;
         background: rgba(0,0,0,.85); color: #fff; font-size: 14px; z-index: 2147483647;
         -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px);
       }
       #${BAR_ID} button {
         padding: 6px 10px; border: 0; border-radius: 6px; cursor: pointer;
       }
       #${BAR_ID} .exit { background:#fff; color:#111; }
       #${BAR_ID} .allow, #${BAR_ID} .btn { background:#444; color:#fff; }

       /* === FocusReader 高亮与侧边栏 === */
       .fr-highlight {
         background: #fff59d !important;
         border-radius: 2px;
         box-shadow: inset 0 0 0 1px rgba(0,0,0,.05);
         cursor: pointer;
       }
       #fr-drawer {
         position: fixed; top: 44px; right: 0; bottom: 0; width: 380px;
         background: #fff; border-left: 1px solid #e5e5e5; z-index: 2147483647;
         box-shadow: -8px 0 20px rgba(0,0,0,.1); transform: translateX(100%); transition: transform .2s ease;
         display: flex; flex-direction: column;
       }
       #fr-drawer.open { transform: translateX(0); }
       #fr-drawer header { padding: 10px 12px; border-bottom: 1px solid #eee; font-weight: 600; }
       #fr-drawer .list { padding: 8px 12px; overflow: auto; gap: 10px; display: flex; flex-direction: column; }
       .fr-item { padding: 8px 10px; background: #fafafa; border: 1px solid #eee; border-radius: 8px; line-height: 1.5; }
       .fr-item small { color: #888; display:block; margin-top: 6px; }
     `;
      document.head.appendChild(style);
      console.log("Styles injected successfully");
    } catch (e) {
      console.error("Failed to inject styles:", e);
    }
  }

  function createBar() {
    if (document.getElementById(BAR_ID)) return;
    
    try {
      const bar = document.createElement("div");
      bar.id = BAR_ID;

     const tip = document.createElement("span");
     tip.textContent = "Focus Mode Active";

     const markBtn = document.createElement("button");
     markBtn.className = "btn";
     markBtn.textContent = "Highlight";

     const listBtn = document.createElement("button");
     listBtn.className = "btn";
     listBtn.textContent = "Notes";

     const exportBtn = document.createElement("button");
     exportBtn.className = "btn";
     exportBtn.textContent = "Export";

     const allowBtn = document.createElement("button");
     allowBtn.className = "allow";
     allowBtn.textContent = "Allow Links: Off";

     const exitBtn = document.createElement("button");
     exitBtn.className = "exit";
     exitBtn.textContent = "Exit";

      bar.append(tip, markBtn, listBtn, exportBtn, allowBtn, exitBtn);
      document.body.appendChild(bar);
      console.log("Control bar created successfully");

      // 事件
     markBtn.addEventListener("click", (e) => {
       e.preventDefault();
       e.stopPropagation();
       console.log("标黄按钮被点击");
       highlightSelection();
     });
     listBtn.addEventListener("click", (e) => {
       e.preventDefault();
       e.stopPropagation();
       console.log("摘录按钮被点击");
       toggleDrawer();
     });
     exportBtn.addEventListener("click", (e) => {
       e.preventDefault();
       e.stopPropagation();
       console.log("导出按钮被点击");
       exportHighlights();
     });

     // 链接允许/禁止切换
     let allowLinks = false;
     allowBtn.addEventListener("click", () => {
       allowLinks = !allowLinks;
       allowBtn.textContent = `Allow Links: ${allowLinks ? "On" : "Off"}`;
       document.body.toggleAttribute("data-focusreader-allowlinks", allowLinks);
     });

     // 退出
     exitBtn.addEventListener("click", exitFocusMode);

     // 键盘快捷键
     const onKeyDown = (e) => {
       console.log("键盘按下:", e.key, "Ctrl:", e.ctrlKey, "Meta:", e.metaKey, "Shift:", e.shiftKey);
       
       if (e.key === "Escape") {
         exitFocusMode();
         return;
       }
       
       // Ctrl/Cmd + H 进行高亮 (检查大小写)
       if ((e.ctrlKey || e.metaKey) && (e.key === 'h' || e.key === 'H')) {
         e.preventDefault();
         e.stopPropagation();
         console.log("键盘快捷键触发高亮");
         highlightSelection();
         return;
       }
       
       // Ctrl/Cmd + Shift + L 打开摘录列表
       if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'L' || e.key === 'l')) {
         e.preventDefault();
         e.stopPropagation();
         console.log("键盘快捷键打开摘录列表");
         toggleDrawer();
         return;
       }
      };
      document.addEventListener("keydown", onKeyDown, true);
      
    } catch (e) {
      console.error("Failed to create control bar:", e);
    }
  }

   function blockClicks() {
     // 捕获阶段拦截 A 标签
     const handler = (e) => {
       if (document.body.getAttribute("data-focusreader-allowlinks") === "true") return;
       let el = e.target;
       while (el && el !== document.body) {
         if (el.tagName === "A" || el.closest?.("a")) {
           e.preventDefault(); e.stopPropagation(); return;
         }
         el = el.parentElement;
       }
     };
     document.addEventListener("click", handler, true);

     // 提供移除函数给退出时调用
     window.__focusreaderRemoveClickBlocker = () =>
       document.removeEventListener("click", handler, true);
   }

   function exitFocusMode() {
     document.documentElement.removeAttribute(STATE_ATTR);
     if (IS_TOP) {
       document.getElementById(STYLE_ID)?.remove();
       document.getElementById(BAR_ID)?.remove();
       if (window.__focusreaderRemoveClickBlocker) {
         try { window.__focusreaderRemoveClickBlocker(); } catch {}
       }
     }
     if (document.fullscreenElement) {
       document.exitFullscreen?.().catch(()=>{});
     }
   }

   // ====== 高亮/摘录相关 ======

   function ensureDrawer() {
     if (document.getElementById("fr-drawer")) return;
     const drawer = document.createElement("aside");
     drawer.id = "fr-drawer";
     drawer.innerHTML = `
       <header>Page Notes <span id="fr-count" style="color:#888;font-weight:400"></span></header>
       <div class="list" id="fr-list"></div>
     `;
     document.body.appendChild(drawer);
   }
   function toggleDrawer(){ document.getElementById("fr-drawer")?.classList.toggle("open"); }

   function saveHighlights() {
     try { 
       localStorage.setItem(STORE_KEY, JSON.stringify(highlights)); 
       console.log("保存了", highlights.length, "个高亮到", STORE_KEY);
     } catch (e) {
       console.error("保存高亮失败:", e);
     }
     const count = document.getElementById("fr-count"); 
     if (count) count.textContent = `(${highlights.length})`;
   }

   function renderList() {
     const list = document.getElementById("fr-list"); 
     if (!list) {
       console.error("摘录列表容器未找到");
       return;
     }
     
     list.innerHTML = "";
     console.log("渲染", highlights.length, "个高亮项目");
     
     highlights.forEach((h, i) => {
       const div = document.createElement("div");
       div.className = "fr-item";
       div.innerHTML = `${escapeHTML(h.text)}<small>#${i+1}</small>`;
       div.addEventListener("click", () => {
         console.log("点击了高亮项目:", h.text);
       });
       list.appendChild(div);
     });
     
     saveHighlights();
   }

   function loadHighlightsAndRender() {
     try { 
       const stored = localStorage.getItem(STORE_KEY);
       highlights = JSON.parse(stored || "[]"); 
       console.log("从", STORE_KEY, "加载了", highlights.length, "个高亮");
     } catch (e) { 
       console.error("加载高亮失败:", e);
       highlights = []; 
     }
     
     // 尝试恢复（朴素匹配：在正文容器中找到首次出现的文本并包裹）
     if (highlights.length) {
       console.log("尝试恢复", highlights.length, "个高亮");
       highlights.forEach(h => tryRestoreHighlight(h.text));
     }
     
     renderList();
   }

   function tryRestoreHighlight(text) {
     if (!text || text.length < 2) return;
     const root = document.querySelector("#js_content, .rich_media_content, article, main, .article, .post, .content, .entry, #content") || document.body;
     const range = findTextRange(root, text);
     if (range) wrapRange(range);
   }

   // —— 标黄主流程 ——
   function highlightSelection() {
     console.log("highlightSelection函数被调用");
     
     const sel = window.getSelection();
     console.log("当前选择对象:", sel);
     console.log("选择范围数量:", sel ? sel.rangeCount : 0);
     
     if (!sel || sel.rangeCount === 0) {
       console.log("没有文本选择");
       alert("Please select text to highlight first");
       return;
     }
     
     const range = sel.getRangeAt(0);
     console.log("选择范围:", range);
     console.log("选择是否折叠:", range.collapsed);
     
     if (range.collapsed) {
       console.log("选择范围已折叠（无选择）");
       alert("Please select some text before highlighting");
       return;
     }

     // 只处理选区落在当前文档（顶层）内
     if (!document.contains(range.commonAncestorContainer)) {
       console.log("选择不在当前文档内");
       alert("Selected text is not within the current page scope");
       return;
     }

     const text = range.toString().trim();
     console.log("选择的文本:", text);
     console.log("文本长度:", text.length);
     
     if (!text || text.length < 1) {
       console.log("选择的文本为空");
       alert("Selected text is empty");
       return;
     }

     // 检查是否已经高亮过
     if (highlights.find(h => h.text === text)) {
       console.log("文本已被高亮过");
       alert("This text has already been highlighted");
       sel.removeAllRanges();
       return;
     }

     console.log("开始包裹选择范围");
     const wrapped = wrapRange(range);
     if (!wrapped) {
       console.log("包裹失败");
       alert("Unable to highlight this text, please try selecting again");
       return;
     }

     console.log("添加到高亮列表");
     highlights.push({ id: genId(), text, context: location.href, index: highlights.length });
     renderList();
     
     // 清除选择状态
     sel.removeAllRanges();
     
     // 给用户反馈
     console.log("已添加高亮:", text);
     alert("Highlight added: " + text.substring(0, 50) + (text.length > 50 ? "..." : ""));
   }

   function wrapRange(range) {
     // 避免跨越已有高亮
     const span = document.createElement("span");
     span.className = "fr-highlight";
     
     try {
       // 检查范围是否包含已有的高亮元素
       const contents = range.cloneContents();
       const existingHighlights = contents.querySelectorAll('.fr-highlight');
       if (existingHighlights.length > 0) {
         console.warn("选区包含已有高亮，跳过");
         return null;
       }
       
       range.surroundContents(span);
     } catch (e) {
       console.warn("无法直接包裹选区，尝试文本匹配:", e.message);
       // 若选区包含部分节点不可包裹（例如跨 block），退化为复制文本再用 find 匹配一次
       const text = range.toString();
       if (!text || text.length < 2) {
         console.warn("文本太短，无法处理");
         return null;
       }
       
       const newRange = findTextRange(range.commonAncestorContainer.ownerDocument || document, text);
       if (!newRange) {
         console.warn("无法找到匹配的文本范围");
         return null;
       }
       
       try {
         newRange.surroundContents(span);
       } catch (e2) {
         console.error("文本匹配后仍无法包裹:", e2.message);
         return null;
       }
     }
     
     // 支持点击删除
     span.title = "Click to remove highlight";
     span.addEventListener("click", (e) => {
       e.preventDefault(); e.stopPropagation();
       const t = span.textContent?.trim();
       span.replaceWith(...span.childNodes);
       if (t) {
         const idx = highlights.findIndex(x => x.text === t);
         if (idx > -1) { 
           highlights.splice(idx, 1); 
           renderList(); 
           console.log("已移除高亮:", t);
         }
       }
     }, true);
     
     return span;
   }

   function exportHighlights() {
     if (!highlights.length) { alert("No notes content yet"); return; }
     const lines = highlights.map((h, i) => `${i+1}. ${h.text}`);
     const md = [
      `## Notes - ${document.title}`,
      `> Source: ${location.href}`,
       "",
       ...lines
     ].join("\\n");
     copyText(md);
     alert("Copied to clipboard (Markdown)");
   }

   function copyText(t) {
     if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(t);
     const ta = document.createElement("textarea");
     ta.value = t; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
   }

   // 简易文本查找为 Range（从指定根节点中找第一次出现）
   function findTextRange(root, text) {
     const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
       acceptNode(node) {
         if (!node.nodeValue) return NodeFilter.FILTER_REJECT;
         return node.nodeValue.includes(text) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
       }
     });
     const node = walker.nextNode();
     if (!node) return null;
     const start = node.nodeValue.indexOf(text);
     const range = document.createRange();
     range.setStart(node, start);
     range.setEnd(node, start + text.length);
     return range;
   }

   function escapeHTML(s) {
     return (s || "").replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
   }
   function genId(){ return Math.random().toString(36).slice(2,9); }
   
   // 添加到全局对象以便调试
   window.focusReaderDebug = {
     highlightSelection,
     toggleDrawer,
     exportHighlights,
     highlights: () => highlights,
     test: () => {
       console.log("FocusReader调试信息:");
       console.log("- 当前高亮数量:", highlights.length);
       console.log("- 选择状态:", window.getSelection());
       console.log("- 专注模式:", document.documentElement.getAttribute("data-focusreader-active"));
       console.log("- 控制栏存在:", !!document.getElementById("focusreader-bar"));
       console.log("- 摘录面板存在:", !!document.getElementById("fr-drawer"));
     }
   };
 })();

