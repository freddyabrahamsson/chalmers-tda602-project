import fs from 'fs';
import inquirer from 'inquirer';
import {REPO_CONF_PATH} from '../../config';
import {Repository} from '../repository';
import {getMenuSlug, menuNames} from './menu-utils';

/**
 * Get a repository to set.
 * @return {Repository} a repo.
 */
export default async function setRepo():Promise<Repository> {
  const menuItems = [
    {name: 'Add new repository', slug: 'repoAdd'},
    {name: 'Load existing repository', slug: 'repoLoad'},
    {name: 'Go back', slug: 'repoGoBack'},
  ];
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'action',
    loop: false,
    message: 'Repository menu',
    choices: menuNames(menuItems),
  }]);
  const slug = getMenuSlug(menuItems, answer.action);
  switch (slug) {
    case 'repoAdd':
      return await addRepo();
    case 'repoLoad':
      return await loadRepo();
    default:
      return null;
  }
}

/**
 * Lets the user choose from stored repos.
 *
 */
export async function addRepo(): Promise<Repository> {
  const repoConf = await inquirer.prompt([
    {
      type: 'input',
      name: 'repoName',
      message: 'Enter a name for the repo: ',
    },
    {
      type: 'input',
      name: 'repoSrcDir',
      message: 'Enter the name of the source code directory: ',
    },
    {
      type: 'input',
      name: 'repoRemote',
      message: 'Enter a url for the remote repo: ',
    },
    {
      type: 'confirm',
      name: 'saveToFile',
      message: 'Would you like to save the config?',
      default: true,
    },

  ]);
  const repo = new Repository(
      repoConf.repoName, repoConf.repoSrcDir, repoConf.repoRemote,
  );
  if (repoConf.saveToFile) {
    const fileConf = await inquirer.prompt([{
      type: 'input',
      name: 'fileName',
      message: 'Enter a name for the config file',
      default: `${repoConf.repoName}.json`,
    }]);
    repo.writeToFile(`${REPO_CONF_PATH}/${fileConf.fileName}`);
  }
  return repo;
}

/**
 * Load an existing repository.
 * {Repository} @return a repository
 */
export async function loadRepo(): Promise<Repository> {
  const repos = fs.readdirSync(REPO_CONF_PATH);
  const answer = await inquirer.prompt([{
    type: 'list',
    name: 'repo',
    message: 'Choose a repo.',
    choices: repos,
  }]);
  const confPath = `${REPO_CONF_PATH}/${answer.repo}`;
  return Repository.fromConfig(confPath);
}
