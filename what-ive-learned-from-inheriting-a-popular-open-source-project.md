<!--
headline: What I&#x27;ve Learned From Inheriting A Popular Open Source Project
description: a summary of some of the things I&#x27;ve learned from taking over development of the yargs command-line-parser.
author: Ben Coe
datePublished: 2015-04-21
twitter: benjamincoe
github: bcoe
-->

_this story begins all the way back in 2014, shortly after I began work at npm_

I spend a lot of my time working on backend infrastructure. As a result, I end up writing many command-line tools. I'd come to like the library [optimist](https://www.npmjs.com/package/optimist) for this: it combined a simple DSL for parsing, and auto-generated terminal output &mdash; You could have a professional looking CLI application right out of the gate!

```js
var argv = require('optimist')
    .usage('Usage: $0 -x [num] -y [num]')
    .demand(['x','y'])
    .argv;

console.log(argv.x / argv.y);
```

```shell
$ node ./divide.js -x 4.91 -z 2.51
Usage: node ./divide.js -x [num] -y [num]

Options:
  -x  [required]
  -y  [required]

Missing required arguments: y
```

## Storm's A-brewin'

To my dismay, towards the beginning of 2014 James Halliday (the Internet's [Substack](https://github.com/substack)) chose to deprecate optimist in favor of [minimist](https://www.npmjs.com/package/minimist):

> minimist is the guts of optimist's argument parser without all the fanciful decoration.

I liked the fanciful decoration! My coworker [C J Silverio](https://github.com/ceejbot) came to the rescue and pointed me at [yargs](https://github.com/bcoe/yargs).

yargs was a fork of optimist that [Alex Ford](https://github.com/chevex) had made. Alex
had merged all the open pull requests from optimist, and the yargs project was gaining a lot of momentum.

_This is the story of how I became a core contributor to, and ultimately took over, maintaining yargs._

## Be Respectful To A Project’s Maintainers

I loved optimist and yargs because of their great off the shelf functionality. In practice, as I put yargs into production, I was finding a lot of bugs. I think there were a few reasons for this:

* contributors had added features without understanding
  the side-effects they would have on other functionality.
* the argument parser supported every conceivable argument format &mdash;
  this sometimes created ambiguity when parsing arguments.
* as I now much better understand, generating a slick looking
  command-line-interface is hard!

Here's the wonderful thing, I could jump into the fray and help fix things. I began by opening tickets for the specific issues I was
seeing:

* [https://github.com/bcoe/yargs/issues/63](https://github.com/bcoe/yargs/issues/63)
* [https://github.com/bcoe/yargs/issues/66](https://github.com/bcoe/yargs/issues/66)

Over the next several months, I began submitting patches for these and other issues:

* [https://github.com/bcoe/yargs/pull/67](https://github.com/bcoe/yargs/pull/67)

Alex was very receptive to the fixes, but was obviously very busy. Rather
than getting grumpy about my patches taking a while to land, I started
an email conversation with Alex and asked for commit access to the project.

Alex was more than happy to give me access. With growing excitment &mdash; _I was going to make this the best damned argument parser!_ &mdash; I began closing issues like a madman.

_99% of the time I find that a polite conversation with an open-source maintainer leads to a solution that's great for everyone &mdash; try it next time you find yourself, or a peer, yelling at a computer._

## Take Your Time Refactoring Things

When you're excited about a project, and you've been given carte blanche
to muck with it as you see fit, it's tempting to start a major
refactor... I resisted this urge.

yargs had many dependents, I wanted to make sure that a
rewrite didn't break their applications &mdash; we'd just spent
months making things more stable!

Having said this, I did feel that a major refactor would be
beneficial (things were getting pretty rickety). Here was the approach I took:

### Start By Shuffling Around The Unit Tests

When I took over the project yargs consisted of the following files:

* **minimist.js:** a modified copy of minimist (it had diverged from
  the version that James maintained). This module handled parsing `process.argv`.
* **wordwrap.js:** a copy of James' [wordwrap](https://github.com/substack/node-wordwrap) library. This was
 used to format usage instructions when printing them to the terminal.
* **index.js:** a catch-all for other functionality: it exposed the yargs DSL,
  handled printing usage instructions, validated arguments, ran the parser...

I had an idea of the structure I wanted to move towards:

* **parser.js:** Given that the parser had diverged from minimist, I
  figured a better name for the component would be parser.js.
* **usage.js:** I wanted to extract all of the logic for displaying
  usage instructions in the terminal to a separate module.
* **validation.js:** I also wanted to abstract command line validation
  into its own module.
* **index.js:** Having performed the abstractions listed above, I
  envisioned that index.js would contain only the yargs DSL... the code
  that facilitates the chaining API:

```js
var argv = require('yargs')
    .usage('Usage: $0 <command> [options]')
    .command('count', 'Count the lines in a file')
    .demand(1)
    .example('$0 count -f foo.js', 'count the lines in the given file')
    .demand('f')
    .alias('f', 'file')
    .nargs('f', 1)
    .describe('f', 'Load a file')
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2015')
    .argv;
```

To move towards this new structure, I began by organizing the current unit tests into files that correlated
with the new naming conventions &mdash; this was before changing a
single line of code.

### Code Coverage Is Your Best Friend

Inheriting yargs really drilled home for me how
powerful code coverage can be as a tool for refactoring.

I added [blanket](https://www.npmjs.com/package/blanket) to yargs' testing
cycle and managed to get coverage up to 100%. This gave me the confidence
I needed to start moving code around &mdash; added bonus, I found two major features in yargs that were completely undocumented...
[implied arguments](https://github.com/bcoe/yargs#impliesx-y) anyone?

With coverage in place, the structure of yargs' codebase was
refactored to match the structure put forward in the unit-tests.

_My next thoughts grow out of this refactoring process:_

## Engage The Community

My only real claim to yargs was that I'd hassled Alex for commit access; I
felt obligated to do a good job of including everyone who had
contributed to the project as it moved forward.

Before starting the major refactor, I put forward a proposal to several
of the top maintainers. When a first pass at the work
was done, I opened a pull-request and made sure I had sign-off
before merging:

* [https://github.com/bcoe/yargs/pull/88](https://github.com/bcoe/yargs/pull/88)

I've made sure to engage the community whenever I add a major
feature or undertake [a major refactor](https://github.com/bcoe/yargs/pull/151).

This has paid off huge!

* It has given yargs a great pool of testers to help hammer on things
  as new features are added.
* It has encouraged people to actively participate as features are added,
 making for much better features.

_Furthermore..._

### The Community Asks For Great Things

In an example of exponential payoff in action, the community itself
started asking for features that made collaboration easier:

One user suggested that we [start a Changelog](https://github.com/bcoe/yargs/issues/120). This is a great
way to communicate to everyone the history of the project, and can
help with forensic analysis when a bug is introduced. [James Nylen](https://github.com/nylen), one of the
core contributors to [request](https://github.com/request/request), joined the conversation and pointed out how they auto-generated theirs using [github-changes](https://github.com/lalitkapoor/github-changes):

Another user asked that we [add a style-guide to yargs](https://github.com/bcoe/yargs/issues/144). It would help them
better match the current style, and therefore make it easier to contribute. In the past I'd shied away from style-guides &mdash; _don't fence me in!_ &mdash; hearing the request put in this way was compelling. We settled on the [standard](https://github.com/feross/standard) style, and code style validation is now part of the build process:

_Along with community engagement, there was another theme that fell out of the yargs rewrite and improved the project immensely..._

## Figure Out What Your Library Does Well, Try To Do Only This

I liked yargs because it provided a great API for parsing command line arguments and for displaying a help message about them. The library I inherited contained logic unrelated to these core competencies, mainly: logic
for manipulating strings and performing text layout in the terminal. Here's why I think this was damaging to the project:

* it creates more code for a potential contributor to sift through before
 they feel comfortable submitting a patch.
* the utility functions you hack together will, most likely, not be as well    maintained and tested as a specialized module.

I'm a big fan of the tiny modules philosophy embraced by the Node.js community:

* [how I write modules](http://substack.net/how_I_write_modules): a post by James Haliday about tiny modules.

Whenever possible, I've made an effort to replace logic in yargs with
external modules &mdash; relishing in deleting code as I do so.

My proudest achievement has been in replacing yargs' terminal layout
logic (some of its most terrifiying code) with a slick little module called [cliui](https://www.npmjs.com/package/cliui):

#### this allowed this mess of code:

```js
// word-wrapped two-column layout used by
// examples, options, commands.
function formatTable (table, padding) {
  var output = []

  // size of left-hand-column.
  var llen = longest(Object.keys(table))

  // don't allow the left-column to take up
  // more than half of the screen.
  if (wrap) {
    llen = Math.min(llen, parseInt(wrap / 2, 10))
  }

  // size of right-column.
  var desclen = longest(Object.keys(table).map(function (k) {
    return table[k].desc
  }))

  Object.keys(table).forEach(function (left) {
    var desc = table[left].desc,
      extra = table[left].extra,
      leftLines = null

    if (wrap) {
      desc = wordwrap(llen + padding + 1, wrap)(desc)
      .slice(llen + padding + 1)
    }

    // if we need to wrap the left-hand-column,
    // split it on to multiple lines.
    if (wrap && left.length > llen) {
      leftLines = wordwrap(2, llen)(left.trim()).split('\n')
      left = ''
    }

    var lpadding = new Array(
      Math.max(llen - left.length + padding, 0)
    ).join(' ')

    var dpadding = new Array(
      Math.max(desclen - desc.length + 1, 0)
    ).join(' ')

    if (!wrap && dpadding.length > 0) {
      desc += dpadding
    }

    var prelude = '  ' + left + lpadding

    var body = [ desc, extra ].filter(Boolean).join('  ')

    if (wrap) {
      var dlines = desc.split('\n')
      var dlen = dlines.slice(-1)[0].length
      + (dlines.length === 1 ? prelude.length : 0)

      if (extra.length > wrap) {
        body = desc + '\n' + wordwrap(llen + 4, wrap)(extra)
      } else {
        body = desc + (dlen + extra.length > wrap - 2
          ? '\n'
          + new Array(wrap - extra.length + 1).join(' ')
          + extra
          : new Array(wrap - extra.length - dlen + 1).join(' ')
          + extra
        )
      }
    }

    if (leftLines) { // handle word-wrapping the left-hand-column.
      var rightLines = body.split('\n'),
        firstLine = prelude + rightLines[0],
        lineCount = Math.max(leftLines.length, rightLines.length)

      for (var i = 0; i < lineCount; i++) {
        var l = leftLines[i],
          r = i ? rightLines[i] : firstLine

        output.push(strcpy(l, r, firstLine.length))
      }
    } else {
      output.push(prelude + body)
    }
  })

  return output
}

// find longest string in array of strings.
function longest (xs) {
  return Math.max.apply(
    null,
    xs.map(function (x) { return x.length })
  )
}

// copy one string into another, used when
// formatting usage table.
function strcpy (source, destination, width) {
  var str = ''

  source = source || ''
  destination = destination || new Array(width).join(' ')

  for (var i = 0; i < destination.length; i++) {
    var char = destination.charAt(i)

    if (char === ' ') char = source.charAt(i) || char

    str += char
  }

  return str
}
```

#### to be replaced with:

```js
var cliui = require('cliui')

var ui = cliui({
  width: wrap,
  wrap: wrap ? true : false
})

ui.span(
  {text: kswitch, padding: [0, 2, 0, 2], width: maxWidth(switches) + 4},
  desc
)
```

_Refactoring work like this is extremely rewarding... which brings me to my final point:_

## Open Source Needs You

The [Not invented here](http://en.wikipedia.org/wiki/Not_invented_here) philosophy is alluring. If you're not happy with a library, it's a ton
of fun to craft your own _perfect_ solution. Try resisting this urge:

* Legacy open-source projects already have a community that has built
 up around them. This is a huge advantage, collaboration is **so**
 important to the health of an open-source project.

> A complex system that works is invariably found to have evolved from a simple system that worked. A complex system designed from scratch never works and cannot be patched up to make it work. You have to start over with a working simple system

* what [John Gall](http://en.wikiquote.org/wiki/John_Gall) said! as fun as a greenfield project can be, it's not usually the best idea. The complexity &mdash; _and messy code_ &mdash; in a
legacy open-source project comes from many contributors hammering on it... the
advantage being, there have been many contributors hammering on it.

yargs has been one of my most rewarding coding experiences. I
highly recommend you find a favorite open-source project that needs a helping hand and begin a similar journey.

&mdash; Ben.
