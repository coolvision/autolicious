const form = document.querySelector("form");

function save_settings() {
    let settings = {
        apiKey: document.querySelector("#api-key").value,
        model: document.querySelector("#model").value
        // blacklist: document.querySelector("#blacklist").value
    }
    chrome.storage.local.set({ settings }, () => {
        console.log("settings saved");
    });
}

async function getCurrentTab() {
    let queryOptions = { active: true, lastFocusedWindow: true };
    let [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request, sender);
        sendResponse({ message: "ok" });
    }
);

import scriptFileName from './content?script'
document.getElementById("add").addEventListener('pointerdown', add_bookmark);


async function add_bookmark() {

    console.log("add pointerdown", scriptFileName);

    let tab = await getCurrentTab();

    console.log("tab", tab);

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scriptFileName]
    });

    chrome.tabs.sendMessage(tab.id, { command: "sendPageContent" },
    function (response) {
        console.log(response);
    });

    // chrome.runtime.sendMessage({
    //     command: "sendPageContent"
    // }, (response) => console.log("response", response));

    // chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    //     chrome.tabs.sendMessage(tabs[0].id, { command: "sendPageContent" },
    //     function (response) {
    //         console.log(response);
    //     });
    // });

}



document.getElementById("save").addEventListener('pointerdown', () => {
    save_settings();
});

document.getElementById("clear").addEventListener('pointerdown', () => {
    console.log("clear cache");
    chrome.storage.local.clear();
    save_settings();
});

chrome.storage.local.get("settings", (data) => {
    document.querySelector("#api-key").value = data.settings.apiKey || "";
    document.querySelector("#model").value = data.settings.model || "";
    // document.querySelector("#blacklist").value = data.settings.blacklist || "";
    console.log("settings read", data.settings);
});
