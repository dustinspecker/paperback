'use strict'
import austin from 'austin'
import chalk from 'chalk'
import {expectRequire} from 'a'
import {join} from 'path'
import proxyquire from 'proxyquire'
import test from 'ava'

import paperback from '../lib'

test('it rejects error when require fails to find prompts.js', async t =>
  paperback('some_dir', 'hi')
    .catch(err => {
      t.truthy(err.message, 'Could not find prompts.js in some_dir/pages/hi')
    })
)

test('it generates file and support passing answers through CLI', async t => {
  t.plan(7)

  expectRequire('some_dir/pages/__name__/prompts.js').return([{name: 'questions'}, {name: 'thisIsAnsweredViaCLI'}])

  const mockedPaperback = proxyquire('../lib/', {
    fs: {
      readdir(path, cb) {
        t.truthy(path, join('some_dir', 'pages', '__name__'))
        cb(null, ['__name____name__-component.js', 'prompts.js'])
      },
      readFile(path, cb) {
        t.truthy(path, join('some_dir', 'pages', '__name__', '__name____name__-component.js'))
        cb(null, {
          toString() {
            return 'Hello <%= name %>! <%= thisIsAnsweredViaCLI %>'
          }
        })
      },
      writeFile(path, contents, cb) {
        t.truthy(path, 'some_dir/dog/dogdog-component.js')
        t.truthy(contents, 'Hello dog! hello')
        cb(null)
      }
    },
    inquirer: {
      prompt(questions) {
        t.deepEqual(questions, [{name: 'questions'}])

        return Promise.resolve({name: 'dog'})
      }
    },
    mkdirp(path, cb) {
      t.truthy(path, 'dog')
      cb(null)
    }
  })

  austin.spy(console, 'log')

  return mockedPaperback('./some_dir', '__name__', {thisIsAnsweredViaCLI: 'hello'})
    .then(() => {
      t.truthy(console.log.calledWith(`${chalk.green('Created')} some_dir/dog/dogdog-component.js`))
    })
})

test('it resolves template path with cwd', async t => {
  t.plan(1)

  return paperback('./some_dir', '__name__', {templatePath: '../template-stuff'})
    .catch(err => {
      t.truthy(err.message, 'Could not find prompts.js in template-stuff/__name__')
    })
})

test('it supports --template-path option', async t => {
  t.plan(1)

  return paperback('./some_dir', '__name__', {templatePath: 'template-stuff'})
    .catch(err => {
      t.truthy(err.message, 'Could not find prompts.js in some_dir/template-stuff/__name__')
    })
})

test('it rejects with prompts.js not found', async t => {
  t.plan(1)

  try {
    await paperback('./some_dir', '__name__')
  } catch (err) {
    t.truthy(err.message, 'Could not find prompts.js in some_dir/pages/__name__')
  }
})
