<!--
headline: A Rust Contributor Tries Their Hand at Go
description: the experiences of a Rustacean learning Go
author: Manish Goregaokar
datePublished: 2015-04-24
twitter: ManishEarth
github: manishearth
-->

For the past year or so I've been playing with the [Rust programming language][trpl].
I've come to love the language and spend quite a bit of my free time contributing to the [compiler][compiler]
and the [Servo browser engine][servo].

[trpl]: http://rust-lang.org/
[compiler]: https://github.com/rust-lang/rust
[servo]: https://github.com/servo/servo

Recently, for a course, we were asked to use Go for the assignments and project. Whilst a tad disappointed
that I couldn't use Rust for it, I saw this as a great opportunity. Rust and Go have been
compared a lot as the "hot new languages", and finally I'd get to see the other side of the argument.

By the end of the course, aside from some simpler assignments, I'd written
[a basic implementation of the Raft consensus algorithm][raft] and a [toy application][dash] using it,
both in Go.

Before I get into the experience, let me preface this by mentioning that Rust and Go don't exactly target the same audiences.
Go is garbage collected and is okay with losing out on some performance for ergonomics;
whereas Rust tries to keep everything as a compile time check as much as possible.
This can make Rust better for lower level applications.

In my specific situation, however, I was playing around with distributed systems via threads
(or goroutines), so this fit perfectly into the area of applicability of both languages.


This article isn't exactly intended to be a comparison between the two. I understand that as a newbie at Go,
I'll be trying to do things the wrong way and make bad conclusions off of this. My way of coding may not be the
"Go way" (I'm mostly carrying over my Rust style to my Go code since I don't know better); so everything may seem
like a hack to me. Please keep this in mind whilst reading the post, and feel free to let me know the "Go way"
of doing the things I was stumbling with.

This is more of a sketch of my experiences with the language, specifically from the point of
view of someone coming from Rust; used to the Rusty way of doing things. It might be useful as an
advisory to Rustaceans thinking about trying the language out, and what to expect.

[raft]: https://github.com/Manishearth/cs733/tree/master/assignment3/raft
[dash]: http://manishearth.github.io/dash


## What I liked

Despite the performance costs, having a GC at your disposal after using Rust for very long is quite liberating. 
For a while my internalized borrow checker would throw red flags on me tossing around data indiscriminately,
but I learned to  ignore it as far as Go code goes. I was able to quickly share state via pointers without
worrying about safety, which was quite useful.

Having channels as part of the language itself was also quite ergonomic. In Go, channels are used with the `<-` and `->`
operators:

```go
// Make a channel that can transmit booleans
// with a buffer length of 5
ch := make(chan bool, 5)

// Sent `true` to the channel
ch <- true
// Receive from the channel
response := <-ch
fmt.Println("Got: ", response)
```

In Rust, the corresponding is:

```rust
// Obtain the two ends of a new channel
// `tx` is a `Sender<bool>`, rx is a `Receiver<bool>`
// type inference fixed the type of channel here
let (tx, rx) = channel();

// Send `true`
tx.send(true);

// Receive from the channel
// unwrap() to panic if there were errors on
// receiving
let response = rx.recv().unwrap();

println!("Received {}", response);
```

It's not so different from what Go does, however having language-level operators for something is always nice. 
Initially I got confused often by which side the channel was, but after a while I got used to it.
It also has an in built select block for selecting over channels (Rust has a macro for the same purpose, but no language support).


`gofmt`. The Go style of coding is different from the Rust one (tabs vs spaces, how declarations look),
but I continued to use the Rust style because of the muscle memory (also too lazy to change the settings
in my editor). `gofmt` made life easy since I could just run it in a directory and it would fix everything.
Eventually I was able to learn the proper style by watching my code get corrected.
I'd love to see a `rustfmt`, however!


Go is great for debugging programs with multiple threads, too. It can detect deadlocks and
post traces for the threads (with metadata including what code the thread was spawned from, as well as its
current state). It also posts such traces when the program crashes. These are totally awesome and saved me tons of time whilst debugging
my code (which at times had all sorts of cross interactions between more than ten goroutines in the tests)
Without a green threading framework, I'm not sure how easy it will be to integrate this into Rust
(for debug builds, obviously), but I'd certainly like it to be there some day.

