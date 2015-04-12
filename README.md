# polyglotweekly.com

Curated articles about the art of programming.

## How Polyglot Weekly Works

### Generating an Article

Anyone can submit a pull request for an article in Polyglot Weekly, simply run:

```shell
git clone https://github.com/polyglotweekly/polyglotweekly.com.git
cd polyglotweekly.com
nvm use nvm use 0.10 # sorry, no 0.12.x or iojs yet.
npm install
npm run generate
```

Keep the following contribution guidelines in mind:

* Articles should be on the topic of programming: articles advertising your start-up,
  discussing Bay-Area culture, or pointing out your favorite dog grooming techniques will be unceremoniously rejected.
* keep contributions positive! your article should not be a rant about why
  Ruby is better than Go. Feel free to criticize aspects of your language
  of expertise, but do so in a constructive manner.
* Provide concrete examples in code. Polyglot Weekly uses a [great syntax-highlighter](https://github.com/atom/highlights) extracted from the Atom Text Editor, take advantage of it.

### The Editorial Process

Articles are submitted to the [polyglotweekly.com repository](https://github.com/polyglotweekly/polyglotweekly.com) as a pull request. This allows a conversation to take place with the community surrounding the article. This discussion might include:

* grammatical fixes and other editorial nits.
* suggestions about structure, e.g., adding a section to an article that might
  pull the whole piece together.
* as with the tone of articles, the goal will be to keep the editorial process positive.

Once the conversation surrounding an article is complete, it will be merged
onto master, and will be become visible on [www.polyglotweekly.com](http://www.polyglotweekly.com/).
>>>>>>> updated README with text from intro post
