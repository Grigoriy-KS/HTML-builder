const { stderr } = process;
const fs = require("fs");
const path = require("path");

// const sourceFolderPath = path.join(__dirname, "components");
const destinationProjectFolderPath = path.join(__dirname, "project-dist");

fs.rm(destinationProjectFolderPath, 
  { force: true, recursive: true }, 
  (error) => {
    if (error) {
      stderr.write(`Error: ${error.message}`);
    } else {
      fs.mkdir(destinationProjectFolderPath,
        { recursive: true },
        projectmkdirCallback
      );
    }
  }
)

function projectmkdirCallback() {
  assembleFromComponents(path.join(__dirname, "template.html"), path.join(__dirname, "components"), path.join(destinationProjectFolderPath, "index.html"));
  assembleFromStyleComponents(path.join(__dirname, "styles"), path.join(destinationProjectFolderPath, "style.css"));
  copyDirectoryHelper(path.join(__dirname, "assets"), path.join(destinationProjectFolderPath, "assets"));
}

function assembleFromComponents(templatePath, componentsPath, destinationFilePath) {
  const templateStream = fs.createReadStream(templatePath, {encoding: "utf-8"});
  const destinationFileStream = fs.createWriteStream(destinationFilePath);
  let data = "";
  templateStream.on("data", (chunk) => data += chunk);
  templateStream.on("end", () => {
    const regexp = /{{[\w]+}}/g;
    const componentNames = new Set(data.match(regexp).map((element) => element.replace("{{", "").replace("}}", "")));
    const componentSize = componentNames.size;
    let index = 0;
    componentNames.forEach((element) => {
      const componentStream = fs.createReadStream(path.join(componentsPath, element + ".html"), { encoding: "utf-8" });
      let componentData = "";
      componentStream.on("data", (chunk) => componentData += chunk);
      componentStream.on("end", () => {
        data = data.replace(`{{`+ element +`}}`, componentData);
        index += 1;
        if (index == componentSize) {
          destinationFileStream.write(data);
        }
      });
    });
  });
}

function assembleFromStyleComponents(sourceFolderPath, destinationFilePath) {
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
  }

function copyDirectoryHelper(sourceFolderPath, destinationFolderPath) {  
  fs.rm(destinationFolderPath, 
    { force: true, recursive: true }, 
    (error) => {
      if (error) {
        stderr.write(`Error: ${error.message}`);
      } else {
        fs.mkdir(destinationFolderPath,
          { recursive: true },
          mkdirCallback
        );
      }
    }
  )
  
  function mkdirCallback(error) {
    if (error) {
      stderr.write(`Error: ${error.message}`);
    } else {
      fs.readdir(sourceFolderPath, { withFileTypes: true}, readdirCallback)
    }
  }
  
  function readdirCallback(error, dirents) {
    if (error) {
      stderr.write(`Error: ${error.message}`);
    } else {
      for (const dirent of dirents) {
        if (dirent.isFile()) {
          fs.copyFile(path.join(sourceFolderPath, dirent.name),
          path.join(destinationFolderPath, dirent.name),
          copyFileCallback
        );
        } else if (dirent.isDirectory()) {
          copyDirectoryHelper(path.join(sourceFolderPath, dirent.name), path.join(destinationFolderPath, dirent.name));
        }
      }
    }
  }

  function copyFileCallback(error) {
    if (error) {
      stderr.write(`Error: ${error.message}`);
    }
  }
}
