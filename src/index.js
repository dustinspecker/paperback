'use strict'
import _ from 'lodash'
import chalk from 'chalk'
import inquirer from 'inquirer'
import {join} from 'path'
import mkdirp from 'mkdirp'
import objectAssign from 'object-assign'
import pify from 'pify'
import {readdir, readFile, writeFile} from 'fs'
import stringReplaceWithObject from 'string-replace-with-object'

/**
 * Load a prompts file
 *
 * @param {String} promptsFileDir - directory to load prompts file from
 * @return {Promise<Object[]>} - questions from prompts.js
 */
const loadPromptsFile = promptsFileDir => {
  const promptsFilePath = join(promptsFileDir, 'prompts.js')

  return Promise.resolve()
    .then(() => {
      try {
        /* eslint-disable global-require */
        return require(promptsFilePath)
        /* eslint-enable global-require */
      } catch (e) {
        throw new Error(`Could not find prompts.js in ${promptsFileDir}`)
      }
    })
}

/**
 * Generate a file from a template after asking questions
 *
 * @param {String} cwd - the directory to look for the templatePath
 * @param {String} templateDir - templates directory to read
 * @param {Object} [options={}] - options for path configuration
 * @param {String} [options.templatePath='pages'] - custom templatePath to look for templateDirectory
 * @return {Promise} - resolves when writing of template files finishes
 */
module.exports = (cwd, templateDir, options = {}) => {
  const templatePath = options.templatePath || 'pages'

  let answers = {}
    , files = []

  // ask questions from prompts.js
  return loadPromptsFile(join(cwd, templatePath, templateDir))
    .then(questions => {
      const unansweredQuestions =
        questions
          .filter(question =>
            Object.keys(options).indexOf(question.name) === -1
          )

      return inquirer.prompt(unansweredQuestions)
    })
    .then(promptResults => {
      answers = objectAssign(promptResults, options)

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
