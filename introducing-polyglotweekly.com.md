<!--
headline: Introducing polyglotweekly.com
description: introducing the Polyglot Weekly project
author: Ben Coe
datePublished: 2015-04-05
twitter: benjamincoe
github: bcoe
-->

It's been almost a year since I wrote an article about programming, this makes me me sad.

> Polyglot Weekly grows from the question, "what would get me blogging more often?"

I love writing. It forces me to step back, reflect on what I've been learning, and helps solidify it.

Polyglot Weekly grows from the question, "what would get me blogging more often?" I came up with a list of answers:

* It would be fun to write as part of a community. I love the idea of
  [The Pastry Box](https://twitter.com/thepastrybox), which compiles a curated list of articles about the web. Wouldn't it be neat if there was a similar initiative for articles about programming?
* I wanted a platform that rendered source-code in a beautiful way,
  other blogging platforms I've used have been so so at this.
* I'd love to read articles from a variety programming communities.
  We can all learn from each other's methodologies, and it's important to discourage  inter-community shade throwing.
* I love working with an editor. As frustrating as it can sometimes be, it helps
  ensure that I write quality articles. I wanted to create a platform that
  had an editorial process.

## How Polyglot Weekly Works

### Generating an Article

Anyone can submit a pull request for an article to Polyglot Weekly, simply run:

```shell
git clone https://github.com/polyglotweekly/polyglotweekly.com.git
cd polyglotweekly.com
nvm use 0.10 # sorry, no 0.12.x or iojs yet.
npm install
npm run generate
```

Keep the following contribution guidelines in mind:

* Articles should be on the topic of programming: articles advertising your start-up,
  discussing Bay-Area culture, or pointing out your favorite dog grooming techniques will be politely declined.
* keep contributions positive! your article should not be a rant about why
  Ruby is better than Go. Feel free to criticize aspects of your language
  of expertise, but do so in a constructive manner.
* Provide concrete examples in code. Polyglot Weekly uses a [great syntax-highlighter](https://github.com/atom/highlights) extracted from the Atom Text Editor, take advantage of it.

### The Editorial Process

Articles are submitted to the [polyglotweekly.com repository](https://github.com/polyglotweekly/polyglotweekly.com) as a pull request. This allows a conversation to take place with the community surrounding the article. This discussion may include:

* grammatical fixes and other editorial nits.
* suggestions about structure, e.g., adding a section to an article that might
  pull the whole piece together.
* as with the tone of articles, the goal will be to keep the editorial process positive.

Once the conversation surrounding an article is complete, it will be merged
on to master and become visible on [www.polyglotweekly.com](http://www.polyglotweekly.com/).

## The Tech Behind Polyglot Weekly

The Polyglot Weekly platform is built with some really cool technology,
let me give you a tour:

### Markdown Rendering

[marky-markdown](https://www.npmjs.com/package/marky-markdown) is used for rendering the articles. This is the same parser used for rendering the README files
on www.npmjs.com. marky-markdown adheres closely to the [CommonMark Specification](http://spec.commonmark.org/), which is worth giving a read if
you'd like to contribute an article.

### Syntax Highlighting

Polyglot Weekly uses the same engine as the [Atom Text Editor](https://atom.io/) for syntax-highlighting. A variety of languages are supported:

**shell**

```shell
if [ "$UID" -ne 0 ]
then
 echo "Superuser rights is required"
 echo 'Printing the # sign'
 exit 2
fi
```

**clojure**

```clojure
; Comment

(def
  ^{:macro true
    :added "1.0"}
  let (fn* let [&form &env & decl] (cons 'let* decl)))

(def ^:dynamic chunk-size 17)
```

**ruby**

```ruby
require 'spec_helper'
require 'helper/account'
require 'ruby-box'

describe RubyBox::File do
  it "should use missing_method to expose files fields" do
    file = RubyBox::File.new(@session, @mini_file)
    file.id.should == '2631999573'
  end
end
```

**js**

```js
hashchange.update(function (hash) {
  var prefix = 'user-content-'

  if (hash.indexOf(prefix) === 0) {
    hashchange.updateHash(hash.replace(prefix, ''))
  } else {
    var anchor = $('#' + prefix + hash)
    if (anchor.length) $(document).scrollTop(anchor.offset().top)
  }
})
```

**go**

```go
package main

import (
    "fmt"
    "os"
)

const (
    Sunday = iota
    numberOfDays  // this constant is not exported
)

type Foo interface {
    FooFunc(int, float32) (complex128, []int)
}
```

**css**

```css
@media screen and (-webkit-min-device-pixel-ratio: 0) {
  body:first-of-type pre::after {
    content: 'highlight: ' attr(class);
  }
  body {
    background: linear-gradient(45deg, blue, red);
  }
}
```

Amongst many others. If a language is missing [open an issue](https://github.com/polyglotweekly/polyglotweekly.com/issues/new) (if
  a grammar exists in TextMate or Atom, it's easy to add).


### Static Site Generation

[Git Hooks](https://help.github.com/articles/about-webhooks/) are used to
automatically generate the www.polyglotweekly.com website. When an article is
merged on to the master branch:

* [jthoober](https://www.npmjs.com/package/jthoober) listens for the Git Hook,
  and executes a build script.
* [articleify](https://www.npmjs.com/package/articleify) is executed as part of the build script, and uses
  marky-markdown to build the markdown files in the root directory.

The Polyglot Weekly platform is open-source, and patches are very welcome.

## Epilogue

I'm personally very excited about this project, but Polyglot Weekly needs you!

* Would you like to contribute an article? Don't be shy, read the contribution
  guidelines and submit an article.
* Would you like to be an editor, or suggest an editor? [open an issue](https://github.com/polyglotweekly/polyglotweekly.com/issues/new), or send
  an email to ben [at] npmjs.com.

I can't wait to see what comes of this,

-- Ben.
