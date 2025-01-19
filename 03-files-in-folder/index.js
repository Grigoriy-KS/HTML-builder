const { stdout, stderr } = process;
const fs = require("fs");
const path = require("path");
const folderPath = path.join(__dirname, "secret-folder");

fs.access(folderPath, fs.constants.R_OK | fs.constants.W_OK, (error) => {
  if (error) {
    stderr.write(`Error: ${error.message}`);
  } else {
    fs.readdir(folderPath, { withFileTypes: true }, (error, files) => {
      if (error) {
        stderr.write(`Error: ${error.message}`);
      } else {
        for (const file of files) {
          if (file.isFile()) {
            const extension = path.extname(file.name);
            const name = path.basename(file.name, extension);
            fs.stat(path.join(folderPath, file.name), (error, stats) => {
              if (error) {
                stderr.write(`Error: ${error.message}`);
              } else {
                stdout.write(`${name} - ${extension.slice(1)} - ${stats.size}b\n`);
              }
            });
          } 
        }
      }
    });
  }
});