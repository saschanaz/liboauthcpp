/// <reference path="../ts-declaration/liboauthcpp.d.ts" />
document.addEventListener("DOMContentLoaded", function () {
    clearButton.addEventListener("click", function () {
        while (tweetList.firstChild)
            tweetList.removeChild(tweetList.firstChild);
    });
    streamStartButton.addEventListener("click", function () {
        startStream().then(function () { return readStreamingTweets(); });
    });
    setClientButton.addEventListener("click", function () {
        setClient(userKeyInput.value, userSecretInput.value);
        userKeyInput.disabled = true;
        userSecretInput.disabled = true;
        setClientButton.disabled = true;
    });
});
function httpRequest(method, url, options) {
    return new Promise(function (resolve, reject) {
        var xhr = new XMLHttpRequest();
        // responding state
        if (typeof options.respondingState === "number") {
            xhr.onreadystatechange = function () {
                if (xhr.readyState === options.respondingState)
                    resolve(xhr.response);
            };
        }
        else {
            xhr.onload = function () { return resolve(xhr.response); };
        }
        xhr.onerror = function (err) { return reject(err); };
        xhr.open(method, url);
        // response type
        if (options && typeof options.responseType === "string")
            xhr.responseType = options.responseType;
        // headers
        if (options && "headers" in options) {
            for (var fieldname in options.headers) {
                xhr.setRequestHeader(fieldname, options.headers[fieldname]);
            }
        }
        // data
        if (options && "data" in options)
            xhr.send(options.data);
        else
            xhr.send();
    });
}
var client;
function setClient(key, secret) {
    client = new Module.Client(new Module.Token(key, secret));
}
function tweet(content) {
    var endpoint = "https://api.twitter.com/1.1/statuses/update.json";
    var query = "status=" + encodeURIComponent(content);
    return httpRequest("POST", endpoint + "?" + query, {
        headers: {
            Authorization: client.getHttpHeader(Module.HttpRequestType.Post, endpoint + "?" + query, "", false)
        },
        data: query
    });
}
function refresh(content) {
    var endpoint = "https://api.twitter.com/1.1/statuses/home_timeline.json";
    return httpRequest("GET", endpoint, {
        headers: {
            Authorization: client.getHttpHeader(Module.HttpRequestType.Get, "" + endpoint, "", false)
        }
    });
}
var stream;
function startStream() {
    var endpoint = "https://userstream.twitter.com/1.1/user.json";
    return httpRequest("GET", endpoint, {
        headers: {
            Authorization: client.getHttpHeader(Module.HttpRequestType.Get, "" + endpoint, "", false)
        },
        responseType: "ms-stream",
        respondingState: 3
    }).then(function (response) {
        stream = response;
        return stream;
    });
}
function readStream(count) {
    if (count === void 0) { count = 1000; }
    return new Promise(function (resolve, reject) {
        var reader = new MSStreamReader();
        reader.onload = function () { return resolve(reader.result); };
        reader.onerror = function (err) { return reject(err); };
        reader.readAsText(stream, "UTF-8", count);
    });
}
function readStreamingTweets() {
    var buffer = "";
    var readOnce = function () { return readStream().then(function (content) {
        var end = content.indexOf("\r");
        if (end !== -1) {
            output(buffer + content.slice(0, end));
            buffer = content.slice(end + 1);
        }
        else
            buffer += content;
        readOnce();
    }); };
    readOnce();
}
function output(content) {
    var div = document.createElement("div");
    div.textContent = content;
    tweetList.appendChild(div);
}
