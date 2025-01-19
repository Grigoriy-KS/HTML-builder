const { stdout, stderr } = process;
const fs = require("fs");
const path = require("path");

copyDirectoryHelper(path.join(__dirname, "files"), path.join(__dirname, "files-copy"));

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