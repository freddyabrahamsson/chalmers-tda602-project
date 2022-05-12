import inquirer from 'inquirer';
import {ObfuscationState, Repository} from '../repository';
import {getMenuSlug, menuNames} from './menu-utils';

/**
 * Tests menu.
 * @param {Repository} repo repo to run test on.
 */
export default async function testsRun(repo:Repository):Promise<void> {
  const menuItems = [
    {name: 'Run tests on original', slug: 'testOriginal'},
    {name: 'Run tests on obfuscated', slug: 'testObfuscated'},
    {name: 'Run tests on deobfuscated', slug: 'testDeobfuscated'},
    {name: 'Run tests on obf/deobf', slug: 'testObfDeobf'},
    {name: 'Run tests on all', slug: 'testAll'},
    {name: 'Go back', slug: 'testGoBack'},
  ];
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    loop: false,
    message: 'Which test would you like to run?',
    choices: menuNames(menuItems),
  }]);
  const slug = getMenuSlug(menuItems, answer.action);
  let testOriginal = null;
  let testObfuscated = null;
  let testDeobfuscated = null;
  let all = null;
  switch (slug) {
    case 'testOriginal':
      await repo.recordTest(ObfuscationState.Original);
      return;
    case 'testObfuscated':
      await repo.recordTest(ObfuscationState.Obfuscated);
      return;
    case 'testDeobfuscated':
      await repo.recordTest(ObfuscationState.Deobfuscated);
      return;
    case 'testObfDeobf':
      testObfuscated = repo.recordTest(ObfuscationState.Obfuscated);
      testDeobfuscated = repo.recordTest(ObfuscationState.Deobfuscated);
      all = Promise.all([testOriginal, testObfuscated, testDeobfuscated]);
      await all;
      return;
    case 'testAll':
      testOriginal = repo.recordTest(ObfuscationState.Original);
      testObfuscated = repo.recordTest(ObfuscationState.Obfuscated);
      testDeobfuscated = repo.recordTest(ObfuscationState.Deobfuscated);
      all = Promise.all([testOriginal, testObfuscated, testDeobfuscated]);
      await all;
      return;
  }
}
