import fs from 'fs';
import inquirer from 'inquirer';
import {OBF_PROFILES_PATH} from '../../config';
import {ObfProfile} from '../obf-profile';
import {getMenuSlug, menuNames} from './menu-utils';

/**
 * Get a profile to set.
 * @return {string} path to the profile.
 */
export default async function setObfProfile(): Promise<ObfProfile> {
  const menuItems = [
    {name: 'Create a new obfuscation profile', slug: 'obfProfileAdd'},
    {name: 'Load an obfuscation profile', slug: 'obfProfileLoad'},
    {name: 'Go back', slug: 'obfProfileGoBack'},
  ];
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    loop: false,
    message: 'Obfuscation profile menu',
    choices: menuNames(menuItems),
  }]);
  const slug = getMenuSlug(menuItems, answer.action);
  switch (slug) {
    case 'obfProfileLoad':
      return await loadObfProfile();
    default:
      return null;
  }
}

/**
 * Choose an
 * @return {string} name of the chosen profile.
 */
export async function loadObfProfile():Promise<ObfProfile> {
  const profiles = fs.readdirSync(OBF_PROFILES_PATH);
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'profile',
    loop: false,
    message: 'Choose an obfuscation profile.',
    choices: profiles,
  }],
  );
  const profileName = answer.profile;
  return new ObfProfile(profileName);
}
