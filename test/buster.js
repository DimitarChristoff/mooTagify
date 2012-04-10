var config = exports;

config["Browser tests"] = {
    rootPath: "../",
    environment: "browser", // or "node"
    libs: [
        'test/lib/mootools-yui-compressed.js',
        'test/lib/mootools-more-1.4.0.1.js',
        'test/lib/es5-shim.min.js',
        'test/lib/syn.js'
    ],
    sources: [
        "Source/js/mooTagify.js"
    ],
    tests: [
        "test/tests/*-test.js"
    ]
};