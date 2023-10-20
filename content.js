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
let openai = null;
if (settings && "apiKey" in settings) {
    let api_key = settings["apiKey"];
    console.log("settings", settings, settings["apiKey"]);
    openai = new OpenAI({ apiKey: api_key, dangerouslyAllowBrowser: true });
}

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

    let s = await getObjectFromLocalStorage("bookmarks_data");
    console.log("start", s);

    const textContent = document.body.innerText;
    let text = window.location.href + '\n' + document.title + '\n' + textContent.substring(0, 2000);

    let prompt =
        `You are an expert in cataloguing, ranking, archiving and retrieving web pages.
For a given text from a web page, please write:
- title for saving the page, based on url, title and content
- short 1-sentence description of the page
- list of descriptive tags (up to 5)
- select category for the content (like science, technology, entertainment, education, editorial, shopping, etc...)
- select sub-category (like ai, movie, programming, blog post, etc...)
- select sub-sub-category, which describes specific topic of the content
categories should be lower case, and as short as possible, 1 word maximum.
shorten category names is possible: "ai" instead of "artificial intelligence", etc...
print output in following JSON format:
{"tags": [...], "title": ..., "description": ..., "categories": [category, sub-category, sub-sub-category]}
following text contains page url, title, and part of the content:
===
` + text;

    console.log('prompt:', prompt);
    let settings = await getObjectFromLocalStorage("settings");

    if (!settings || !("model" in settings) || !("apiKey" in settings)) {
        chrome.runtime.sendMessage({
            chat_response: JSON.stringify({info: "Please provide OpenAI API key in the settings form below"})
        });
        return;
    }

    console.log("use model", settings.model, settings.apiKey);

    const completion = await openai.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: settings.model,
    });

    let content = completion.choices[0].message.content;
    console.log("chat response:", content);

    let obj = {};
    try {
        obj = JSON.parse(content);
    } catch (e) {
        chrome.runtime.sendMessage({
            chat_response: e
        });
        return console.error(e);
    }
    console.log("parsed:", obj);

    chrome.runtime.sendMessage({
        chat_response: content
    });

    let data = await getObjectFromLocalStorage("bookmarks_data");
    console.log("get data:", data);

    if (!data) {
        data = {tags: [], categories: {}};
    } else {
        data = JSON.parse(data);
    }

    // for (let t of obj.tags) {
    //     data.tags.push(t);
    // }
    // data.tags = [...new Set(data.tags)];
    let c = obj.categories;

    if (data.categories[c[0]]) {
        if (data.categories[c[0]][c[1]]) {
            data.categories[c[0]][c[1]].push(c[2]);
            data.categories[c[0]][c[1]] = [...new Set(data.categories[c[0]][c[1]])];
        } else {
            data.categories[c[0]][c[1]] = [c[2]];
        }
    } else {
        data.categories[c[0]] = {};
        data.categories[c[0]][c[1]] = [c[2]];
    }

    console.log("processed data", data, JSON.stringify(data));

    // let bookmarks_data = "bookmarks_data123"; //{tags: tags, categories: categories};
    await saveObjectInLocalStorage({bookmarks_data: JSON.stringify(data)});

    // console.log("data", data, tags, categories, bookmarks_data);

    let b = await getObjectFromLocalStorage("bookmarks_data");
    console.log("b", b);

    await saveObjectInLocalStorage({
        [window.location.href]: {
                href: window.location.href,
                document_title: document.title,
                title: obj.title,
                description: obj.description,
                content: content,
                categories: c[0] + " : " + c[1] + " : " + c[2]
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
