// In fact, we're redirecting to an HTML page with the exact same code - but our local copy, lol
location.replace(chrome.extension.getURL("callback.html") + location.hash);
