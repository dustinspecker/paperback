'use strict'
import _ from 'lodash'
import {argv} from 'yargs'
import inquirer from 'inquirer'
import {join} from 'path'
import mkdirp from 'mkdirp'
import pify from 'pify'
import {readdir, readFile, writeFile} from 'fs'

/**
 * proj/
 *  templates/
 *    tests/
 *      components/
 *        __name___test.js
 *        prompts.js
 *    components/
 *      __name__.js
 *      __name__.html
 *      prompts.js
 */

const {_: args} = argv
const [templatePath] = args

let answers = {}
  , files = []

const replaceFileNameWithVar = fileName => {
  let name = fileName

  Object.keys(answers).forEach(answer => {
    name = name.replace(`__${answer}__`, answers[answer])
  })

  return name
}

// create promptsFile path
const promptsFile = join(process.cwd(), 'templates', templatePath, 'prompts.js')
// ask questions from prompts.js
new Promise(resolve => {
  /* eslint-disable global-require */
  inquirer.prompt(require(promptsFile), results => resolve(results))
  /* eslint-enable global-require */
})
  .then(promptResults => {
    answers = promptResults
    return pify(mkdirp)(replaceFileNameWithVar(templatePath))
  })
  .then(() => pify(readdir)(join('templates', templatePath)))
  .then(fileNames => {
    files = fileNames.filter(fileName => fileName !== 'prompts.js')
    return Promise.all(files.map(fileName =>
      pify(readFile)(join('templates', templatePath, fileName))
    ))
  })
  .then(tempFiles =>
    // complete templated file and write
    Promise.all(tempFiles.map((tempFile, index) => {
      const contents = _.template(tempFile.toString())(answers)
      return pify(writeFile)(join(replaceFileNameWithVar(templatePath), replaceFileNameWithVar(files[index])), contents)
    }))
  )
  .catch(err => console.log(err))

// look for templates directory
// load question config
// ask each question
// inject answers into lodash templates
// write files
