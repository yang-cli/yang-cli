/**
 * create a new project
 */
const fs = require('fs-extra')
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const fetch = require('node-fetch')
const { promisify } = require('util')
const download = promisify(require('download-git-repo'))
const ora = require('ora')

const getRepos = async () => {
  const { template } = await inquirer.prompt([{
    name: 'template',
    type: 'list',
    message: 'Please choose a template to create project:',
    choices: ['vue3-template']
  }])
  return template
}

const getRepoTags = async (repo) => {
  const tags = (await fetch(`https://api.github.com/repos/yang-cli/${repo}/tags`)
    .then(res => res.json()))
    .map(item => item.name)
  const { result } = await inquirer.prompt([{
    name: 'result',
    type: 'list',
    choices: ['master'].concat(tags),
    message: 'Please choose a tag'
  }])
  return result
}

const clone = async (repo, desc) => {
  // 使用ora 展示下载状态

  const spinner = ora(`下载${chalk.red(repo)}`).start()
  try {
    await download(repo, desc, { clone: true })
    spinner.succeed()
  } catch (e) {
    spinner.fail(chalk.red(e) + chalk.blue('<' + repo + '>'))
  }
}

const getPKGManager = async () => {
  const { tool } = await inquirer.prompt([{
    name: 'tool',
    type: 'list',
    choices: ['npm', 'yarn'],
    message: 'Please choose pkg manager'
  }])
  return tool
}

const spawn = async (...args) => {
  console.log()
  const { spawn } = require('child_process')
  return new Promise(resolve => {
    const childProcess = spawn(...args)
    childProcess.stderr.pipe(process.stderr)
    childProcess.stdout.pipe(process.stdout)
    childProcess.on('close', () => resolve())
  })
}

module.exports = async function (name, options) {
  console.log('>>> create.js:', name, options)
  // 获取创建目录的绝对路径
  const targetPath = path.join(process.cwd(), name)

  if (await fs.pathExists(targetPath)) {
    const answer = options.force ? { overwrite: true } : await inquirer.prompt([{
      name: 'overwrite',
      type: 'confirm',
      message: `Target directory ${chalk.blue(targetPath)} already exists, do you want to overwrite it? `,
      default: true
    }])
    answer.overwrite ? await fs.remove(targetPath) : process.exit(0)
  }

  const repo = await getRepos()
  const tag = await getRepoTags(repo)
  const pkg = await getPKGManager()
  await clone(`github:yang-cli/${repo}${(tag && tag !== 'master') ? '#' + tag : ''}`, name)
  await spawn(pkg, ['install'], { cwd: targetPath })
  console.log()
  console.log(`
🤡 Successfully created project ${chalk.green(name)}
👉 Get started with the following commands:

$ ${chalk.cyan('cd ' + name)}

$ ${chalk.cyan(pkg + ' serve')}

  `)
}