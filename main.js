const form = document.querySelector("form");

function save_settings() {
    let settings = {
        apiKey: document.querySelector("#api-key").value,
        model: document.querySelector("#model").value,
        blacklist: document.querySelector("#blacklist").value
    }
    chrome.storage.local.set({ settings }, () => {
        console.log("settings saved");
    });
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
    document.querySelector("#blacklist").value = data.settings.blacklist || "";
    console.log("settings read", data.settings);
});
