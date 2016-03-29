'use strict'
import _ from 'lodash'
import chalk from 'chalk'
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
 * @param {String} templateDir - templates directory to read
 * @param {Options} [options.templatePath='pages'] - custom templatePath to look for templateDirectory
 * @return {Promise} - resolves when writing of template files finishes
 */
module.exports = (cwd, templateDir, {templatePath = 'pages'} = {}) => {
  let answers = {}
    , files = []

  // ask questions from prompts.js
  return new Promise((resolve, reject) => {
    // create promptsFile path
    const promptsDir = join(cwd, templatePath, templateDir)
    const promptsFile = join(promptsDir, 'prompts.js')

    let promptsModule
    try {
      /* eslint-disable global-require */
      promptsModule = require(promptsFile)
      /* eslint-enable global-require */
    } catch (e) {
      reject(`Could not find prompts.js in ${promptsDir}`)
    }

    inquirer.prompt(promptsModule, results => resolve(results))
  })
    .then(promptResults => {
      answers = promptResults
      return pify(mkdirp)(stringReplaceWithObject(templateDir, answers, '__'))
    })
    .then(() => pify(readdir)(join(cwd, templatePath, templateDir)))
    .then(fileNames => {
      files = fileNames.filter(fileName => fileName !== 'prompts.js')
      return Promise.all(files.map(fileName =>
        pify(readFile)(join(cwd, templatePath, templateDir, fileName))
      ))
    })
    .then(tempFiles =>
      // complete templated file and write
      Promise.all(tempFiles.map((tempFile, index) => {
        const contents = _.template(tempFile.toString())(answers)
        const filePath = stringReplaceWithObject(templateDir, answers, '__')
        const fileName = stringReplaceWithObject(files[index], answers, '__')
        const fullPath = join(cwd, filePath, fileName)
        console.log(`${chalk.green('Created')} ${fullPath}`)
        return pify(writeFile)(fullPath, contents)
      }))
    )
}
