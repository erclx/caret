console.log('[Background] Service Worker Initialized')

chrome.runtime.onInstalled.addListener(() => {
  console.log('[Background] Extension installed')
})
