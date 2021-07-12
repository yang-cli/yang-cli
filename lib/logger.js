const chalk = require('chalk')
const format = require('util').format
const prefix = 'yang-cli'
const sep = chalk.gray('·')

exports.log = function (...args) {
  const context = format.apply(format, args)
  console.log(chalk.cyan(prefix), sep, chalk.white(context))
}

exports.fatal = function (...args) {
  if (args[0] instanceof Error) args[0] = args[0].message.trim()
  const context = format.apply(format, args)
  console.error(chalk.red(prefix), sep, chalk.white(context))
  process.exit(1)
}


exports.logo = function (name) {
  console.log(chalk.green(require('figlet').textSync(name, {
    font: 'Standard',
    horizontalLayout: 'default',
    verticalLayout: 'default',
    width: 80,
    whitespaceBreak: true
  })))
}