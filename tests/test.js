'use strict'
import test from 'ava'

import inquirerQuestions from '../lib/'

test('it should throw error if templates directory is not found', t => {
  t.throws(inquirerQuestions, Error)
  t.throws(inquirerQuestions, /Could not find a `.\/templates\/`/)
})

