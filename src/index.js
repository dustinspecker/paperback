'use strict'
import _ from 'lodash'
import inquirer from 'inquirer'
import {join} from 'path'
import mkdirp from 'mkdirp'
import pify from 'pify'
import {readdir, readFile, writeFile} from 'fs'
import stringReplaceWithObject from 'string-replace-with-object'

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
      return pify(mkdirp)(stringReplaceWithObject(templateFileName, answers, '__'))
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
        const filePath = stringReplaceWithObject(templateFileName, answers, '__')
        const fileName = stringReplaceWithObject(files[index], answers, '__')
        return pify(writeFile)(join(cwd, filePath, fileName), contents)
      }))
    )
}
