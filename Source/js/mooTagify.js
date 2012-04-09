/*
---

name: mooTagify with auto suggest

description: provides an input for tags or labels

authors: Dimitar Christoff, Qmetric Group Limited

license: MIT-style license.

version: 1.1

requires:
  - Core/String
  - Core/Event
  - Core/Element
  - Core/Array
  - Core/Class
  - More/Element.Shorcuts
  - More/Fx.Scroll

provides: mooTagify

...
*/
!function() {

Array.implement({

    unique: function(){
        return [].combine(this)
    }

})


var autoSuggest = new Class({
    // private

    Implements: [Options,Events],

    options: {
        width: 233,
        requestInstance: null,
        minChars: 2,
        wrapperZen: 'div.autocompleteWrapper',              // popup wrapper class
        wrapperShadow: 'boxShadow',                         // extra class applied to wrapper, like one with box-shadow
        maxHeight: 106,                                     // maximum allowed height for dropdown before it scrolls
        optionZen: 'div.autocompleteOption',                // base class of indivdual options
        optionClassSelected: 'autocompleteOptionSelected',  // pre-selected value class
        optionClassOver: 'autocompleteOptionOver',          // onmouseover option class
        highlightTemplate: '<span class="HL">{value}</span>',
        ajaxProperty: 'prefix'                              // it will pass on the typed value as prefix=NNNn
    },

    initialize: function(input, request, options) {
        this.setOptions(options)

        this.element = document.id(input)
        if (!this.element)
            return

        this.request = request
        this.buildList()
        this.attachEvents()
        this.index = -1
        this.fireEvent('ready')
    },

    buildList: function() {
        var visible = this.element.isVisible(),
            size

        if (!visible) {
            var clone = this.element.clone().setStyles({
                opacity: .01,
                position: 'absolute',
                top: -1000
            }).inject(document.body).show()

            size = clone.getSize()
            clone.destroy()
        }
        else {
            size = this.element.getSize()
        }

        var width = this.options.width || size.x - 2,
            height = size.y,
            self = this

        this.wrapper = new Element(this.options.wrapperZen, {
            styles: {
                width: width,
                marginTop: height
            },
            events: {
                mouseenter: function() {
                    self.over = true
                },
                mouseleave: function() {
                    self.over = false
                },
                outerClick: function(e) {
                    if (!self.focused)
                        self.hide()
                },
                'click:relay(div)': function(e) {
                    self.select(this.retrieve('index'))
                }
            }
        }).inject(this.element, 'before')

        this.wrapper.addClass(this.options.wrapperShadow)
        this.scrollFx = new Fx.Scroll(this.wrapper, {
            duration: 200
        })
    },

    attachEvents: function() {
        this.element.addEvents({
            keydown: this.handleKey.bind(this),
            keyup: this.handleText.bind(this),
            focus: this.handleText.bind(this),
            blur: this.blur.bind(this)
        }).setStyle('width', this.options.width - 3)

        var self = this

        this.request.setOptions({
            timeout: 30000,
            link: 'cancel',
            onSuccess: function(data) {
                if (data && data.length) {
                    self.show()
                    self.addOptions(data)
                }
                else {
                    self.clearOptions()
                    self.hide()
                }

            }
        })

    },

    addOptions: function(answers) {
        var self = this

        this.wrapper.empty()
        this.answers = answers || []
        this.answersOptions = new Elements()

        var val = {
            value: this.element.get('value').clean()
        }

        this.answers.each(function(option, index) {
            self.addOption(option, val, index)
        })
    },

    addOption: function(option, val, index) {
        var matches = option.match(val.value, 'i'),
            value = option,
            self = this

        if (matches && matches.length) {
            matches.each(function(substring) {
                val.value = substring
                value = option.replace(substring, self.options.highlightTemplate.substitute(val), 'ig')
            })
        }

        var opt = new Element(this.options.optionZen, {
            html: value
        }).inject(this.wrapper).store('index', index)

        index === this.index && opt.addClass(this.options.optionClassSelected)

        this.answersOptions.push(opt)

        if (this.options.maxHeight) { // if greater than 0 care about this
            this.wrapper.setStyle('height', 'auto')
            var height = this.wrapper.getSize().y

            if (height >= this.options.maxHeight) {
                this.wrapper.setStyle('height', this.options.maxHeight)
            }

        }
    },

    handleKey: function(e) {
        switch(e.code) {
            case 8:
                // backspace.
                var len = e.target.get('value').clean()
                !len.length && this.fireEvent('delete')
            break
            case 40:
                e && e.stop()
                if (!this.answersOptions)
                    break

                if (this.answersOptions[this.index])
                    this.answersOptions[this.index].addClass(this.options.optionClassSelected)

                if (this.index < this.answersOptions.length - 1) {
                    this.answersOptions.removeClass(this.options.optionClassSelected)
                    this.index++
                    this.answersOptions[this.index].addClass(this.options.optionClassSelected)
                }
                else {
                    this.answersOptions.removeClass(this.options.optionClassSelected)
                    this.index = 0
                    if (!this.answersOptions[this.index])
                        break

                    this.answersOptions[this.index].addClass(this.options.optionClassSelected)
                }
                this.scrollFx.toElement(this.answersOptions[this.index])
                this.fireEvent('down')
                return
            break
            case 38:
                e && e.stop()
                if (!this.answersOptions)
                    break

                if (this.answersOptions[this.index])
                    this.answersOptions[this.index].addClass(this.options.optionClassSelected)

                if (this.index > 0) {
                    this.answersOptions.removeClass(this.options.optionClassSelected)
                    this.index--
                    this.answersOptions[this.index].addClass(this.options.optionClassSelected)
                }
                else {
                    this.answersOptions.removeClass(this.options.optionClassSelected)
                    this.index = this.answersOptions.length - 1
                    if (!this.answersOptions[this.index])
                        break

                    this.answersOptions[this.index].addClass(this.options.optionClassSelected)
                }

                this.scrollFx.toElement(this.answersOptions[this.index])
                this.fireEvent('up')
                return
            break
            case 13:
                e && e.preventDefault && e.preventDefault()

                if (this.index !== -1)
                    this.select(this.index)
                else {
                   this.element.blur()
                }
            break
        }

    },

    handleText: function(e) {
        // it's where the ajax look ahead happens...
        if (e && e.code) {
            if ([38,40].contains(e.code))
                return
        }

        var val = this.element.get('value')
        if (val.length <= this.options.minChars) {
            this.hide()
            return
        }

        var obj = {}
        obj[this.options.ajaxProperty] = val
        this.request.get(obj)
    },

    clearOptions: function() {
        this.answers = []
        this.answersOptions = new Elements()
        this.wrapper.empty()
        this.index = -1
        this.hide()
    },

    select: function(index) {
        this.element.set('value', this.answers[index]).blur()
        this.clearOptions()
        this.fireEvent('select', index)
    },

    hide: function() {
        this.wrapper.setStyle('display', 'none')
    },

    show: function() {
        this.wrapper.setStyle('display', 'block')
        this.focused = true
    },

    blur: function() {
        this.element.set('value', this.element.get('value').clean())
        this.focused = false
        if (!this.over)
            this.hide()
    }

})


var mooTagify = this.mooTagify = new Class({

    Implements: [Options, Events],

    options: {
        /*
        onReady: Function.From,
        onLimitReached: Function.From,
        onInvalidTag: function(rejectedTag) {},
        onTagsUpdate: Function.From,
        onTagRemove: function(tagText) {},
        */
        tagEls: 'div.tag',
        minItemLength: 3,
        maxItemLength: 16,
        maxItemCount: 10,
        persist: true,
        autoSuggest: false,
        addOnBlur: true
    },

    initialize: function(element, request, options) {
        this.element = document.id(element)
        if (!this.element)
            return

        this.request = request
        this.setOptions(options)

        this.listTags = this.element.getElement('input,textarea')
        if (!this.listTags)
            return

        this.attachEvents()
    },

    attachEvents: function() {
        var self = this
        if (this.options.autoSuggest && this.request) {
            this.autoSuggester = new autoSuggest(this.element.getElement('input'), this.request, {
                onDelete: function() {
                    var last = self.element.getElements(self.options.tagEls).getLast()
                    last && self.element.fireEvent('click', {
                        target: last.getElement('span.tagClose')
                    })
                }
            })
        }

        this.clicked = false

        var eventObject = {
            'blur:relay(input)': this.extractTags.bind(this),
            'click:relay(span.tagClose)': this.removeTag.bind(this),
            'keydown:relay(input)': function(e, el) {
                e.key == 'enter' && self.extractTags() && e.stop()
            },
            'mousedown': function() {
                self.clicked = true
            },
            'mouseup': function() {
                self.clicked = false
            }
        }

        !this.options.addOnBlur && (delete eventObject['blur:relay(input)'])
        this.element.addEvents(eventObject)
        this.fireEvent('ready')
    },

    extractTags: function() {
        this.timer = (function() {
            if (this.clicked)
                return

            clearInterval(this.timer)
            var newTags = this.listTags.get('value').clean().stripScripts().toLowerCase()
            if (newTags.length) {
                this.processTags(newTags)
                if (this.options.persist)
                    this.listTags.focus()

            }

        }).periodical(200, this)

        return this
    },

    processTags: function(tags) {
        // called when blurred tags entry, rebuilds hash tags preview

        var tagsArray = tags.split(',').map(function(el) {
            return el.trim().toLowerCase()
        }).unique()

        var target = this.element.getFirst()

        if (tagsArray.length) {
            this.listTags.set('value', '')
            var orig = this.getTags() || []
            tagsArray = orig.append(tagsArray).unique()
            target.empty()
            var done = 0
            Array.each(tagsArray, function(el) {
                el = el.toLowerCase()
                if (done >= this.options.maxItemCount) {
                    this.fireEvent('limitReached', el)
                    return
                }

                if (el.length >= this.options.minItemLength && el.length < this.options.maxItemLength) {
                    new Element([this.options.tagEls, '[html=', el, '<span class="tagClose"></span>]'].join('')).inject(target)
                    done++
                }
                else {
                    this.fireEvent('invalidTag', el)
                }
            }, this)

            this.fireEvent('tagsUpdate')
        }
    },

    removeTag: function(e) {
        var tag = e.target.getParent()
        var tagText = tag.get('text').toLowerCase()
        var self = this
        e.target.getParent().set('tween', {
            onComplete: function() {
                this.element.destroy()
                self.fireEvent('tagRemove', tagText)
            }
        }).fade(0)
        this.listTags.focus()
        clearTimeout(this.showTimer)
    },

    getTags: function() {
        // return an array of entered tags.
        var els = this.element.getElements(this.options.tagEls)
        return (els.length) ? els.get('text') : []
    }
})

}()