Go has really great <s>green threads</s> goroutines. They're rather efficient
(I can spawn a thousand and it schedules them nicely), and easy to use.

Go has really good in built support and tooling for tests (Rust does too).
I enjoyed writing tests in Go quite a bit due to this.

Unlike Rust, Go is _really_ easy to pick up. It's possible to jump directly into it, and you can be writing useful
programs after a single afternoon of messing around or reading. On the other hand, while basic Rust is easy to pick up,
it takes a while to get used to the borrow checker (and in general understand ownership/borrowing).
Additionally, most libraries make full use of advanced features (like associated types) and one needs
to learn these too to be able to use the libraries.

## What I didn't like

There are quite a few things here, but bear in mind I'm new to Go, and
am still learning the _Go way_ of doing things. I would love to hear feedback about
how I can overcome some of the problems I ran into.

### No enums

Rust has enums, which are basically tagged unions. Different variants can contain different types
of data, so we can have, for example:

```rust
enum Shape {
    Rectangle(Point, Point),
    Circle(Point, u8),
    Triangle(Point, Point, Point)
}
```

and when matching/destructuring, you get type-safe access to the contents of the variant.

This is extremely useful for sending typed messages across channels. For example, in Servo we use such
[an enum for sending details about the progress of a fetch to the corresponding XHR object][servo-xhr-enum].
[Another such enum][servo-constellation-enum] is used for communication between the constellation and the compositor/script.


This gives us a great degree of type safety; I can send messages with different data within them,
however I can only send messages that the other end will know how to handle since they must all be of the type of the message enum.

In Go there's no obvious way to get this. The closest thing is the type called `interface {}`
which is similar to `Box<Any>` in Rust or `Object` in Java. This is a pointer to any type,
with the ability to match on its type. As a Rustacean I felt incredibly dirty using this, since I expected that
there would be an additional vtable overhead &mdash; in Rust `Box<Any>` or `Box<Trait>` are generally avoided in favor of
generics (for compile time matching) or enums (for runtime matching). Besides, `interface{}` can be fed any type,
so I can always accidentally send a message of the wrong type through a channel and
it'll end up crashing the other end at runtime since it hit a `default:` case or something.

So, for example, in Rust I design a messaging system for drawing to a window like so:

```rust
enum MyMessage {
    Quit,
    DrawLine(Color, Point, Point),
    DrawTriangle(Color, Color, Point, Point, Point),
    SetBackground(Color)
    // Enum variants can also have named fields
    // though this is behind a feature gate right now
    // Either way, you can get named fields by creating a struct
    // for each variant to contain
}

// On the receiver end
fn painting_loop(rx: Receiver<MyMessage>) {
    loop {
        match rx.recv().unwrap() {
            Quit => {
                // shut down the window
            },
            DrawLine(color, a, b) => {
                // draw a line from point `a` to point `b`
                // with color `color`
            },
            DrawTriangle(color, fill, a, b, c) => {
                // draw a triangle between points `a`, `b`, `c`
                // with line color `color` and fill `fill`
            },
            SetBackground(color) => {
                // Set background to `color`
            }
            // No need for a default case here since we handled
            // all possible inputs
            // If we had missed a message type, this would not compile
            // without a wildcard case
        }
    }
}

// On the sender end
fn draw_thingy(tx: Sender<MyMessage) {
    tx.send(DrawLine(Red, Point{x:0, y:0}, Point{x: 1, y: 1}));
    tx.send(SetBackground(Blue))
    // we can't send anything other than `MyMessage` variants    
}

fn main() {
    // do some setup
    let (tx, rx) = channel();

    // Creates a thread to handle the event loop
    thread::spawn(move || {
        // perhaps create a window and
        // do more setup here
        painting_loop(rx)
    })

    // tx can be freely cloned here and handed out to
    // various consumers
    draw_thingy(tx)
}
```


whereas in Go, I would do something like this:

