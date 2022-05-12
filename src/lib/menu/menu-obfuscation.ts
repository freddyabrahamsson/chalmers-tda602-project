import inquirer from 'inquirer';
import {Repository} from '../repository';
import {menuNames, getMenuSlug} from './menu-utils';

/**
 * Obfuscation menu.
 *
 * @param {Repository} repo Repository to take action on.
 */
export default async function obfGeneration(
    repo:Repository) {
  const menuItems = [
    {name: 'Original code', slug: 'generateOrig'},
    {name: 'Obfuscate original', slug: 'generateObf'},
    {name: 'Deobfuscate obfuscated code', slug: 'generateDeobf'},
    {name: 'Go back', slug: 'obfGoBack'},
  ];
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    loop: false,
    message: 'Which state would you like to generate?',
    choices: menuNames(menuItems),
  }]);
  const slug = getMenuSlug(menuItems, answer.action);
  switch (slug) {
    case 'generateOrig':
      await repo.downloadRepo();
      break;
    case 'generateObf':
      await repo.generateObfuscated();
      break;
    case 'generateDeobf':
      await repo.generateDeobfuscated();
      break;
    default:
      return;
  }
}
