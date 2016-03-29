#!/usr/bin/env node
'use strict'
import {argv} from 'yargs'
import paperback from './'

paperback(process.cwd(), argv)
  .catch(err => console.log(err))
