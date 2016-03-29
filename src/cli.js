#!/usr/bin/env node
'use strict'
import meow from 'meow'
import paperback from './'

const cli = meow(`
  Usage
    $ paperback <template>

  Options
    --template-path Template path to looks for <template>

  Examples
    $ paperback components/__name__
    $ paperback project-setup --template-path ../external-repo
`)

paperback(process.cwd(), cli.input[0], cli.flags)
  .catch(err => console.log(err))
