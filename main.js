

let tab = await getCurrentTab();
console.log("open popup", tab);

let cached = await getObjectFromLocalStorage(tab.url);
console.log("check cached", cached);
if (cached) {
    let obj = JSON.parse(cached.content);
    console.log(obj);
    document.getElementById("result").classList.add("pa2");
    document.getElementById("result").innerHTML = `
    <div>${obj.categories.join(' ⟶ ')}</div>
    <div class="mt2"><b>tags: </b>${obj.tags.join(" • ")}</div>
    `
    document.getElementById("add").style.display = "none";
}

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
        document.getElementById("loading_spinner").style.display = "none";

        let obj = JSON.parse(request.chat_response);
        console.log(obj);

        if (obj.info) {
            document.getElementById("result").classList.add("pa2");
            document.getElementById("result").innerHTML = `
            <div>${obj.info}</div>
            `
        } else {
            document.getElementById("result").classList.add("pa2");
            document.getElementById("result").innerHTML = `
            <div>${obj.categories.join(' ⟶ ')}</div>
            <div class="mt2"><b>tags: </b>${obj.tags.join(" • ")}</div>
            `
            document.getElementById("add").style.display = "none";
        }

    }
);

import scriptFileName from './content?script'
document.getElementById("add").addEventListener('pointerdown', add_bookmark);

async function add_bookmark() {

    console.log("add pointerdown", scriptFileName);

    let tab = await getCurrentTab();

    document.getElementById("loading_spinner").style.display = "block";

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: [scriptFileName]
    });

    chrome.tabs.sendMessage(tab.id, { command: "sendPageContent" });
}

document.getElementById("save").addEventListener('pointerdown', () => {
    console.log("save");
    save_settings();
});

document.getElementById("clear").addEventListener('pointerdown', () => {
    console.log("clear cache");
    chrome.storage.local.clear();
    save_settings();
});

document.getElementById("view").addEventListener('pointerdown', () => {
    chrome.tabs.create({
        active: true,
        url: 'view.html'
    }, null);
});


chrome.storage.local.get("settings", (data) => {
    document.querySelector("#api-key").value = data.settings.apiKey || "";
    document.querySelector("#model").value = data.settings.model || "";
    console.log("settings read", data.settings);
});

async function getObjectFromLocalStorage(key) {
    return new Promise((resolve, reject) => {
        try {
            chrome.storage.local.get(key, function (value) {
                resolve(value[key]);
            });
        } catch (ex) {
            reject(ex);
        }
    });
};