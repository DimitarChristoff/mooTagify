/*
---

name: mooTagify

description: provides an input for tags or labels

author: Dimitar Christoff, Qmetric Group Limited

license: MIT-style license.

version: 1

requires:
  - Core/String
  - Core/Event
  - Core/Element
  - Core/Array
  - Core/Class

provides: mooPlaceholder

...
*/
(function() {

Array.implement({

    unique: function(){
        return [].combine(this);
    }

});

var mooTagify = this.mooTagify = new Class({

    Implements: [Options, Events],

    options: {
        /*
        onReady: Function.From,
        onLimitReached: Function.From,
        onEmpty: Function.From,
        onTagsUpdate: Function.From,
        onTagRemove: function(tagText) {},
        */
        tagEls: "div.tag",
        minItemLength: 3,
        maxItemLength: 16,
        maxItemCount: 10,
        persist: true

    },

    initialize: function(element) {
        this.element = document.id(element);
        if (!this.element)
            return;

        this.listTags = this.element.getElement("input,textarea");
        if (!this.listTags)
            return;

        this.attachEvents();
    },

    attachEvents: function() {
        this.element.addEvents({
            "blur:relay(input)": this.extractTags.bind(this),
            "click:relay(span.tagClose)": this.removeTag.bind(this),
            "keydown:relay(input)": function(e, el) {
                if (e.key == "enter") {
                    e.target.blur();
                 }
            }.bind(this)
        });
        this.fireEvent("ready");
    },

    extractTags: function() {
        var newTags = this.listTags.get("value").clean().stripScripts().toLowerCase();
        if (newTags.length) {
            this.processTags(newTags);
            if (this.options.persist)
                this.listTags.focus.delay(1000, this.listTags);

        }
    },

    processTags: function(tags) {
        // called when blurred tags entry, rebuilds hash tags preview
        // var teststring = "a, aa,a, a, aaaa, aa, aaa, aaa,a,aaa,aaa";

        var tagsArray = tags.split(",").map(function(el) {
            return el.trim().toLowerCase();
        }).unique();

        var target = this.element.getFirst();
        tags = this.getTags() || [];

        if (tagsArray.length) {
            target.empty();
            this.listTags.set("value", "");
            tagsArray = tags.append(tagsArray).unique();
            var done = 0;
            tagsArray.each(function(el) {
                el = el.toLowerCase();
                if (done >= this.options.maxItemCount) {
                    this.fireEvent("limitReached");
                    return;
                }

                if (el.length >= this.options.minItemLength && el.length < this.options.maxItemLength) {
                    new Element([construct, "[html=", el, "<span class='tagClose'></span>]"].join("")).inject(target);
                    done++;
                }
                else {
                    this.fireEvent("empty");
                }
            }, this);

            this.fireEvent("tagsUpdate");
        }
    },

    removeTag: function(e) {
        var tag = e.target.getParent();
        var tagText = tag.get("text").toLowerCase();
        var self = this;
        e.target.getParent().set("tween", {
            onComplete: function() {
                this.element.destroy();
                self.fireEvent("tagRemove", tagText);
            }
        }).fade(0);
        this.listTags.focus();
        clearTimeout(this.showTimer);
    },

    getTags: function() {
        // return an array of entered tags.
        return this.element.getElements(this.options.tagEls).get("text");
    }
});

})();