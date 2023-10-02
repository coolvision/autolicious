


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