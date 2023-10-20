# Autolicious Chrome Extension Privacy Policy

## Intro

This privacy policy describes how the extension handles personal data. The extension is only using the data that is necessary for it's function -- automatic cataloging of bookmarks. It stores data locally in your browser, and sends data in requests to OpenAI API.

## Chrome Storage API

The extension does not have a backend server to collect data to the server side. Since no data is collected outside of your browser, it stands to reason, and is, indeed, the case, that none of your data can be sold to third parties.

The extension is taking advantage of [Google Chrome's Storage API](https://developers.chrome.com/extensions/storage) to store information locally in your browser. This is similar to a [cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies). Google syncs this information across your various computers and Chrome installations. However, the extension only accesses this data locally on your machine and does not transmit it. 

Data that in stored in your browser Local Storage includes: OpenAI API key, list of bookmarks, with each bookmark including: page url, title, categories, tags, description.

You can delete the data saved in your browser Local Storage by:
- Removing the extension from your browser
- Pressing "clear all bookmarks" button in the extension's popup window to clear bookmark data
- Deleting OpenAI key in the settings input field and pressing "save settings" button to overwrite it with an empty value

## Usage of OpenAI's API

When you use the extension it utilizes the OpenAI API to analyze content of the web pages for which you add bookmarks. By using the extension and adding bookmarks (which leads to submitting requests), you agree to have your information processed by OpenAI's API. OpenAI's API is developed and maintained by OpenAI Inc., and any information you provide when using the extension may be transferred and processed by OpenAI for the purpose of providing their services. To learn more about OpenAI's privacy practices, please visit their Privacy Policy at: https://openai.com/policies/privacy-policy Please review OpenAI's API Privacy Policy separately to understand their data handling practices.
