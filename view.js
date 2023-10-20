// import * as utils from './utils.js'

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

let b = await getObjectFromLocalStorage("bookmarks_data");

let d = JSON.parse(b);

console.log("bookmarks_data", b);
console.log("tags", d.tags);
console.log("categories", d.categories);

// let div = document.createElement('div');
// div.innerHTML = b;

let body = document.querySelector('body');
// body.append(div);

let data = await chrome.storage.local.get();
console.log("data", data);

let categories = {};

for (let i in data) {
    if (data[i].content) {
        let l = JSON.parse(data[i].content);
        console.log(data[i].href, l);

        let c = l.categories;

        for (let w in l.categories) {
            l.categories[w] = l.categories[w].toLowerCase();
        }

        let url = data[i].href;
        let title = url;
        if (data[i].title) {
            title = data[i].title;
        }        
        let description = data[i].description;

        if (categories[c[0]]) {
            if (categories[c[0]][c[1]]) {
                if (categories[c[0]][c[1]][c[2]]) {
                    categories[c[0]][c[1]][c[2]].push({url: url, title: title, description: description});
                    categories[c[0]][c[1]][c[2]] = [...new Set(categories[c[0]][c[1]][c[2]])];     
                } else {
                    categories[c[0]][c[1]][c[2]] = [{url: url, title: title, description: description}]
                }
            } else {
                categories[c[0]][c[1]] = {};
                categories[c[0]][c[1]][c[2]] = [{url: url, title: title, description: description}];
            }
        } else {
            categories[c[0]] = {};
            categories[c[0]][c[1]] = {}
            categories[c[0]][c[1]][c[2]] = [{url: url, title: title, description: description}]
        }
    }
}

console.log("categories", categories);

let ul1 = document.createElement('ul');
body.append(ul1);
ul1.classList.add("f3", "fw6");

for (let i in categories) {
    let li1 = document.createElement('li');
    li1.innerHTML = i;
    li1.classList.add("ma2");
    ul1.append(li1);

    let ul2 = document.createElement('ul');
    ul2.classList.add("f4", "fw6");
    li1.append(ul2);

    for (let j in categories[i]) {
        let li2 = document.createElement('li');
        li2.innerHTML = j;
        li2.classList.add("ma2");
        ul2.append(li2);
        
        let ul3 = document.createElement('ul');
        ul3.classList.add("f4", "normal");
        li2.append(ul3);

        for (let k in categories[i][j]) {
            let li3 = document.createElement('li');
            li3.classList.add("ma2");
            ul3.append(li3);

            let s1 = document.createElement('span');
            s1.innerHTML = k;
            li3.append(s1);
            li3.append(document.createElement('br'));

            for (let l in categories[i][j][k]) {
                let a1 = document.createElement('a');
                a1.innerHTML = categories[i][j][k][l].title;
                a1.href = categories[i][j][k][l].url;
                a1.classList.add("mv2", "db");
                li3.append(a1);

                let p1 = document.createElement('p');
                p1.innerHTML = categories[i][j][k][l].description;
                p1.classList.add("mv2", "f5");
                li3.append(p1);
            }
        }
    }
}