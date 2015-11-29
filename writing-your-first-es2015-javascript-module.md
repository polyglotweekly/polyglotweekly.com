<!--
headline: Writing Your First ES2015 JavaScript Module
description: dead simple guide to writing your first ES2015 module using Babel.
author: Ben Coe
datePublished: 2015-11-29
twitter: benjamincoe
github: bcoe
-->

> ES2015 introduces a many slick language features (arrow functions, classes, template strings), but it
  can be overwhelming figure out where to begin with it!

The library [nyc](https://github.com/bcoe/nyc) grew out of my frustration with how complicated it was to instrument JavaScript projects with test coverage:

```js
mocha --ui exports --require blanket -R mocoverage
```

incantations like this were the norm in my _package.json_'s script stanza.

I dreamt of a simpler world, one where you could write `nyc mocha` and have test coverage work like magic.

_this world turned out to be awesome!_

Recently an [issue](https://github.com/bcoe/nyc/issues/53) was opened on nyc requesting support for Babel.
This brought my attention to a problem similar to the one that nyc was originally built to solve ...

There are many different approaches folks use to wire up ES2015 to ES5 transpilation, the methods use a variety
of different build tools (_gulp_, _grunt_, _webpack_, _browserify_), and the paradox of choice can be overwhelming.

In the process of adding Babel support to nyc I took notes, my goal being to outline a
_dead simple_ approach for writing ES2015 modules that work on older versions of Node.js: using
npm scripts instead of build tools, keeping helper libraries to a minimum, and avoiding
build steps where possible.

ES2015 introduces many [awesome language features](https://babeljs.io/docs/learn-es2015/) to your JavaScript repertoire,
and I hope this tutorial will convince you to dive in and start playing.

For the purpose of this discussion I've created the ES2015 module yarsay, which you can use to follow along:

[https://github.com/bcoe/yarsay](https://github.com/bcoe/yarsay)

## Installing and Configuring Babel

To get up and running you'll first want to install the babel development dependencies:

```sh
npm i babel-cli babel-core babel-preset-es2015 --save-dev
```

Let's look at each of these:

* *babel-core:* the bare-bones babel compiler (without the plugins that make it actually transpile).
* *babel-preset-es2015:* provides the set of plugins necessary to transpile ES2015 code.
* *babel-cli:* the command-line tool used to package your module for publication to npm.

> transpilation refers to converting our ES2015 source code to ES5, a flavor of JavaScript that works on older Node.js platforms.

Once you have the babel dependencies installed, the next step is to create `.babelrc` file in the root of
your project to configure things:

```json
{
  "presets": ["es2015"]
}
```

This configuration tells Babel that we want to use the [babel-preset-es2015](http://babeljs.io/docs/plugins/preset-es2015/) module that we installed.

Having installed the Babel dependencies, let's next look at the directory structure of our `yarsay` module:

## Structuring Your Project

For my [ES2015 sample project](https://github.com/bcoe/yarsay) I used the following directory structure:

* `src/`: contains the pre-transpiled ES2015 source files.
* `lib/`: this directory contains the transpiled ES5 code (you probably shouldn't
  add this directory to source control).
* `test/`: the test directory (the tests exercise the ES2015 code in the
  `/src` directory, rather than the transpiled code).

## Unit Tests and Coverage

Babel provides the module `babel-register`, which hooks into Node's require statement. This hook compiles your ES2015 code on the fly as your project needs it. `babel-register` is great for writing unit-tests, allowing you to exercise your ES2015 code directly without executing your build step.

The test coverage tool nyc integrates with `babel-register`, allowing you to add coverage reporting
and transpilation in one fell swoop. Here's how this can be achieved:

1. install your favorite unit testing framework (in my case `npm i mocha --save-dev`).
2. install `nyc` (`npm i nyc --save-dev`), `nyc` will be used both for instrumenting
  test coverage, and for compiling ES2015 code on the fly.
3. add a `test` script to your `package.json` that looks something like this:

```sh
nyc --require=babel-core/register mocha
```

The flag `--require babel-core/register` tells nyc to include `babel-register` when executing the
test suite, eliminating the need for a transpilation step when running your tests.

## Packaging Your ES2015 Module

It's nice to be able to run your unit-tests against the raw ES2015 code, but when publishing
a module you want it to work on a variety of platforms, we achieve this by adding a `prepublish`
build step to our ES2015 module. I'm a big fan of using npm scripts for this sort of thing.

Here are the important parts of `yarsay`'s _package.json_:

```json
{
  "scripts": {
    "build": "cd src; babel ./*.js -d ../lib",
    "prepublish": "npm run build",
    "pretest": "standard ./src/*.js",
    "test": "nyc --require babel-core/register mocha"
  },
  "main": "lib/yarsay.js",
  "bin": "lib/cli.js"
}
```

* `build`: enters the ES2015 source directory and executes the transpiler, storing the final source-code in `/lib`.
* `prepublish`: executes when you publish a new version of the module and simply runs the build step.
* `test`: uses nyc to run the test suite, compiling ES2015 code on the fly.
* `pretest`: I'm a fan of the [standard](https://github.com/feross/standard) code-style tool, and generally run this as a `pretest` hook.
* `main`/`bin`: note that `main` and `bin` both reference the compiled code in the `lib/` folder.

When we run `npm publish`, the build script executes, and we ultimately publish the cross-platform ES5 source code.

## Now go forth

That's all there is to it! using a few npm scripts, `nyc`, and our favorite test runner, we've created
a module that allows us to write and test code in ES2015, while publishing a version that works on
legacy versions of Node.js.

I encourage you to play with [yarsay](https://github.com/bcoe/yarsay) and use it as a jumping off point
for your own ES2015 modules.

If you have any follow up questions, or corrections, please open issues on [polyglotweekly.com](https://github.com/polyglotweekly/polyglotweekly.com).

&mdash; Ben.
