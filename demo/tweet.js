/// <reference path="../ts-declaration/liboauthcpp.d.ts" />

const { default: fetch } = require("node-fetch");
const yargs = require("yargs");
/** @type {liboauthcpp} */
const oauth = require("../jake/liboauthcpp.js")();

function initLiboauthcpp() {
  return new Promise(resolve => {
    oauth.then(() => resolve());
  })
}

async function main() {
  await initLiboauthcpp();
  const { argv } = yargs;
  if (typeof argv.key !== "string" || typeof argv.secret !== "string") {
    throw new Error("No key/secret provided");
  }
  if (typeof argv.content !== "string") {
    throw new Error("No tweet content");
  }
  const client = new oauth.Client(new oauth.Token(argv.key, argv.secret));
  await tweet(client, argv.content);
}
main();

/**
 * Post a tweet
 * @param {liboauthcpp.Client} client client object
 * @param {string} content tweet content
 */
async function tweet(client, content) {
  const endpoint = "https://api.twitter.com/1.1/statuses/update.json";
  const query = `status=${encodeURIComponent(content)}`;
  const response = await fetch(`${endpoint}?${query}`, {
    method: "POST",
    headers: {
      Authorization: client.getHttpHeader(oauth.HttpRequestType.Post, `${endpoint}?${query}`, "", false)
    },
    body: query
  });
  return await response.json();
}

