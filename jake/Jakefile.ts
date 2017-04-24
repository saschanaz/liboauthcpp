import * as mz from "mz/fs";

const jakeExecOptionBag = {
  printStdout: true,
  printStderr: true
};

function asyncExec(cmds: string[]) {
  return new Promise((resolve, reject) => {
    try {
      jake.exec(cmds, () => resolve(), jakeExecOptionBag)
    }
    catch (e) {
      reject(e);
    }
  });
}

const cc = "emcc";
const flags = '-O2 --memory-init-file 0 -s NO_FILESYSTEM="1" -s MODULARIZE="1" -s EXPORT_NAME="_liboauthcpp" -std=c++11 -I ../include -D SHA1_LITTLE_ENDIAN';
const sourceDirectory = "../src";
const subcomponents = ["base64", "HMAC_SHA1", "SHA1", "urlencode"];
const lib = "liboauthcpp";
function subcomponentFiles(fileExtension: string) {
  return subcomponents.map(item => `${item}.${fileExtension}`);
}

//function nodeBtoa(input: string) {
//  return new Buffer('' + input, 'binary').toString("base64");
//}

function definingCommand(definitions: { [key: string]: string }) {
  const subcommands: string[] = [];
  for (const key in definitions) {
    subcommands.push(`-D ${key}="${definitions[key]}"`);
  }

  return subcommands.join(' ');
}

desc("Compiles subcomponents");
task("subcomponent", async () => {
  const files = subcomponentFiles("cpp");
  await Promise.all(files.map(item => asyncExec([`${cc} ${flags} -c ${sourceDirectory}/${item}`])));
});

desc("Compiles liboauthcpp.cpp");
task("lib", async () => {
  if (!await mz.exists("apptoken.json")) {
    throw new Error("Please give apptoken.json as a key-value object. ( { key: YOURKEY, secret: YOURSECRET } )");
  }

  let apptoken: { key: string; secret: string };
  try {
    apptoken = JSON.parse(await mz.readFile("apptoken.json", "utf8"))
  }
  catch (e) {
    throw new Error("Incorrect json format in apptoken.json file.");
  }
  if (!apptoken.key || !apptoken.secret) {
    throw new Error("apptoken.json must have `key` and `secret` property.");
  }

  console.log("Jake received key and secret");

  const definitions: { [key: string]: string } = { CONSUMER_KEY: apptoken.key, CONSUMER_SECRET: apptoken.secret };
  //if ("buildNonce" in params) {
  //  definitions["BUILD_NONCE"] = nodeBtoa(Math.random().toString());
  //}
  //else {
  //  console.log("No buildNonce parameter is detected. Tokens will be untouched.");
  //}

  await asyncExec([`${cc} --bind ${flags} -c ${sourceDirectory}/${lib}.cpp ${definingCommand(definitions)}`]);
});

desc("Builds a JavaScript OAuth component.");
task("default", ["subcomponent", "lib"], async () => {
  await asyncExec([`${cc} --bind ${flags} -o ${lib}.js ${lib}.o ${subcomponentFiles("o").join(' ')}`]);
  
  const compiled = await mz.readFile(`${lib}.js`, "utf8");
  const license = await mz.readFile("../LICENSE", "utf8");
  
  await mz.writeFile(`${lib}.js`, `/*\n${license}*/\n\n${compiled}`);
  console.log("liboauthcpp is built successfully.");
});