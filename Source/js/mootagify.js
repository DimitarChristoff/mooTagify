/*
---

name: mooTagify with auto suggest

description: provides an input for tags or labels

authors: Dimitar Christoff

license: MIT-style license.

version: 2.0.4

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
;(function(){
	'use strict';

	Array.implement({
		unique: function(){
			return [].combine(this);
		}
	});


	var autoSuggest = new Class({
		// private class, not exported

		Implements: [Options, Events],

		options: {
			width: 233,
			requestInstance: null,
			availableOptions: [],
			minChars: 2,
			wrapperZen: 'div.autocompleteWrapper',              // popup wrapper class
			wrapperShadow: 'boxShadow',                         // extra class applied to wrapper, like one with box-shadow
			maxHeight: 112,                                     // maximum allowed height for dropdown before it scrolls
			optionZen: 'div.autocompleteOption',                // base class of indivdual options
			optionClassSelected: 'autocompleteOptionSelected',  // pre-selected value class
			optionClassOver: 'autocompleteOptionOver',          // onmouseover option class
			highlightTemplate: '<span class="HL">{value}</span>',
			ajaxProperty: 'prefix'                              // it will pass on the typed value as prefix=NNNn
		},

		initialize: function(input, request, options){
			this.setOptions(options);

			this.options.availableOptions && this.options.availableOptions.length && (this.availableOptions = this.options.availableOptions);
			this.element = document.id(input);
			if (!this.element)
				return;

			this.request = request;
			this.buildList();
			this.attachEvents();
			this.index = -1;
			return this.fireEvent('ready');
		},

		buildList: function(){
			var visible = this.element.isVisible(),
				size;

			if (!visible){
				var clone = this.element.clone().setStyles({
					opacity: 0.01,
					position: 'absolute',
					top: -1000
				}).inject(document.body).show();

				size = clone.getSize();
				clone.destroy();
			}
			else {
				size = this.element.getSize();
			}

			var width = this.options.width || size.x - 2,
				height = size.y,
				self = this;

			this.wrapper = new Element(this.options.wrapperZen, {
				styles: {
					width: width,
					marginTop: height
				},
				events: {
					mouseenter: function(){
						self.over = true;
					},
					mouseleave: function(){
						self.over = false;
					},
					outerClick: function(){
						if (!self.focused)
							self.hide();
					},
					'click:relay(div)': function(){
						self.select(this.retrieve('index'));
					}
				}
			}).inject(this.element, 'before');

			this.wrapper.addClass(this.options.wrapperShadow);
			this.scrollFx = new Fx.Scroll(this.wrapper, {
				duration: 200
			});
		},

		handleData: function(data){
			if (data && data.length){
				this.show();
				this.addOptions(data);
			}
			else if (!this.request && this.availableOptions.length && data.length){
				this.show();
				this.addOptions(data);
			}
			else {
				this.clearOptions();
				this.hide();
			}
		},

		attachEvents: function(){
			this.element.addEvents({
				keydown: this.handleKey.bind(this),
				keyup: this.handleText.bind(this),
				focus: this.handleText.bind(this),
				blur: this.blur.bind(this)
			}).setStyle('width', this.options.width - 3);

			if (this.request){
				this.request.setOptions({
					timeout: 30000,
					link: 'cancel',
					onSuccess: this.handleData.bind(this)
				});
			}
			else {
				this.addOptions(this.options.availableOptions);
			}

			return this;
		},

		addOptions: function(answers){
			var self = this;

			this.wrapper.empty();
			this.answers = answers || [];
			this.answersOptions = new Elements();

			var val = {
				value: this.element.get('value').clean()
			};

			this.answers.each(function(option, index){
				self.addOption(option, val, index);
			});
		},

		addOption: function(option, val, index){
			var matches = option.match(val.value, 'i'),
				value = option,
				self = this;

			if (matches && matches.length){
				matches.each(function(substring){
					val.value = substring;
					value = option.replace(substring, self.options.highlightTemplate.substitute(val), 'ig');
				});
			}

			var opt = new Element(this.options.optionZen, {
				html: value
			}).inject(this.wrapper).store('index', index);

			index === this.index && opt.addClass(this.options.optionClassSelected);

			this.answersOptions.push(opt);

			if (this.options.maxHeight){ // if greater than 0 care about this
				this.wrapper.setStyle('height', 'auto');
				var height = this.wrapper.getSize().y;

				if (height >= this.options.maxHeight){
					this.wrapper.setStyle('height', this.options.maxHeight);
				}

			}
		},

		handleKey: function(e){
			switch (e.code){
				case 8:
					// backspace.
					var len = e.target.get('value').clean();
					len.length || this.fireEvent('delete');
					break;
				case 40:
					e && e.stop();
					if (!this.answersOptions)
						break;

					if (this.answersOptions[this.index])
						this.answersOptions[this.index].addClass(this.options.optionClassSelected);

					if (this.index < this.answersOptions.length - 1){
						this.answersOptions.removeClass(this.options.optionClassSelected);
						this.index++;
						this.answersOptions[this.index].addClass(this.options.optionClassSelected);
					}
					else {
						this.answersOptions.removeClass(this.options.optionClassSelected);
						this.index = 0;
						if (!this.answersOptions[this.index])
							break;

						this.answersOptions[this.index].addClass(this.options.optionClassSelected);
					}
					this.scrollFx.toElement(this.answersOptions[this.index]);
					this.fireEvent('down');
					break;
				case 38:
					e && e.stop();
					if (!this.answersOptions)
						break;

					if (this.answersOptions[this.index])
						this.answersOptions[this.index].addClass(this.options.optionClassSelected);

					if (this.index > 0){
						this.answersOptions.removeClass(this.options.optionClassSelected);
						this.index--;
						this.answersOptions[this.index].addClass(this.options.optionClassSelected);
					}
					else {
						this.answersOptions.removeClass(this.options.optionClassSelected);
						this.index = this.answersOptions.length - 1;
						if (!this.answersOptions[this.index])
							break;

						this.answersOptions[this.index].addClass(this.options.optionClassSelected);
					}

					this.scrollFx.toElement(this.answersOptions[this.index]);
					this.fireEvent('up');
					break;
				case 13:
					e && e.preventDefault && e.preventDefault();

					if (this.index !== -1){
						this.select(this.index);
					}
					else {
						this.element.blur();
					}
					break;
			}

		},

		handleText: function(e){
			// it's where the ajax look ahead happens...
			if (e && e.code){
				if ([38, 40].contains(e.code))
					return;
			}

			var val = this.element.get('value');
			if (val.length <= this.options.minChars){
				this.hide();
				return;
			}

			var obj = {};
			obj[this.options.ajaxProperty] = val;
			if (this.request){
				this.request.get(obj);
			}
			else {
				this.handleData(this.availableOptions.filter(function(el){
					return el.test(val, 'i');
				}));
			}
		},

		clearOptions: function(){
			this.answers = [];
			this.answersOptions = new Elements();
			this.wrapper.empty();
			this.index = -1;
			this.hide();

			return this;
		},

		select: function(index){
			this.element.set('value', this.answers[index]).blur();
			this.clearOptions();
			this.fireEvent('select', index);

			return this;
		},

		hide: function(){
			this.wrapper.setStyle('display', 'none');

			return this;
		},

		show: function(){
			this.wrapper.setStyle('display', 'block');
			this.focused = true;

			return this;
		},

		blur: function(){
			this.element.set('value', this.element.get('value').clean());
			this.focused = false;
			if (!this.over)
				this.hide();

			return this;
		}

	});

	var mooTagify = new Class({

		Implements: [Options, Events],

		options: {
			/*
			onReady: Function.From,
			onLimitReached: function(rejectedTag) {},
			onInvalidTag: function(rejectedTag) {},
			onTagsUpdate: Function.From,
			onTagRemove: function(tagText) {},
			*/
			tagEls: 'div.tag',
			closeEls: 'span.tagClose',
			minItemLength: 3,
			maxItemLength: 16,
			maxItemCount: 10,
			persist: true,
			autoSuggest: false,
			/* predefinedAnswers: ['answer 1','answer two'], */
			addOnBlur: true,
			/* set to true, to keep case as entered */
			caseSensitiveTagMatching: false
			/* custom getter for the initial tags, if provided. function or csv string */
			/* initialTags: function(){
				// expected return is comma separated trimmed tags.
				return this.listTags.get('value').clean();
			} */
		},

		initialize: function(element, request, options){
			this.element = document.id(element);
			if (!this.element)
				return;

			this.request = request;
			this.setOptions(options);

			this.listTags = this.element.getElement('input,textarea');
			if (!this.listTags)
				return;

			this.attachEvents();
			this.getInitialTags();

			return this;
		},

		getInitialTags: function(){
			// options.tags - get string values if string, if func, get return value, otherwise, read from element.
			var getter = this.options.initialTags,
				type = typeof getter,
				tags = type === 'string' ? getter : type === 'function' ? getter.call(this) : this.listTags.get('value').clean();

			// if we have any tags found, set them.
			tags && tags.length && this.processTags(tags);

			return this;
		}.protect(),

		attachEvents: function(){
			var self = this,
				obj = {
					onDelete: function(){
						var last = self.element.getElements(self.options.tagEls).getLast();
						last && self.element.fireEvent('click', {
							target: last.getElement(self.options.closeEls)
						});
					}
				};
			if (this.options.autoSuggest){
				this.options.availableOptions && (obj['availableOptions'] = this.options.availableOptions);
				this.autoSuggester = new autoSuggest(this.element.getElement('input'), this.request, obj);
			}

			this.clicked = false;

			var eventObject = {
				'blur:relay(input)': this.extractTags.bind(this),
				'mousedown': function(){
					self.clicked = true;
				},
				'mouseup': function(){
					self.clicked = false;
				},
				'keydown:relay(input)': function(e, el){
					if (e.key == 'enter'){
						if (self.options.addOnBlur){
							el.blur();
						}
						else {
							self.extractTags() && e.stop();
						}
					}
				}
			};

			eventObject['click:relay(' + self.options.closeEls + ')'] = this.removeTag.bind(this);
			this.options.addOnBlur || (delete eventObject['blur:relay(input)']);
			this.element.addEvents(eventObject);
			return this.fireEvent('ready');
		},

		extractTags: function(){
			var self = this,
				check = function(){
					if (self.clicked)
						return false;

					clearInterval(self.timer);

					var newTags = self.listTags.get('value').clean().stripScripts();
					self.options.caseSensitiveTagMatching || (newTags = newTags.toLowerCase());

					if (newTags.length){
						self.processTags(newTags);
						self.options.persist && self.listTags.focus.delay(10, self.listTags);
					}
					self.options.autoSuggest && self.autoSuggester.hide();
					return true;
				};

			clearInterval(this.timer);

			check() || (this.timer = check.periodical(200));

			return this;
		},

		processTags: function(tags){
			// called when blurred tags entry, rebuilds hash tags preview
			clearInterval(this.timer);
			var tagsArray = tags.split(',').map(function(el){
				el = el.trim();
				return el;
			}).unique();

			var target = this.element.getFirst();

			if (tagsArray.length){
				this.listTags.set('value', '');
				var orig = this.getTags() || [];
				tagsArray = orig.append(tagsArray).unique();

				/* remove tags that only differ in case */
				var tempArray = [];
				tagsArray.each(function(tag){
					var found = tempArray.some(function(item){
						return item.toLowerCase() == tag.toLowerCase();
					});
					if (!found){
						tempArray.push(tag);
					}
				});
				tagsArray = tempArray;

				target.empty();
				var done = 0, added = [];
				Array.each(tagsArray, function(el){
					this.options.caseSensitiveTagMatching || (el = el.toLowerCase());

					if (done >= this.options.maxItemCount){
						this.fireEvent('limitReached', el);
						return;
					}

					if (el.length >= this.options.minItemLength && el.length < this.options.maxItemLength){
						new Element(this.options.tagEls, {
							html: el
						}).adopt(new Element(this.options.closeEls)).inject(target);
						done++;
						added.push(el);
					}
					else {
						this.fireEvent('invalidTag', el);
					}
				}, this);
				this.fireEvent('tagsUpdate', added);
			}

			return this;
		},

		removeTag: function(e, el){
			var tag = el ? el.getParent() : e.target.getParent(),
				tagText = tag.get('text');

			e && e.stop && e.stop();

			this.options.caseSensitiveTagMatching || (tagText = tagText.toLowerCase());

			tag.destroy();
			this.fireEvent('tagRemove', tagText);
			clearTimeout(this.timer);
			this.options.persist && this.listTags.focus.delay(10, this.listTags);

			return this;
		},

		getTags: function(){
			// return an array of entered tags.
			var els = this.element.getElements(this.options.tagEls);
			return (els.length) ? els.get('text') : [];
		}
	});


	if (typeof define === 'function' && define.amd){
		define(function(){
			return mooTagify;
		});
	}
	else {
		this.mooTagify = mooTagify;
	}
}).call(this);