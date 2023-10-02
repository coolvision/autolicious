import OpenAI from 'openai';

// const form = document.querySelector("form");

const getObjectFromLocalStorage = async function (key) {
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


let settings = await getObjectFromLocalStorage("settings");
let api_key = settings.apiKey;
let openai = new OpenAI({ apiKey: api_key, dangerouslyAllowBrowser: true });

function save_settings() {
    let settings = {
        apiKey: document.querySelector("#api-key").value,
        model: document.querySelector("#model").value
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


function getTitle() { console.log("document.title", document.title); }

async function sendPageContent(openai) {

    console,log("sendPageContent");

    const saveObjectInLocalStorage = async function (obj) {
        return new Promise((resolve, reject) => {
            try {
                chrome.storage.local.set(obj, function () {
                    resolve();
                });
            } catch (ex) {
                reject(ex);
            }
        });
    };

    // let settings = await getObjectFromLocalStorage("settings");
    // let api_key = settings.apiKey;

    // console.log("content script", api_key);

    // let openai = new OpenAI({ apiKey: api_key, dangerouslyAllowBrowser: true });

    // let settings = await getObjectFromLocalStorage("settings");

    // let blacklist = settings.blacklist.split('\n');
    // console.log("blacklist", settings.blacklist, blacklist);
    // for (let b of blacklist) {
    //     console.log("check b", b, window.location.href, window.location.href.includes(b));
    //     if (window.location.href.includes(b)) {
    //         console.log("page is blacklisted", window.location.href, b);
    //         blockPage("page is blacklisted", window.location.href);
    //         return;
    //     }
    // }

    const textContent = document.body.innerText;
    let text = window.location.href + '\n' + textContent.substring(0, 2000);

    let prompt =
        `You are an expert in cataloguing, ranking, archiving and retrieving web pages.
For a given text from a web page, please write:
- list of descriptive keywords for future retrieval
- rank this text on a scale 1-10 for being relevant and interesting for future retrieval
- select category, sub-category, sub-sub-category, sub-sub-sub-category for the content
Please keep tags and categories as short and concise as possible.
print output in following JSON format:
{tags: [...], rating: ..., categories: [category, sub-category, sub-sub-category, sub-sub-sub-category]}
===
{text}`;

    console.log('prompt:', prompt);
    console.log("use model", settings.model);

    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: settings.model,
    });

    let content = completion.choices[0].message.content;

    console.log("chat response:", a);

    chrome.runtime.sendMessage({ message: 'chat response' },
        (response) => console.log(response));

    saveObjectInLocalStorage({
        [window.location.href]: {
            href: window.location.href,
            content: content
        }
    });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("chrome.runtime.onMessage", message);
});

async function add_bookmark() {

    console.log("add pointerdown", scriptFileName);

    let tab = await getCurrentTab();

    console.log("tab", tab);

    console.log("executeScript", sendPageContent)

    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: sendPageContent,
        args : [ openai ]
        // files: [scriptFileName]
    });
}

import scriptFileName from './content?script'
document.getElementById("add").addEventListener('pointerdown', add_bookmark);


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
    console.log("settings read", data.settings);
});
