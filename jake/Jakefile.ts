/// <reference path="ts-definitions/node-0.10.d.ts" />
/// <reference path="ts-definitions/jake.d.ts" />

var cc = "emcc";
var flags = "-O2 --memory-init-file 0 -std=c++11 -I ../include -D SHA1_LITTLE_ENDIAN";
var sourceDirectory = "../src";
var subcomponents = ["base64", "HMAC_SHA1", "SHA1", "urlencode"];
var lib = "liboauthcpp";
function subcomponentFiles(fileExtension: string) {
  return subcomponents.map((item) => `${item}.${fileExtension}`);
}

//function nodeBtoa(input: string) {
//  return new Buffer('' + input, 'binary').toString("base64");
//}

function definingCommand(definitions: { [key: string]: string }) {
  var subcommands: string[] = [];
  for (var key in definitions)
    subcommands.push(`-D ${key}="${definitions[key]}"`);

  return subcommands.join(' ');
}

desc("Compiles subcomponents");
task("subcomponent", function () {
  var files = subcomponentFiles("cpp");
  var count = 0;
  files.forEach((item) => {
    jake.exec([`${cc} ${flags} -c ${sourceDirectory}/${item}`], { printStdout: true, printStderr: true }, function () {
      count++;
      if (count === files.length)
        complete();
    });
  });
}, { async: true });

desc("Compiles liboauthcpp.cpp");
task("lib", function () {
  if (!("key" in process.env && "secret" in process.env)) {
    throw new Error("Please give consumer_key and consumer_secret as a key-value object. ( key=YOURKEY, secret=YOURSECRET )");
  }

  console.log("Jake received key and secret");

  var definitions: { [key: string]: string } = { CONSUMER_KEY: process.env.key, CONSUMER_SECRET: process.env.secret };
  //if ("buildNonce" in params) {
  //  definitions["BUILD_NONCE"] = nodeBtoa(Math.random().toString());
  //}
  //else {
  //  console.log("No buildNonce parameter is detected. Tokens will be untouched.");
  //}
  
  jake.exec([`${cc} --bind ${flags} -c ${sourceDirectory}/${lib}.cpp ${definingCommand(definitions) }`], { printStdout: true, printStderr: true }, function () {
    complete();
  });
}, { async: true });

desc("Builds a JavaScript OAuth component.");
task("default", ["subcomponent", "lib"], function () {
  jake.exec([`${cc} --bind ${flags} -o ${lib}.js ${lib}.o ${subcomponentFiles("o").join(' ')}`], { printStdout: true, printStderr: true }, function () {
    console.log("liboauthcpp is built successfully.");
    complete();
  })
}, { async: true });