import {TInputOptions} from
  'javascript-obfuscator/typings/src/types/options/TInputOptions';
import fs from 'fs';
import {OBF_PROFILES_PATH} from '../config';


/**
 * An obfuscation profile
 */
export class ObfProfile {
  name:string;
  options: TInputOptions;

  /**
   *
   * @param {string} filename path to file where config is stored.
   */
  constructor(filename) {
    this.name = filename.substring(0, filename.lastIndexOf('.'));
    this.options = JSON.parse(
        fs.readFileSync(`${OBF_PROFILES_PATH}/${filename}`).toString());
  }
}
