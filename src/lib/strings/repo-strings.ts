/* eslint-disable require-jsdoc */
/**
 * Constant strings and string generators for the Repository class.
 */
export default class RepoStrings {
  static NO_ORIGINAL =
    'Obfuscated version can not be generated without original.';
  static NO_OBF =
    'Deobfuscated version can not be generated without obfuscated.';

  static confirmOverwrite(name:string):string {
    return 'Overwrite existing code in repo \'' + name + '\'?';
  }

  static downloadingInto(name:string, remote:string, local:string):string {
    return 'Downloading \'' +
    name + '\' from ' +
    remote + ' into ' +
    local + '.';
  }

  static downloadOriginalConfirm(name:string, remote:string):string {
    return 'Missing orignal code for repo \''+ name +
    '\'. Would you like to download from ' + remote + '?';
  }

  static generateObfConfirm(name:string):string {
    return 'Missing obfuscated vode for repo \'' + name +
    '\'. Would you like to generate the obfuscated code?\'';
  }

  static skippingDownload(name:string):string {
    return 'Skipping download for repo: ' + name;
  }
}
