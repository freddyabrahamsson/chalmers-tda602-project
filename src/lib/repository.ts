import fs from 'fs';
import {computeRepoComplexity} from './complexity';
import {REPO_STORAGE_PATH} from '../config';
import RS from './strings/repo-strings';
import simpleGit from 'simple-git';
import {obfDir, deobfDir} from './obfuscator';
import {yesNo} from './menu/menu-utils';
import {ObfProfile} from './obf-profile';
import {exec} from 'child_process';
import {promisify} from 'util';


export enum ObfuscationState {
    Original,
    Obfuscated,
    Deobfuscated
}

/**
 *
 */
export class Repository {
  name:string;
  srcDir:string;
  remote: string;
  obfProfile: ObfProfile;

  /**
   *
   * @param {string} name Name of the repo.
   * @param {string} srcDir Name of directory where source code is stored.
   * @param {string} remote url to the remote git repo.
   */
  constructor(name:string, srcDir:string, remote:string) {
    this.name = name;
    this.srcDir = srcDir;
    this.remote = remote;
  }

  /**
   * Reads a repo from a config file.
   *
   * @param {string} filePath path to the config.
   * @return {Repository} A new repository from the file.
   */
  static fromConfig(filePath:string): Repository {
    try {
      const rawdata = fs.readFileSync(filePath);
      const repoConf = JSON.parse(rawdata.toString());
      return new Repository(repoConf.name, repoConf.srcDir, repoConf.remote);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Writes the config to a json file.
   *
   * @param {string} filePath path to write to.
   */
  writeToFile(filePath:string):void {
    const fileContent = JSON.stringify(
        {name: this.name, srcDir: this.srcDir, remote: this.remote},
    );
    try {
      console.log('Writing ' + fileContent + ' to ' + filePath);
      fs.writeFileSync(filePath, fileContent);
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Path to this repository.
   */
  get repoPath():string {
    return `${REPO_STORAGE_PATH}/${this.name}`;
  }
  /**
   * Get the root directory used for this repository.
   */
  get profilePath():string {
    return `${this.repoPath}/${this.obfProfile.name}`;
  }

  /**
   * Get the path to the directory used for the original code.
   */
  get origPath():string {
    return `${this.repoPath}/original`;
  }

  /**
   * Get the path to the directory used for the obfuscated code.
   */
  get obfPath():string {
    return `${this.profilePath}/obfuscated`;
  }

  /**
   * Get the path to the directory used for the deobfuscated code.
   */
  get deobfPath():string {
    return `${this.profilePath}/deobfuscated`;
  }

  /**
   * Get path for statistics.
  */
  get statsPath():string {
    return `${this.profilePath}/stats`;
  }

  /**
   * Get the path for the complexity directory.
   */
  get complexitiesPath():string {
    return `${this.statsPath}/complexities`;
  }

  /**
   * Get path for test outputs.
   */
  get testPath():string {
    return `${this.statsPath}/tests`;
  }

  /**
   * Check if the original code for the repo exists.
   */
  get hasOriginal():boolean {
    let origExists:boolean = fs.existsSync(this.origPath);
    origExists &&= fs.readdirSync(this.origPath).length > 0;
    return origExists;
  }

  /**
   * Check if an obfuscated version of the code exists.
   */
  get hasObf():boolean {
    let origExists:boolean = fs.existsSync(this.obfPath);
    origExists &&= fs.readdirSync(this.obfPath).length > 0;
    return origExists;
  }

  /**
   * Check if a deobfuscated version of the code exists.
   */
  get hasDeobf():boolean {
    let origExists: boolean = fs.existsSync(this.deobfPath);
    origExists &&= fs.readdirSync(this.deobfPath).length > 0;
    return origExists;
  }

  /**
   * Check if the repo has a given state.
   *
   * @param {ObfuscationState} state state to check for.
   * @return {boolean} true if the state exists
   */
  private hasState(state:ObfuscationState) {
    switch (state) {
      case ObfuscationState.Original:
        return this.hasOriginal;
      case ObfuscationState.Obfuscated:
        return this.hasObf;
      case ObfuscationState.Deobfuscated:
        return this.hasDeobf;
      default:
        throw new Error('Unknown state:' + state);
    }
  }

  /**
   * Generate a bash script and runs tests on a given state.
   *
   * @param {ObfuscationState} state state to generate test script for
   */
  async recordTest(state:ObfuscationState):Promise<void> {
    if (! this.hasState(state)) {
      throw new Error('The state ' + state + ' does not exist for this repo.');
    }
    let testDir = this.testPath;
    let packageDir = '';
    switch (state) {
      case ObfuscationState.Original:
        packageDir = this.origPath;
        testDir += '/original';
        break;
      case ObfuscationState.Obfuscated:
        packageDir = this.obfPath;
        testDir += '/obfuscated';
        break;
      case ObfuscationState.Deobfuscated:
        packageDir = this.deobfPath;
        testDir += '/deobfuscated';
        break;
    }

    fs.mkdirSync(testDir, {recursive: true});
    const outputFile = `${testDir}/result.log`;
    const errorFile = `${testDir}/error.log`;

    const testScript =
      `cd ${packageDir} && ` +
      `npm install && ` +
      `$(npm test 2> ${errorFile} > ${outputFile})`;
    console.log('Running test.');
    try {
      await promisify(exec)(testScript);
      console.log('Finished test without errors.');
    } catch (error) {
      console.log('Test finished or crashed with errors.');
    }
    return;
  }


  /**
   * Records the complexity of the code in a given state.
   *
   * @param {ObfuscationState} state State where complexity should be recorded.
   */
  recordComplexity(state:ObfuscationState):void {
    let path:string;
    let fName = this.complexitiesPath;
    fs.mkdirSync(this.complexitiesPath, {recursive: true});

    switch (state) {
      case ObfuscationState.Original:
        path = `${this.origPath}/${this.srcDir}`;
        fName += '/original.json';
        break;
      case ObfuscationState.Obfuscated:
        path = `${this.obfPath}/${this.srcDir}`;
        fName += '/obfuscated.json';
        break;
      case ObfuscationState.Deobfuscated:
        path = `${this.deobfPath}/${this.srcDir}`;
        fName += '/deobfuscated.json';
        break;
      default:
        throw new Error(`Can not record complexity state: ${state}`);
    }

    const complexity = computeRepoComplexity(path);

    fs.writeFileSync(fName, JSON.stringify(complexity));
  }

  /**
   * Download the repository from the remote. Confirm before overwriting.
   */
  async downloadRepo():Promise<void> {
    fs.mkdirSync(this.origPath, {recursive: true});
    const git = simpleGit(this.origPath);

    const shouldDownload = await this.confirmWritable(this.hasOriginal);

    if (shouldDownload) {
      fs.rmSync(this.origPath, {recursive: true, force: true});
      fs.mkdirSync(this.origPath, {recursive: true});

      console.log(RS.downloadingInto(this.name, this.remote, this.origPath));
      await git.clone(this.remote, this.origPath);
    } else {
      console.log(RS.skippingDownload(this.name));
    }
    console.log('Installing dependencies.');
    await promisify(exec)(`cd ${this.origPath} && npm install`);
    console.log('Done.');
  }

  /**
   * Generate obfuscated code.
   */
  async generateObfuscated():Promise<void> {
    const shouldCreate = await this.confirmWritable(this.hasObf);

    if (!shouldCreate) {
      return;
    }

    process.stdout.write('Checking for original code...');
    if (shouldCreate) {
      if (!this.hasOriginal) {
        const getOriginal =
        await yesNo(RS.downloadOriginalConfirm(this.name, this.remote), false);
        if (getOriginal) {
          await this.downloadRepo();
        } else {
          console.log(RS.NO_ORIGINAL);
          return;
        }
      }
      console.log('Done!');

      const profileFile = `${this.statsPath}/profile.json`;
      fs.rmSync(this.obfPath, {recursive: true, force: true});
      fs.mkdirSync(this.statsPath, {recursive: true});
      fs.writeFileSync(profileFile, JSON.stringify(this.obfProfile.options));

      this.copyNonSrcCode(this.origPath, this.obfPath);

      process.stdout.write('Writing obfuscated files...');
      const origSrcDir = `${this.origPath}/${this.srcDir}`;
      if (fs.existsSync(origSrcDir)) {
        const obfSrcDir = `${this.obfPath}/${this.srcDir}`;
        obfDir(origSrcDir, obfSrcDir, this.obfProfile.options);
      }
      console.log('Done!');
    }
  }

  /**
   * Generate deobfuscated code from obfuscated code.
   */
  async generateDeobfuscated():Promise<void> {
    const shouldCreate = await this.confirmWritable(this.hasDeobf);

    if (!shouldCreate) {
      return;
    }

    process.stdout.write('Checking for obfuscated code...');
    if (!this.hasObf) {
      const getObf =
        await yesNo(RS.generateObfConfirm(this.name), false);
      if (getObf) {
        await this.generateObfuscated();
      } else {
        console.log(RS.NO_OBF);
        return;
      }
    }
    console.log('Done!');
    fs.rmSync(this.deobfPath, {recursive: true, force: true});
    this.copyNonSrcCode(this.obfPath, this.deobfPath);

    process.stdout.write('Writing deobfuscated files...');
    const obfSrcDir = `${this.obfPath}/${this.srcDir}`;
    if (fs.existsSync(obfSrcDir)) {
      const deobfSrcDir = `${this.deobfPath}/${this.srcDir}`;
      await deobfDir(obfSrcDir, deobfSrcDir);
    }
    console.log(('Done!'));
    return;
  }

  /**
   * Copy all files except the source code files.
   *
   * @param {string} srcDir source directory
   * @param {string} destDir destination directory
   */
  private copyNonSrcCode(srcDir:string, destDir:string):void {
    process.stdout.write('Copying non source files...');

    fs.mkdirSync(destDir, {recursive: true});
    const srcFiles = fs.readdirSync(srcDir);

    srcFiles.forEach((fName) =>{
      if (fName != this.srcDir) {
        const srcFile = `${srcDir}/${fName}`;
        const destFile = `${destDir}/${fName}`;
        console.log(`Copying ${srcFile} to ${destFile}`);
        fs.cpSync(srcFile, destFile, {recursive: true});
      }
    });

    console.log('Done!');
  }

  /**
   * Check for writability.
   *
   * @param {boolean} statePresent boolean indicating if state is present.
   * @return {boolean}true if write can go ahead.
   */
  private async confirmWritable(statePresent:boolean):Promise<boolean> {
    let shouldOverwrite = true;
    if (statePresent) {
      shouldOverwrite = await yesNo(RS.confirmOverwrite(this.name), false);
    }
    return shouldOverwrite;
  }
}
