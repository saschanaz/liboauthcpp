/// <reference path="ts-definitions/node-0.10.d.ts" />
/// <reference path="ts-definitions/jake.d.ts" />
var fs = require("fs");
var cc = "emcc";
var flags = '-O2 --memory-init-file 0 -s NO_FILESYSTEM="1" -s NO_BROWSER="1" -s MODULARIZE="1" -s EXPORT_NAME="_liboauthcpp" -std=c++11 -I ../include -D SHA1_LITTLE_ENDIAN';
var sourceDirectory = "../src";
var subcomponents = ["base64", "HMAC_SHA1", "SHA1", "urlencode"];
var lib = "liboauthcpp";
function subcomponentFiles(fileExtension) {
    return subcomponents.map(function (item) { return (item + "." + fileExtension); });
}
//function nodeBtoa(input: string) {
//  return new Buffer('' + input, 'binary').toString("base64");
//}
function definingCommand(definitions) {
    var subcommands = [];
    for (var key in definitions)
        subcommands.push("-D " + key + "=\"" + definitions[key] + "\"");
    return subcommands.join(' ');
}
desc("Compiles subcomponents");
task("subcomponent", function () {
    var files = subcomponentFiles("cpp");
    var count = 0;
    files.forEach(function (item) {
        jake.exec([(cc + " " + flags + " -c " + sourceDirectory + "/" + item)], { printStdout: true, printStderr: true }, function () {
            count++;
            if (count === files.length)
                complete();
        });
    });
}, { async: true });
desc("Compiles liboauthcpp.cpp");
task("lib", function () {
    if (!fs.existsSync("apptoken.json")) {
        throw new Error("Please give apptoken.json as a key-value object. ( { key: YOURKEY, secret: YOURSECRET } )");
    }
    var apptoken;
    try {
        apptoken = JSON.parse(fs.readFileSync("apptoken.json").toString());
    }
    catch (e) {
        throw new Error("Incorrect json format in apptoken.json file.");
    }
    if (!apptoken.key || !apptoken.secret)
        throw new Error("apptoken.json must have `key` and `secret` property.");
    console.log("Jake received key and secret");
    var definitions = { CONSUMER_KEY: apptoken.key, CONSUMER_SECRET: apptoken.secret };
    //if ("buildNonce" in params) {
    //  definitions["BUILD_NONCE"] = nodeBtoa(Math.random().toString());
    //}
    //else {
    //  console.log("No buildNonce parameter is detected. Tokens will be untouched.");
    //}
    jake.exec([(cc + " --bind " + flags + " -c " + sourceDirectory + "/" + lib + ".cpp " + definingCommand(definitions))], { printStdout: true, printStderr: true }, function () {
        complete();
    });
}, { async: true });
desc("Builds a JavaScript OAuth component.");
task("default", ["subcomponent", "lib"], function () {
    jake.exec([(cc + " --bind " + flags + " -o " + lib + ".js " + lib + ".o " + subcomponentFiles("o").join(' '))], { printStdout: true, printStderr: true }, function () {
        console.log("liboauthcpp is built successfully.");
        complete();
    });
}, { async: true });