(function () {
  function focusNow() {
    // 先获取当前活动标签页
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.error("Error getting current tab:", chrome.runtime.lastError);
        alert("Unable to get current tab, please try again");
        return;
      }
      
      if (!tabs || tabs.length === 0) {
        console.error("No active tab found");
        alert("No active tab found, please try again");
        return;
      }
      
      const currentTab = tabs[0];
      if (!currentTab.id) {
        console.error("Current tab has no ID");
        alert("Current tab is invalid, please try again");
        return;
      }
      
      // 发送消息给 background script 来处理，包含标签页ID
      chrome.runtime.sendMessage({ 
        action: "toggleFocus", 
        tabId: currentTab.id 
      }, (response) => {
        if (chrome.runtime.lastError) {
          console.error("Error sending message:", chrome.runtime.lastError);
          alert("Failed to send message, please try again");
          return;
        }
        
        if (response && response.success) {
          console.log("Focus mode toggled successfully");
          // Close popup window
          window.close();
        } else {
          console.error("Failed to toggle focus mode:", response);
          const errorMsg = response && response.error ? response.error : "Unknown error";
          alert(`Failed to toggle focus mode: ${errorMsg}`);
        }
      });
    });
  }

  // 进入/退出都走同一套（content.js 内部是 toggle）
  document.getElementById("enter")?.addEventListener("click", focusNow);
  document.getElementById("exit")?.addEventListener("click", focusNow);
})();
