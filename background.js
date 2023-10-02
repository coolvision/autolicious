import scriptFileName from './content?script'

chrome.action.onClicked.addListener((tab) => {
    console.log("chrome.action.onClicked", scriptFileName);
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scriptFileName]
    });
});
