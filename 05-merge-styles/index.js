const { stderr } = process;
const fs = require("fs");
const path = require("path");

const sourceFolderPath = path.join(__dirname, "styles");
const destinationFolderPath = path.join(__dirname, "project-dist");
const destinationFilePath = path.join(destinationFolderPath, "bundle.css")

const output = fs.createWriteStream(destinationFilePath);

fs.access(sourceFolderPath, fs.constants.F_OK | fs.constants.R_OK, accessCallback);

function accessCallback(error) {
  if (error) {
    stderr.write(`Error: ${error.message}`);
  } else {
    fs.readdir(sourceFolderPath, { withFileTypes: true}, readdirCallback);
  }
}

function readdirCallback(error, dirents) {
  if (error) {
    stderr.write(`Error: ${error.message}`);
  } else {
    let index = 0;
    const size = dirents.filter((dirent) => path.extname(dirent.name) === ".css").length - 1;
    dirents.forEach((dirent) => {
      if (dirent.isFile()) {
        if (path.extname(dirent.name) === ".css") {
          const readStream = fs.createReadStream(path.join(sourceFolderPath, dirent.name), { encoding: "utf-8"});
          let data = "";
          readStream.on("data", (chunk) => (data += chunk));
          readStream.on("end", () => {
            if (index < size) {
              data += "\n";
            }
            output.write(data);
            index += 1;
          });
        }
      }
    });
  }
}