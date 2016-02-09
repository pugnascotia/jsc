# JSC - JavaScript Compiler

## Motivation

There are some great tools available for working with JavaScript, but
knowing which to use and when can be confusing and time-consuming,
especially for beginners. This tool allows the beginner a quick way of
getting started without first having to configure a complete toolchain.

## Capabilties

### Concatenation

Join your files together:

    `jsc app/**/*.js > dist.js`

or:

    `jsc -o dist.js app/**/*.js`

With minification:

    `jsc -u -o dist.js app/**/*.js`


### Bundling

Generate a bundle of your code and its `npm` dependencies:

    `jsc -o bundle.js --bundle app/index.js`

With minification:

    `jsc -o bundle.js --uglify --bundle app/index.js`

Watch for changes and rebuild as required:

    `jsc -o bundle.js --watch --bundle app/index.js`

## Implementation

`jsc` has the concept of drivers to perform the compilation. At present, it
has two.

### Gulp driver

This is the default. It supports:

* Concatentation of multiple files
* Compression with uglify

To do:

* ES6 support
* Watching for changes

### Webpack driver

This is used by `--bundle`. It supports:

* ES6
* JSX
* Watching
* CSS and LESS bundling
* Uglification

To do:

* Extract text plugin for emitting a seperate CSS file
