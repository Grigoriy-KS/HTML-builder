const { stdin, stdout } = process;
const fs = require("fs");
const path = require("path");
const readline = require("readline");

const writeStream = fs.createWriteStream(path.join(__dirname, "text.txt"));

const rl = readline.createInterface({ 
  input: stdin,
  output: stdout,
});
stdout.write("Hello!\nPlease enter something: \n");
rl.on("SIGINT", () => {
  rl.close();
});
rl.on("close", () => {
  stdout.write("Good luck learning Node.js!");
  writeStream.close();
});
let isFirstString = true;
rl.on("line", (data) => {
  if (data === "exit") {
    rl.close();
  } else {
    const applyNextString = isFirstString ? "" : "\n";
    writeStream.write(applyNextString + data);
    isFirstString = false;
  }
});