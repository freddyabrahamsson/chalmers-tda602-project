import {Repository} from './repository';
import inquirer from 'inquirer';
import {getMenuSlug, menuNames, showWarning} from './menu/menu-utils';
import setRepo from './menu/menu-repo';
import setObfProfile from './menu/menu-obf-profile';
import obfGeneration from './menu/menu-obfuscation';
import complexityCompute from './menu/menu-complexity';
import testsRun from './menu/menu-tests';

/**
 * Main class.
 */
export default class ObfuscationAnalyser {
  repo: Repository;

  menuItems = [
    {name: 'Generate (de)obfuscated code or download original',
      slug: 'obfGeneration'},
    {name: 'Compute complexity', slug: 'complexityCompute'},
    {name: 'Run tests', slug: 'testsRun'},
    {name: 'Set the current repository', slug: 'repoSet'},
    {name: 'Set obfuscation profile', slug: 'obfProfileSet'},
    {name: 'Exit application', slug: 'exit'},
  ];


  /**
   * Default constructor
   */
  constructor() {
    return;
  }


  /**
   * Run the main menu.
   */
  async run() {
    console.clear();
    while (true) {
      let repoName = 'Undefined';
      let obfProfile = 'Undefined';
      if (this.repo != null) {
        repoName = this.repo.name;
        if (this.repo.obfProfile != null) {
          obfProfile = this.repo.obfProfile.name;
        }
      }
      const answer = await inquirer.prompt([{
        type: 'list',
        name: 'action',
        loop: false,
        message:
      `Main menu, repo: ${repoName}` +
      `, obfProfile: ${obfProfile}`,
        choices: menuNames(this.menuItems),
      }]);
      console.clear();
      const slug = getMenuSlug(this.menuItems, answer.action);
      switch (slug) {
        case 'obfGeneration':
          if (this.repo == null) {
            showWarning('No repository has been set!');
            break;
          } else if (this.repo.obfProfile == null) {
            showWarning('No obfuscation profile has been set!');
            break;
          }
          await obfGeneration(this.repo);
          break;
        case 'complexityCompute':
          if (this.repo == null) {
            showWarning('No repo has been set!');
            break;
          }
          await complexityCompute(this.repo);
          break;
        case 'repoSet':
          const newRepo = await setRepo();
          if (newRepo != null) {
            this.repo = newRepo;
          }
          break;
        case 'obfProfileSet':
          if (this.repo == null) {
            showWarning('You must choose a repository first.');
            break;
          }
          const newProfile = await setObfProfile();
          if (newProfile != null) {
            this.repo.obfProfile = newProfile;
          }
          break;
        case 'testsRun':
          if (this.repo == null) {
            showWarning('Set repo first.');
            break;
          } else if (this.repo.obfProfile == null) {
            showWarning('Set profile first.');
            break;
          }
          await testsRun(this.repo);
          break;
        case 'exit':
          return;
        default:
          console.log('Not yet implemented.');
          break;
      }
    }
  }
}
