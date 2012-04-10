if (typeof require == "function" && typeof module == "object") {
    buster = require("buster");
}

buster.testRunner.timeout = 1000;
buster.testCase("mooTagify class test - case enforced > ", {
    setUp: function(done) {
        this.element = new Element("div#tagWrap", {
            html: [
                '<div class="left tagLock">',
                    '<div class="tag">public<span class="tagClose"></span></div>',
                '</div>',
                '<div class="left">',
                    '<input id="listTags" name="listTags" placeholder="+Add tags" />',
                '</div>',

                '<div class="clear"></div>'
            ].join("")
        });

        var self = this;
        this.tagify = new mooTagify(this.element, new Request.JSON({
            url: "checker.php",
            method: "get"
        }), {
            onReady: function() {
                self.ready = true;
                done();
            }
        })
    },

    "Expect instance to fire ready event": function() {
        buster.assert.isTrue(this.ready);
    },

    "Expect taglist to contain initial tag 'public": function() {
        var tags = this.tagify.getTags();
        buster.assert.equals(tags, ['public']);
    },

    "Expect taglist to process on blur and get 3 new tags": function(done) {
        this.tagify.addEvent("tagsUpdate", function() {
            var tags = this.getTags();
            buster.assert.equals(tags, ['public','coda','was','here']);
            done();
        });

        this.tagify.listTags.set("value", "coda,was,here");

        this.tagify.element.fireEvent("blur:relay(input)");
    },

    "Expect input to empty after processing tags": function(done) {
        var self = this;
        this.tagify.addEvent("tagsUpdate", function() {
            buster.assert.equals(self.tagify.listTags.get("value").length, 0);
            done();
        });

        this.tagify.listTags.set("value", "coda,was,here");

        this.tagify.element.fireEvent("blur:relay(input)");
    },

    "Expect taglist to reject existing tags": function(done) {
        var tags = this.tagify.getTags();

        this.tagify.addEvent("tagsUpdate", function() {
            buster.assert.equals(tags, this.getTags());
            done();
        });

        this.tagify.listTags.set("value", "public");
        this.tagify.element.fireEvent("blur:relay(input)");
    },

    "Expect taglist to reject shorter tags": function(done) {
        var invalid = new Array(this.tagify.options.minItemLength - 1).join("a");

        this.tagify.addEvent("invalidTag", function(tag) {
            buster.assert.equals(tag, invalid);
            done();
        });

        this.tagify.listTags.set("value", invalid);
        this.tagify.element.fireEvent("blur:relay(input)");
    },

    "Expect taglist to reject longer tags": function(done) {
        var invalid = new Array(this.tagify.options.maxItemLength + 1).join("a");

        this.tagify.addEvent("invalidTag", function(tag) {
            buster.assert.equals(tag, invalid);
            done();
        });

        this.tagify.listTags.set("value", invalid);
        this.tagify.element.fireEvent("blur:relay(input)");
    },

    "Expect to be able to remove a tag and raise an event": function(done) {
        var closer = this.element.getElement(".tagClose"), toRemove = this.tagify.getTags()[0];

        this.tagify.addEvent("tagRemove", function(tag) {
            buster.assert.equals(tag, toRemove);
            done();
        });


        this.tagify.element.fireEvent("click:relay(span.tagClose)", {
            target: closer
        });
    },

    "Expect different case tags to be rejected as duplicates": function(done) {
        var tags = this.tagify.getTags();

        this.tagify.addEvent("tagsUpdate", function() {
            buster.assert.equals(tags, this.getTags());
            done();
        });

        this.tagify.listTags.set("value", "PUBLIC");
        this.tagify.element.fireEvent("blur:relay(input)");
    }
});


buster.testCase("mooTagify class test - case insensitive > ", {
    setUp: function(done) {
        this.element = new Element("div#tagWrap", {
            html: [
                '<div class="left tagLock">',
                '</div>',
                '<div class="left">',
                '<input id="listTags" name="listTags" placeholder="+Add tags" />',
                '</div>',

                '<div class="clear"></div>'
            ].join("")
        });

        var self = this;
        this.tagify = new mooTagify(this.element, new Request.JSON({
            url: "checker.php",
            method: "get"
        }), {
            onReady: function() {
                self.ready = true;
                done();
            },
            caseSensitiveTagMatching: true
        });
    },

    "Expect tags to export in lowercase still": function(done) {
        var testArray = ['Coda','Was','here'];
        this.tagify.addEvent("tagsUpdate", function() {
            var tags = this.getTags();
            buster.assert.equals(tags, testArray);
            done();
        });

        this.tagify.listTags.set("value", testArray.join(','));

        this.tagify.element.fireEvent("blur:relay(input)");

    },

    "Expect tags to show in their original case": function(done) {
        var self = this, testArray = ['Coda','Was','here'];
        this.tagify.addEvent("tagsUpdate", function() {
            var tags = self.element.getElements(".tag").get("text");
            buster.assert.equals(tags, testArray);
            done();
        });

        this.tagify.listTags.set("value", testArray.join(','));

        this.tagify.element.fireEvent("blur:relay(input)");

    }


});
