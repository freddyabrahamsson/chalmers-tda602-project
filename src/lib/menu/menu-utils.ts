import inquirer from 'inquirer';
import {MenuItem} from '../interfaces';
import chalk from 'chalk';

/**
 * Get a list of all menu names.
 * @param {string} menuItems List of menu items.
 * @return {Array} list of the menuNames
 */
export function menuNames(menuItems:Array<MenuItem>):Array<string> {
  return menuItems.map((i) => {
    return i.name;
  });
}

/**
 *
 * @param {Array<MenuItem>} menuItems list of menu items.
 * @param {string} name name of the menu item.
 * @return {string} the slug for the matching item.
 */
export function getMenuSlug(menuItems:Array<MenuItem>, name:string) {
  const menuItem = menuItems.filter((i) => i.name == name);
  return menuItem[0].slug;
}

/**
 *
 * @param {string} question Qustion to the user.
 * @param {boolean} defAns Default answer.
 * @return {boolean}The answer
 * */
export async function yesNo(question:string, defAns:boolean):Promise<boolean> {
  const questions = [{
    type: 'confirm',
    name: 'confirmed',
    message: question,
    default: defAns,
  }];
  const answers = await inquirer.prompt(questions);
  console.log(answers);
  return answers.confirmed;
}

/**
 * Show a warning in red.
 * @param {string} message warning message.
 */
export function showWarning(message: string):void {
  console.warn(chalk.red(message));
}
