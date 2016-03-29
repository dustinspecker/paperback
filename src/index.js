'use strict'
import _ from 'lodash'
import inquirer from 'inquirer'
import {join} from 'path'
import mkdirp from 'mkdirp'
import pify from 'pify'
import {readdir, readFile, writeFile} from 'fs'

/**
 * Replace portions of fileName string matching a key of answers
 * with the value of that answers key.
 *
 * @param {String} fileName - fileName to replace with answers
 * @param {Object} answers - answers from prompts to replace values in fileName
 * @return {String} - replaced fileName
 */
const replaceFileNameWithVar = (fileName, answers) => {
  let name = fileName

  Object.keys(answers).forEach(answer => {
    const regex = new RegExp(`__${answer}__`, 'g')
    name = name.replace(regex, answers[answer])
  })

  return name
}

/**
 * Generate a file from a template after asking questions
 *
 * @param {String} cwd - the directory to look for the templatePath
 * @param {Object} argv - a process.argv like object
 * @return {Promise} - resolves when writing of template files finishes
 */
module.exports = (cwd, argv) => {
  const {_: args, templatePath = 'pages'} = argv
  const [templateFileName] = args

  let answers = {}
    , files = []

  // ask questions from prompts.js
  return new Promise(resolve => {
    // create promptsFile path
    const promptsFile = join(cwd, templatePath, templateFileName, 'prompts.js')

    /* eslint-disable global-require */
    inquirer.prompt(require(promptsFile), results => resolve(results))
    /* eslint-enable global-require */
  })
    .then(promptResults => {
      answers = promptResults
      return pify(mkdirp)(replaceFileNameWithVar(templateFileName, answers))
    })
    .then(() => pify(readdir)(join(cwd, templatePath, templateFileName)))
    .then(fileNames => {
      files = fileNames.filter(fileName => fileName !== 'prompts.js')
      return Promise.all(files.map(fileName =>
        pify(readFile)(join(cwd, templatePath, templateFileName, fileName))
      ))
    })
    .then(tempFiles =>
      // complete templated file and write
      Promise.all(tempFiles.map((tempFile, index) => {
        const contents = _.template(tempFile.toString())(answers)
        const filePath = replaceFileNameWithVar(templateFileName, answers)
        const fileName = replaceFileNameWithVar(files[index], answers)
        return pify(writeFile)(join(cwd, filePath, fileName), contents)
      }))
    )
}
