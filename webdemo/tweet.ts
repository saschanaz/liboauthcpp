/// <reference path="../ts-declaration/liboauthcpp.d.ts" />

declare var clearButton: HTMLInputElement;
declare var streamStartButton: HTMLInputElement;
declare var setClientButton: HTMLInputElement;
declare var userKeyInput: HTMLInputElement;
declare var userSecretInput: HTMLInputElement;
declare var tweetList: HTMLDivElement;

document.addEventListener("DOMContentLoaded", () => {
  clearButton.addEventListener("click", () => {
    while (tweetList.firstChild)
      tweetList.removeChild(tweetList.firstChild);
  });
  streamStartButton.addEventListener("click", () => {
    startStream().then(() => readStreamingTweets());
  });
  setClientButton.addEventListener("click", () => {
    setClient(userKeyInput.value, userSecretInput.value);
    userKeyInput.disabled = true;
    userSecretInput.disabled = true;
    setClientButton.disabled = true;
  });
});

interface HttpRequestOptions {
  headers?: any;
  responseType?: any;
  data?: any;
  respondingState?: number;
}

function httpRequest(method: string, url: string, options?: HttpRequestOptions) {
  return new Promise<any>((resolve, reject) => {
    var xhr = new XMLHttpRequest();

    // responding state
    if (typeof options.respondingState === "number") {
      xhr.onreadystatechange = () => {
        if (xhr.readyState === options.respondingState)
          resolve(xhr.response)
      };
    }
    else {
      xhr.onload = () => resolve(xhr.response);
    }

    xhr.onerror = (err) => reject(err);
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

var client: Module.Client;
function setClient(key: string, secret: string) {
  client = new Module.Client(new Module.Token(key, secret));
}

function tweet(content: string) {
  var endpoint = "https://api.twitter.com/1.1/statuses/update.json"
  var query = `status=${encodeURIComponent(content)}`;
  return httpRequest("POST", `${endpoint}?${query}`, {
    headers: {
      Authorization: client.getHttpHeader(Module.HttpRequestType.Post, `${endpoint}?${query}`, "", false)
    },
    data: query
  });
}

function refresh(content: string) {
  var endpoint = "https://api.twitter.com/1.1/statuses/home_timeline.json"
  return httpRequest("GET", endpoint, {
    headers: {
      Authorization: client.getHttpHeader(Module.HttpRequestType.Get, `${endpoint}`, "", false)
    }
  });
}

var stream: MSStream;
function startStream() {
  var endpoint = "https://userstream.twitter.com/1.1/user.json";
  return httpRequest("GET", endpoint, {
    headers: {
      Authorization: client.getHttpHeader(Module.HttpRequestType.Get, `${endpoint}`, "", false)
    },
    responseType: "ms-stream",
    respondingState: 3
  }).then((response) => {
    stream = response;
    return stream;
  });
}

function readStream(count = 1000) {
  return new Promise<string>((resolve, reject) => {
    var reader = new MSStreamReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsText(stream, "UTF-8", count);
  });
}

function readStreamingTweets() {
  var buffer = "";
  var readOnce = () => readStream().then((content) => {
    var end = content.indexOf("\r");
    if (end !== -1) {
      output(buffer + content.slice(0, end));
      buffer = content.slice(end + 1);
    }
    else
      buffer += content;

    readOnce();
  });
  readOnce();
}

function output(content: string) {
  var div = document.createElement("div");
  div.textContent = content;
  tweetList.appendChild(div);
}