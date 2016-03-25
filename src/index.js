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
 *        prompts.json
 *    components/
 *      __name__.js
 *      __name__.html
 *      prompts.json
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

// read prompts for template
pify(readFile)(join('templates', templatePath, 'prompts.json'))
  .then(fileContents => {
    const prompts = JSON.parse(fileContents.toString())

    // ask questions from prompts.json
    return new Promise(resolve => {
      inquirer.prompt(prompts, results => resolve(results))
    })
  })
  .then(promptResults => {
    answers = promptResults
    return pify(mkdirp)(replaceFileNameWithVar(templatePath))
  })
  .then(() => pify(readdir)(join('templates', templatePath)))
  .then(fileNames => {
    files = fileNames.filter(fileName => fileName !== 'prompts.json')
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
