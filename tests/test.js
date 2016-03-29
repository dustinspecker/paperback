'use strict'
import {expectRequire} from 'a'
import {join} from 'path'
import proxyquire from 'proxyquire'
import test from 'ava'

import paperback from '../lib'

test('it rejects error when require fails to find prompts.js', async t =>
  paperback('some_dir', {_: ['hi']})
    .catch(err => {
      t.is(err.message, 'Cannot find module \'some_dir/pages/hi/prompts.js\'')
    })
)

test('it generates file', async t => {
  t.plan(6)

  expectRequire('some_dir/pages/__name__/prompts.js').return('questions')

  const mockedPaperback = proxyquire('../lib/', {
    fs: {
      readdir(path, cb) {
        t.is(path, join('some_dir', 'pages', '__name__'))
        cb(null, ['__name____name__-component.js', 'prompts.js'])
      },
      readFile(path, cb) {
        t.is(path, join('some_dir', 'pages', '__name__', '__name____name__-component.js'))
        cb(null, {
          toString() {
            return 'Hello <%= name %>!'
          }
        })
      },
      writeFile(path, contents, cb) {
        t.is(path, 'some_dir/dog/dogdog-component.js')
        t.is(contents, 'Hello dog!')
        cb(null)
      }
    },
    inquirer: {
      prompt(questions, cb) {
        t.is(questions, 'questions')
        cb({name: 'dog'})
      }
    },
    mkdirp(path, cb) {
      t.is(path, 'dog')
      cb(null)
    }
  })

  return mockedPaperback('./some_dir', {_: ['__name__']})
})

test('it supports --template-path option', async t => {
  t.plan(1)

  return paperback('./some_dir', {_: ['__name__'], templatePath: 'template-stuff'})
    .catch(err => {
      t.is(err.message, 'Cannot find module \'some_dir/template-stuff/__name__/prompts.js\'')
    })
})
