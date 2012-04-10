mooTagify
=========

![Screenshot](http://fragged.org/img/mooTagify.png)


A MooTools plugin that enables tag entry

![Screenshot 1](http://fragged.org/img/mooTagify.jpg)

How to use
==========

Class: mooTagify
================

### Implements

- [Options][]
- [Events][]


mooTagify Method: constructor
-----------------------------

### Syntax

	new mooTagify(element[, request, options]);

### Arguments

1. element - (*mixed*) A string of the id for an Element or an Element that *contains* the group of items as in the suggested markup below.
2. request - (*Request object*, optional) A pre-configured Request class that does the automatic lookups. Suggester uses it to show options onComplete
2. options - (*object*, optional) a key/value object of options

### Events

* ready - (*function*) The function to apply when the instance is ready
* limitReached - (*function*) The function to apply when the maximum tags allowed limit is reached. Fires multiple times for every rejected tag, which is passed as the argument.
* invalidTag - (*function*) The function to apply when a tag is being rejected due to length. Fires multiple times for every rejected tag, which is passed as the argument.
* tagsUpdate - (*function*) The function to apply after tag processing has been completed and new tags have been added. Passes an array of all accepted new tags
* tagRemove - (*function*) The function to apply when a tag is being removed. Passes the removed tag's text as argument

### Example HTML

    <div id="tagWrap" class="hide">
        <div class="left tagLock">
            <div class="tag">public<span class="tagClose" id="close1"></span></div>
        </div>
        <div class="left">
            <input id="listTags" name="listTags" placeholder="+Add tags" />
        </div>

        <div class="clear"></div>
    </div>


mooTagify Method: getTags
-------------------------

Returns an array of the current tags

### Syntax

	var array = myMooTagify.getTags();

### Returns

* (*array*) An array of tags in memory

Example
-------

[http://jsfiddle.net/dimitar/6X7Yb/](http://jsfiddle.net/dimitar/6X7Yb/)

Example with autoComplete
-------------------------

This needs PHP to run the results mocker:
[http://fragged.org/mooTagify/Demo/](http://fragged.org/mooTagify/Demo/)

Testing (via buster.js and Syn)
-------------------------------

Check the contents of the `test` directory and the README.md provided.