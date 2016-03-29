'use strict'
import _ from 'lodash'
import inquirer from 'inquirer'
import {join} from 'path'
import mkdirp from 'mkdirp'
import pify from 'pify'
import {readdir, readFile, writeFile} from 'fs'

const replaceFileNameWithVar = (fileName, answers) => {
  let name = fileName

  Object.keys(answers).forEach(answer => {
    name = name.replace(`__${answer}__`, answers[answer])
  })

  return name
}

module.exports = (cwd, argv) => {
  const {_: args} = argv
  const [templatePath] = args

  let answers = {}
    , files = []

  // ask questions from prompts.js
  return new Promise(resolve => {
    // create promptsFile path
    const promptsFile = join(cwd, 'templates', templatePath, 'prompts.js')

    /* eslint-disable global-require */
    inquirer.prompt(require(promptsFile), results => resolve(results))
    /* eslint-enable global-require */
  })
    .then(promptResults => {
      answers = promptResults
      return pify(mkdirp)(replaceFileNameWithVar(templatePath, answers))
    })
    .then(() => pify(readdir)(join(cwd, 'templates', templatePath)))
    .then(fileNames => {
      files = fileNames.filter(fileName => fileName !== 'prompts.js')
      return Promise.all(files.map(fileName =>
        pify(readFile)(join(cwd, 'templates', templatePath, fileName))
      ))
    })
    .then(tempFiles =>
      // complete templated file and write
      Promise.all(tempFiles.map((tempFile, index) => {
        const contents = _.template(tempFile.toString())(answers)
        const filePath = replaceFileNameWithVar(templatePath, answers)
        const fileName = replaceFileNameWithVar(files[index], answers)
        return pify(writeFile)(join(cwd, filePath, fileName), contents)
      }))
    )
}