```go
type Quit struct{}
type DrawLine struct {
    color Color
    a Point
    b Point
}
type DrawTriangle struct {
    color Color
    fill Color
    a Point
    b Point
    c Point
}
type SetBackground struct {
    color Color
}

func paintingLoop(ch chan interface{}) {
    // shorthand for a loop over receiving over
    // a channel
    for msg := range ch {
        switch ch.(type) {
            case Quit:
                // quit
            case DrawLine:
                // cast to a drawline message
                line := msg.(DrawLine)
                // draw `line`
            case DrawTriangle:
                tri := msg.(DrawTriangle)
                // ...
            case SetBackground:
                bg := msg.(SetBackground)
                // ...
            default:
                // Need a default case in case
                // some other type is fed through here.
        }
    }
}

func drawThingy(ch chan interface{}) {
    ch <- DrawLine {color: Red, a: Point{x:0, y: 0]}, b: Point{x: 1, y: 1}}
    ch <- SetBackground{color: Blue}
    // This is also possible since I've used `interface{}`
    // both will hit the default case
    ch <- true
    ch <- "foobar"
}

func main() {
    // do some setup
    ch := make(chan interface{}, 100)

    // Creates a goroutine which will handle the
    // event loop
    go func() {
        // create the window, etc
        paintingLoop(ch)
    }

    // ch can be handed out to various
    // consumers now
    drawThingy(ch)
}

```

Of course, I could implement a custom interface `MyMessage` on the various types,
but this will behave exactly like `interface{}` (implemented on all types) unless I add a dummy method to it, which seems hackish.
This brings me to my next point:


[servo-xhr-enum]: https://github.com/servo/servo/blob/d5dd1d658e5d79701fb9d028479a0fcb26a033fa/components/script/dom/xmlhttprequest.rs#L100
[servo-constellation-enum]: https://github.com/servo/servo/blob/d5dd1d658e5d79701fb9d028479a0fcb26a033fa/components/msg/constellation_msg.rs#L198

### Smart interfaces

This is something many would consider a feature in Go, however, coming from Rust,
smart interfaces felt almost too magical, and sometimes tripped me up during refactors.

In Go, interfaces get implemented automatically if a type has methods of a matching signature.
So an interface with no methods is equivalent to `interface{}`; and will be implemented on all types automatically.
This means that we can't define "marker traits" like in Rust that add a simple layer of type safety over methods.
It also means that interfaces can only be used to talk of code level behavior, not higher level abstractions.
For example, in Rust we have the `Eq` trait, which uses the same method as `PartialEq` for equality (`eq(&self, &other)`),
and the behavior of that method is exactly the same, however the two traits mean fundamentally different things:
A type implementing PartialEq has a normal equivalence relation,
whilst one that also implements Eq has a full equivalence relation.
From the point of view of the code, there's no difference between their behavior.
But as a programmer, I can now write code that only accepts types with a full equivalence relation, and exploit that guarantee to optimize my code.

Having interfaces be autoimplemented on the basis of the method signature is a rather ergonomic feature in my opinion
and it reduces boilerplate. However, it's just not what I'm used to and it restricts me from writing certain types of code without using
dummy methods [like so][dummy] to get static type safety.


[dummy]: https://github.com/Manishearth/cs733/blob/e86f22487f53b6bee21415d6b6ca56b8007792cc/assignment3/raft/raft.go#L57

### Packages and imports

Go puts severe restrictions on where I can put my files. All files in a folder are namespaced into the same package
(if you define multiple packages in one folder it errors out). There's no way to specify portable
relative paths for importing packages either. To use a package defined in an adjacent folder, I had to do [this][absolute-import],
whereas in Rust (well, Cargo), it is easy to specify relative paths to packages (crates) [like so][relative-import].
The import also only worked if I was developing from within my `$GOPATH`, so my code now resides within
`$GOPATH/src/github.com/Manishearth/cs733/`; and I can't easily work on it elsewhere without pushing and running `go get` everytime.

Rust's module system [does take hints from the file structure][rust-module], and it can get confusing;
however the behavior can be nearly arbitrarily overridden if necessary (you can even do [scary things like this][chtulhu-import]).

