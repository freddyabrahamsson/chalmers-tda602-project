import fs from 'fs';

/**
 * Generate paths to all files in a directory.
 *
 * @param {string} path path to the directory.
 * @return {Array} Paths to all files within this directory.
 */
export function listFilesRecursively(path:string):Array<string> {
  const dirContent = fs.readdirSync(path);
  const outputFiles = [];
  dirContent.forEach((fName) => {
    const fPath = `${path}/${fName}`;
    if (fs.statSync(fPath).isDirectory()) {
      outputFiles.concat(listFilesRecursively(fPath));
    } else {
      outputFiles.push(fPath);
    }
  });
  return outputFiles;
}
