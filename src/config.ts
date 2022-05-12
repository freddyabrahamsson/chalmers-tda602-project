import process from 'process';
import 'dotenv/config';


const BASE_PATH = process.cwd();
const CONFIG_PATH = `${BASE_PATH}/config`;

export const OBF_PROFILES_PATH = `${CONFIG_PATH}/obfuscation-profiles`;
export const REPO_CONF_PATH = `${CONFIG_PATH}/repos`;

export const REPO_STORAGE_PATH = process.env.OBF_ANALYSER_REPO_STORAGE;

export enum ObfuscationState {
    Original,
    Obfuscated,
    Deobfuscated
}
