Testing via Buster.js
---------------------

[buster.js](http://busterjs.org) is a new up-and-coming javascript testing framework in development.

It features standalone static testing or CI testing via node with browser capture.
To see the basic example static test runner, load  `index.html`

To install buster:

    # npm install -g buster

To start the static tester:

    # buster static

To start in capture mode for multiple browsers:

    # buster server &

Once you have captured your target browsers, just run:

    # buster test

Standalone testing via `buster test` w/o browser capture is not supported yet, though you could probably try jsdom - edit buster.js config and give it a go. Also, you'd need the server only version of mootools.

**nb** please note that when in capture mode via `buster server`, IE7 and IE8 will fire an exception - which is to do with lack of `Object.create`, referenced in one of buster's dependencies `bundle.js`. As a work-around, an es5-shim has been provided that makes tests run in IE7/8 as well.

```sh
dchristoff@Dimitars-iMac:~/projects/mooTagify (master):
> buster server
buster-server running on http://localhost:1111

dchristoff@Dimitars-iMac:~/projects/mooTagify (master):
> buster test
Firefox 13.0a2 OS X: ........
1 test case, 9 tests, 9 assertions, 0 failures, 0 errors, 0 timeouts
```
