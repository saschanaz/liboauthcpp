/// <reference path="../ts-declaration/liboauthcpp.d.ts" />

interface HttpRequestOptions {
  headers?: any;
  responseType?: any;
  data?: any;
}

function httpRequest(method: string, url: string, options?: HttpRequestOptions) {
  return new Promise<string>((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => resolve(xhr.response);
    xhr.onerror = (err) => reject(err);
    xhr.open(method, url);

    if (options && typeof options.responseType === "string")
      xhr.responseType = options.responseType;

    if (options && "headers" in options) {
      for (var fieldname in options.headers) {
        xhr.setRequestHeader(fieldname, options.headers[fieldname]);
      }
    }

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