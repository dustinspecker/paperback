# paperback
[![NPM version](https://badge.fury.io/js/paperback.svg)](https://badge.fury.io/js/paperback) [![Build Status](https://travis-ci.org/dustinspecker/paperback.svg)](https://travis-ci.org/dustinspecker/paperback) [![Coverage Status](https://img.shields.io/coveralls/dustinspecker/paperback.svg)](https://coveralls.io/r/dustinspecker/paperback?branch=master)

[![Code Climate](https://codeclimate.com/github/dustinspecker/paperback/badges/gpa.svg)](https://codeclimate.com/github/dustinspecker/paperback) [![Dependencies](https://david-dm.org/dustinspecker/paperback.svg)](https://david-dm.org/dustinspecker/paperback/#info=dependencies&view=table) [![DevDependencies](https://david-dm.org/dustinspecker/paperback/dev-status.svg)](https://david-dm.org/dustinspecker/paperback/#info=devDependencies&view=table)

> Easily generate files from templates

## THIS IS EXPERIMENTAL, NOT TESTED, AND NOT READY FOR REAL USE

## Install
```
npm install --global paperback
```

## Usage
```
proj/
  templates/
    components/
      __name__/
        __name__.js
        prompts.js
        style.css
```

`proj/templates/components/__name__/prompts.js`
```js
module.exports = [
  {
    name: "name",
    message: "What is the component name?"
  },
  {
    name: "place",
    message: "What is the place?"
  }
]
```

`proj/templates/components/__name__/__name__.js`
```javascript
console.log('Hello <%= place %>')
```

Running paperback
```bash
paperback components/__name__
```

[inquirer](https://github.com/SBoudrias/Inquirer.js/tree/v0.12.0) asks questions
```bash
What is the component name? hello-world
What is the place? Taco Bell
```

```
proj/
  components/
    hello-world/
      hello-world.js
      style.css 
  templates/
    components/
      __name__/
        __name__.js
        prompts.js
        style.css
```

`proj/components/hello-world/hello-world.js`
```javascript
console.log('Hello Taco Bell')
```

## LICENSE
MIT © [Dustin Specker](https://github.com/dustinspecker)
