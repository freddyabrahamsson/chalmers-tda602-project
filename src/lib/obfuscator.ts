import fs from 'fs';
import JSObfuscator from 'javascript-obfuscator';
import {TInputOptions} from
  'javascript-obfuscator/typings/src/types/options/TInputOptions';
import {Deobfuscator} from 'deobfuscator';

/**
 * Obfuscates all files found in 'srcDir' with output placed in 'targetDir'.
 *
 * Preserves the directory structure.
 *
 * @param {string} srcDir path to source directory.
 * @param {string} destDir path to target directory.
 * @param {TInputOptions} opts options to the obfuscator.
 */
export async function obfDir(
    srcDir:string, destDir:string, opts?: TInputOptions):Promise<void> {
  if (typeof opts == undefined) {
    opts = {};
  }

  const transform = async (sourceCode:string) => {
    const obfuscated = JSObfuscator.obfuscate(sourceCode, opts);
    return obfuscated.getObfuscatedCode();
  };

  await transformRec(srcDir, destDir, transform);
  return;
}


/**
 * Deobfuscate all code in a src dir.
 * @param {string} srcDir path to the src dir.
 * @param {string} destDir path to the destination.
 */
export async function deobfDir(srcDir:string, destDir:string):Promise<void> {
  const transform = async (sourceCode:string) => {
    const deobfuscator = new Deobfuscator();
    const deobfuscated = await deobfuscator.deobfuscateSource(sourceCode);
    return deobfuscated;
  };
  await transformRec(srcDir, destDir, transform);
  return;
}

/**
 * Applies the transformation to all files within a directory. Writes each
 * transformed file into the destination directory with preserved directory
 * structure.
 * @param {string} srcDir source directory
 * @param {string} destDir destination directory
 * @param {function} transform transform to apply to each file in the directory
 */
async function transformRec(srcDir:string, destDir:string,
    transform:(code:string) => Promise<string>):Promise<void> {
  fs.mkdirSync(destDir, {recursive: true});
  const srcFiles = fs.readdirSync(srcDir);

  srcFiles.forEach(async (fName) => {
    const srcFile = `${srcDir}/${fName}`;
    const destFile = `${destDir}/${fName}`;

    if (fs.statSync(srcFile).isDirectory()) {
      await transformRec(srcFile, destFile, transform);
    } else {
      const sourceCode = fs.readFileSync(srcFile).toString();
      const destCode = await transform(sourceCode);
      fs.writeFileSync(destFile, destCode);
    }
    return;
  },
  );
}
