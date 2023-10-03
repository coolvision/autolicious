import OpenAI from 'openai';

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

let settings = await getObjectFromLocalStorage("settings");
let api_key = settings.apiKey;
let openai = new OpenAI({ apiKey: api_key, dangerouslyAllowBrowser: true });

let processing = false;

async function sendPageContent() {

    processing = true;

    let cached = await getObjectFromLocalStorage(window.location.href);
    console.log("check cached", cached);
    if (cached) {
        chrome.runtime.sendMessage({
            chat_response: cached.content
        });
        processing = false;
        return;
    }

    const textContent = document.body.innerText;
    let text = window.location.href + '\n' + textContent.substring(0, 2000);

    let prompt =
        `You are an expert in cataloguing, ranking, archiving and retrieving web pages.
For a given text from a web page, please write:
- list of descriptive keywords for future retrieval
- rank this text on a scale 1-10 for being relevant and interesting for future retrieval
- select category (most general), sub-category (more specific), sub-sub-category (specialized), for the content
Please keep tags and categories as short and concise as possible.
print output in following JSON format:
{"tags": [...], "rating": ..., "categories": [category, sub-category, sub-sub-category]}
===
` + text;

    console.log('prompt:', prompt);
    let settings = await getObjectFromLocalStorage("settings");
    console.log("use model", settings.model);

    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: settings.model,
    });

    let content = completion.choices[0].message.content;

    chrome.runtime.sendMessage({
        chat_response: content
    });

    console.log("chat response:", content);
    console.log("chat response JSON:", JSON.parse(content));

    saveObjectInLocalStorage({
        [window.location.href]: {
                href: window.location.href,
                content: content
            }
        });

    processing = false;
}

chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        console.log(request, sender);

        if (!processing) {
            console.log("do sendPageContent");
            sendPageContent();
        } else {
            console.log("processing, ignore");
        }

        // sendResponse({ message: "ok" });
    }
);

sendPageContent();
