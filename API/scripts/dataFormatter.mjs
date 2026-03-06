import chalk from 'chalk';
import inquirer from 'inquirer';
import { readdirSync, readFileSync, writeFileSync } from 'fs';

const dir = 'src/assets';
let files;

try {
  files = readdirSync(dir, (_, dirFiles) => {
    return dirFiles;
  });
  files = files.filter((dirFile) => !dirFile.includes('formated'));
} catch (err) {
  console.log(chalk.red('💥 Error when reading directory'));
  process.exit();
}

if (!files.length) {
  console.log(chalk.red('💥 Nothing to format'));
  process.exit();
}

inquirer
  .prompt([
    {
      name: 'file',
      message: 'What file do you want to format?',
      type: 'list',
      choices: files,
    },
  ])
  .then((answers) => {
    const filePath = `${dir}/${answers.file}`;
    console.log(filePath);
    const fileDestinationPath = `${dir}/${answers.file.replace(
      '.json',
      '',
    )}-formated.json`;

    const rawData = readFileSync(filePath);

    const data = JSON.parse(rawData);

    const formatedArray = JSON.stringify(
      data.filter((word) => !word.match(/\s/)),
    );

    writeFileSync(fileDestinationPath, formatedArray);
  })
  .catch((err) => {
    console.log(err);
    console.log(chalk.red('💥 Error when processing answer'));
    process.exit();
  });
