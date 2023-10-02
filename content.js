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

async function sendPageContent() {

    let settings = await getObjectFromLocalStorage("settings");

    let blacklist = settings.blacklist.split('\n');
    console.log("blacklist", settings.blacklist, blacklist);
    for (let b of blacklist) {
        console.log("check b", b, window.location.href, window.location.href.includes(b));
        if (window.location.href.includes(b)) {
            console.log("page is blacklisted", window.location.href, b);
            blockPage("page is blacklisted", window.location.href);
            return;
        }
    }

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

    // hidePage();

    // const completion = await openai.chat.completions.create({
    //     messages: [{ role: 'user', content: prompt }],
    //     model: settings.model,
    // });

    // let content = completion.choices[0].message.content;

    // console.log("chat response:", a);

    // saveObjectInLocalStorage({
    //     [window.location.href]: {
    //             href: window.location.href,
    //             content: content
    //         }
    //     });
}

let cached = await getObjectFromLocalStorage(window.location.href);
console.log("check cached", cached);

if (!cached) {
    if (document.readyState === 'complete') {
        console.log('Page is already loaded, sending message immediately')
        sendPageContent();
    } else {
        console.log('Page is not loaded, waiting for load event')
        window.addEventListener('load', sendPageContent);
    }
}