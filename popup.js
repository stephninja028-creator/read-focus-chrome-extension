 (function () {
   function focusNow() {
     chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
       if (!tabs?.length) return;
       const tabId = tabs[0].id;

       // ① 先在“顶层 frame”直接执行全屏（继承 popup 点击的用户手势）
       if (chrome.scripting?.executeScript) {
         chrome.scripting.executeScript({
           target: { tabId, allFrames: false }, // 顶层
           func: () => {
             // 顶层请求全屏
             document.documentElement.requestFullscreen?.().catch(console.warn);
           }
         }, () => {
           // ② 全屏触发后，再对所有 frame 注入 content.js 做净化/拦截
           chrome.scripting.executeScript({
             target: { tabId, allFrames: true },
             files: ["content.js"],
             injectImmediately: true
           }, () => void 0);
         });
       } else {
         // 兼容旧式 API（MV2）
         chrome.tabs.executeScript(tabId, {
           code: "document.documentElement.requestFullscreen && document.documentElement.requestFullscreen();"
         }, () => {
           chrome.tabs.executeScript(tabId, { file: "content.js", allFrames: true }, () => void 0);
         });
       }
     });
   }

   // 进入/退出都走同一套（content.js 内部是 toggle）
   document.getElementById("enter")?.addEventListener("click", focusNow);
   document.getElementById("exit")?.addEventListener("click", focusNow);
 })();
