import chalk from "chalk";

export const logger = {
  error: (msg: string) => console.error(chalk.red(`✘ ${msg}`)),
  warn: (msg: string) => console.warn(chalk.yellow(`⚠ ${msg}`)),
  info: (msg: string) => console.log(chalk.cyan(`ℹ ${msg}`)),
  success: (msg: string) => console.log(chalk.green(`✓ ${msg}`)),
};