[absolute-import]: https://github.com/Manishearth/cs733/blob/9842305bab2f8402dbd235c8512a05f57da1cc5f/assignment2/kvstore/server.go#L5
[relative-import]: https://github.com/servo/servo/blob/c2fc6e311a0cb3ec4c702c77bb5d13f97bd19078/components/script/Cargo.toml#L19
[chtulhu-import]: https://twitter.com/horse_rust/status/517408273750704128
[rust-module]: http://doc.rust-lang.org/book/crates-and-modules.html

### Documentation

Full disclosure, Rust's libraries aren't yet well documented. This relates largely to the fact that many of the libraries
are still in flux ("unstable"). There are ongoing initiatives by developers like the
awesome [Steve Klabnik][steve] to improve the documentation.

Having said this, I also found that Go's documentation was skimpy in places, even for stable libraries.

For example, for the methods which read till a delimiter in [`bufio`][bufio], it was rather confusing if they only return what has been
buffered till the call, or block until the delimiter is found.
Similarly, when it comes to I/O, the blocking/non-blocking behavior really should be
explicit; similar to what Rust's [`Sender`][sender] and [`Receiver`][receiver] do in their documentation.


[steve]: https://github.com/steveklabnik
[bufio]: http://golang.org/pkg/bufio/
[sender]: http://doc.rust-lang.org/std/sync/mpsc/struct.Sender.html
[receiver]: http://doc.rust-lang.org/std/sync/mpsc/struct.Receiver.html

### Generics

This is a rather common gripe -- Go doesn't have any generics aside from its builtins
(`chan`s, arrays, slices, and maps can be strongly typed).
Like my other points about enums and interfaces, we lose out on the ability for advanced type safety here.

Overall it seems like Go doesn't really aim for type safe abstractions,
preferring runtime matching of types. That's a valid choice to make, though from a Rust background
I'm not so fond of it.

### Visibility

Visibility (public/private) is done via the capitalization of the field, method, or type name.
This sort of restriction doesn't hinder usability, but it's quite annoying. The other day I had to make a bunch of fields public to
satisfy Go's encoding package, and code needed to be updated everywhere with a manual find/replace (the same string was used in other
contexts too so it couldn't be done automatically)

```go
// public
type Thingy struct {
    tweedledee bool // private
    Tweedledum bool // public
}

// private
type thingy struct{
    // ...
}
// private
func foo(){}
// public
func bar(){}
```

On the other hand, Rust has a keyword for exporting things, and whilst it has style recommendations
for the capitalization of variable names (for good reason -- you don't want to accidentally replace an
enum variant with a wildcard-esque binding in a match, for example), it doesn't error on them or change the
semantics in any way, just emits a warning. On the other hand, in Go the item suddenly becomes private.


```rust
// public
pub struct Thingy {
    tweedledee: bool // private
    pub tweedledum: bool // public
}

// private
struct OtherThingy {
    // ...
}
func foo(){}
pub func bar(){}

```

### Warnings

Go throws hard errors on finding unused imports or unused variables. This rules out some workflows where
I partially finish the code and check if it compiles. Quite often whilst debugging I have to add and remove code which uses
packages like `fmt` or `log`, and I have to scroll up and edit the imports block every time. In Rust, while you _can_ make
these hard errors, by default they are just warnings.

This isn't really an issue with the language, just a minor annoyance in the implementation.


### Conclusion

A major recurring point is that Go seems to advocate runtime over compile time checking (despite being a compiled language),
something which is totally opposite to what Rust does. This is not just visible in language features
(like the GC), but also in the tools that are provided — as mentioned above, Go does not give good tools for
creating type safe abstractions, and the programmer must add dynamic matching over types to overcome this.
This is similar (though not the same) as what languages like Python and Javascript advocate,
however these are generally interpreted, not compiled (and come with the benefits of being interpreted),
so there's a good tradeoff.

I wasn't an immediate convert to Go, having said this I really enjoyed learning, and playing with the language.
I'm coming from a different paradigm and it would take me time to adjust.
Having said this I highly recommend trying out the language.

&mdash; Manish.
