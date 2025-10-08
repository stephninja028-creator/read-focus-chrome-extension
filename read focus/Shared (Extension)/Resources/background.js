chrome.action.onClicked.addListener((tab) => {
  if (!tab?.id) return;

  // ① 顶层 frame 请求全屏（与图标点击同一手势）
  chrome.scripting.executeScript({
    target: { tabId: tab.id, allFrames: false },
    func: () => document.documentElement.requestFullscreen?.().catch(console.warn)
  }, () => {
    // ② 注入 content.js 到所有 frame 做净化/拦截（content.js 内部是 toggle）
    chrome.scripting.executeScript({
      target: { tabId: tab.id, allFrames: true },
      files: ["content.js"],
      injectImmediately: true
    });
  });
});
