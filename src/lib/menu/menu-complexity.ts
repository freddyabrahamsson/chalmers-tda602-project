import inquirer from 'inquirer';
import {ObfuscationState} from '../repository';
import {Repository} from '../repository';
import {getMenuSlug, menuNames} from './menu-utils';

/**
 * Complexity menu.
 *
 * @param {Repository} repo Repo to work on.
 */
export default async function complexityCompute(repo:Repository) {
  const menuItems = [
    {name: 'Compute all', slug: 'compAll'},
    {name: 'Compute original complexity', slug: 'compOriginal'},
    {name: 'Compute obfuscated complexity', slug: 'compObfuscated'},
    {name: 'Compute deobfuscated complexity', slug: 'compDeobfuscated'},
    {name: 'Go back', slug: 'compGoBack'},
  ];
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    loop: false,
    message: 'Which state would you like to record the complexity for?',
    choices: menuNames(menuItems),
  }]);
  const slug = getMenuSlug(menuItems, answer.action);
  switch (slug) {
    case 'compOriginal':
      repo.recordComplexity(ObfuscationState.Original);
      break;
    case 'compObfuscated':
      repo.recordComplexity(ObfuscationState.Obfuscated);
      break;
    case 'compDeobfuscated':
      repo.recordComplexity(ObfuscationState.Deobfuscated);
      break;
    case 'compAll':
      repo.recordComplexity(ObfuscationState.Original);
      repo.recordComplexity(ObfuscationState.Obfuscated);
      repo.recordComplexity(ObfuscationState.Deobfuscated);
      break;
    default:
      break;
  }
}
