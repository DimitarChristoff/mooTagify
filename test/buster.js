var config = exports;

config["Browser tests"] = {
    rootPath: "../",
    environment: "browser", // or "node"
    libs: [
        'test/lib/mootools-yui-compressed.js',
        'test/lib/es5-shim.min.js'
    ],
    sources: [
        "Source/js/*.js"
    ],
    tests: [
        "test/tests/*-test.js"
    ]
};