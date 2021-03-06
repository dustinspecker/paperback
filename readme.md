# paperback
[![NPM version](https://badge.fury.io/js/paperback.svg)](https://badge.fury.io/js/paperback)
[![Build Status](https://travis-ci.org/dustinspecker/paperback.svg?branch=master)](https://travis-ci.org/dustinspecker/paperback)
[![Coverage Status](https://img.shields.io/coveralls/dustinspecker/paperback.svg)](https://coveralls.io/r/dustinspecker/paperback?branch=master)

[![Code Climate](https://codeclimate.com/github/dustinspecker/paperback/badges/gpa.svg)](https://codeclimate.com/github/dustinspecker/paperback)
[![Dependencies](https://david-dm.org/dustinspecker/paperback.svg)](https://david-dm.org/dustinspecker/paperback/#info=dependencies&view=table)
[![DevDependencies](https://david-dm.org/dustinspecker/paperback/dev-status.svg)](https://david-dm.org/dustinspecker/paperback/#info=devDependencies&view=table)

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)

> Easily generate files from templates

## Install
```
npm install --global paperback
```

## Purpose

Create your own templates. Answer questions about the templates via [inquirer](https://github.com/SBoudrias/Inquirer.js/tree/v0.12.0). Generate those templates with the power of [lodash](https://lodash.com/docs#template).

## Example

An example repository may be found at [dustinspecker/paperback-example](https://github.com/dustinspecker/paperback-example).

## Usage
### 1. Starting with a project such as:
```
proj/
  components/
    app-bar/
      app-bar.js
      style.css
    jumping-button/
      jumping-button.js
      style.css
```
### 2. Create a `pages` directory mirroring the file structure of the actual project. The `pages` directory holds the templates.
```diff
proj/
  components/
    app-bar/
      app-bar.js
      style.css
    jumping-button/
      jumping-button.js
      style.css
+  pages/
+    components/
+     __name__/
+       __name__.js
+       style.css
```
**The `__word__` notation is treated specially in paperback. Paperback will later replace these values with answers from questions about how to generate the files.**

The contents of `proj/pages/components/__name__/__name__.js` are a lodash template. Paperback will later perform lodash's template function to provide unique data.
```javascript
console.log('Hello <%= place %>')
```

The contents of `proj/pages/components/__name__/style.css`
```css
.<%= name %> {
  color: #000;
}
```
### 3. Create a `prompts.js` file.
```diff
proj/
  components/
    app-bar/
      app-bar.js
      style.css
    jumping-button/
      jumping-button.js
      style.css
  pages/
    components/
      __name__/
        __name__.js
+       prompts.js
        style.css
```

`proj/pages/components/__name__/prompts.js`
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
There **must** be a prompt with a "name" for each lodash template variable used.

These prompts are provided to [inquirer](https://github.com/SBoudrias/Inquirer.js/tree/v0.12.0) to retrieve the required values for the template. Inquirer offers tons of features including input validation and different question types.

Later on after answering inquirer questions, paperback will know what to provide for the `name` and `place` template values in the file paths and file contents.

### 4. Run paperback
```bash
paperback components/__name__
```

**Note: `paperback` may be ran without passing a page to generate. paperback will then ask the user to select which page to load.**

[inquirer](https://github.com/SBoudrias/Inquirer.js/tree/v0.12.0) asks questions...
```bash
What is the component name? hello-world
What is the place? Taco Bell
```

paperback will log:
```bash
Created /Users/dustin/proj/components/hello-world/hello-world.js
Created /Users/dustin/proj/components/hello-world/style.css
```

paperback generates the templated files.
```diff
proj/
  components/
    app-bar/
      app-bar.js
      style.css
+   hello-world/
+     hello-world.js
+     style.css
    jumping-button/
      jumping-button.js
      style.css
  pages/
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

`proj/components/hello-world/style.css`
```css
.hello-world {
  color: #000;
}
```

## Misc. Usage

### Custom Template Directory

If the `pages` directory name conflicts with the project structure, paperback may be told where to look for templates via:

```bash
paperback components/__name__ --template-path=templates/go/here
```

### Providing Prompt Answers via CLI

Prompt answers may be passed via `paperback` command. For example, given a `prompts.js` of

```javascript
module.exports = [
  {
    name: "name",
    message: "What is the name?"
  },
  {
    name: "greeting",
    message: "What is the greeting?"
  }
]
```

and `paperback` is invoked like `paperback components/__name__ --name Dustin` then `paperback` will not ask the name question, but will still ask the greeting question. The value provided with the name flag will be the assumed answer.

## LICENSE
MIT © [Dustin Specker](https://github.com/dustinspecker)
