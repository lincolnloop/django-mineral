/*!
 * Generic Pagination Navigation
 *
 * Copyright (c) 2009 Eric Garside (http://eric.garside.name)
 * Dual licensed under:
 * 	MIT: http://www.opensource.org/licenses/mit-license.php
 *	GPLv3: http://www.opensource.org/licenses/gpl-3.0.html
 */
(function($){

	// Shortcut for fetching the last element of an array without modifying it
	Array.prototype.last = function(){ return this[this.length-1] }

	/** Event Declarations **/

	$('.ui-pagination-control')
		.live('disable', function(){
			$(this).addClass('ui-state-disabled');
		})
		.live('enable', function(){
			$(this).removeClass('ui-state-disabled');
		})
		.live('click', function(){

			if ($(this).hasClass('ui-state-disabled')) return false;

			var el = $(this),
				group = el.parent().data('pagination-group'),
				data = $.pagination.groups[group];

			switch (el.data('pagination-type')){
				case 'first': data.current = 0; break;
				case 'last': data.current = data.pages; break;
				case 'next': data.current++; break;
				case 'previous': data.current--; break;
				default: data.current = el.data('pagination-type'); break;
			}

			paginationCleanup(data, group);

			return false;
		})


	/** Plugin Options and Tracking **/

	$.pagination = {
		defaults: {
			pages: 0,
			current: 0,
			text: {
				first: '<<',
				last: '>>',
				next: '>',
				previous: '<',
				spacer: '...'
			},
			templates: {
				first: '<a class="ui-pagination-control ui-pagination-decrement ui-pagination-first" href="#"></a>',
				last: '<a class="ui-pagination-control ui-pagination-increment ui-pagination-last" href="#"></a>',
				next: '<a class="ui-pagination-control ui-pagination-increment ui-pagination-next" href="#"></a>',
				previous: '<a class="ui-pagination-control ui-pagination-decrement ui-pagination-previous" href="#"></a>',
				number: '<a class="ui-pagination-control ui-pagination-digit" href="#"></a>',
				spacer: '<span class="ui-pagination-spacer"></span>'
			},
			numPaddingDigits: 0,
			maxDigits: 8
		},
		groups: {}
	}

	/** jQuery Entry Point **/

	$.fn.pagination = function(group, options, callback){

		if ($.isFunction(options) && !callback){ callback = options; options = {} }

		switch (group){
				// key, options, group
			case 'renumber':
				callback = callback||this.data('pagination-group');
				var data = $.pagination.groups[callback];
				$.extend(data, options);
				data.pages--;
				createInitialDigits(data, callback);
				break;

				// key, callback, group
			case 'callback': $.extend($.pagination.groups[callback||this.data('pagination-group')], {callback: options}); break;

				// key, options, group
			case 'force-change':
				callback = callback||this.data('pagination-group');
				$.extend($.pagination.groups[callback], options);
				paginationCleanup($.pagination.groups[callback], callback);
				break;

			default: createPagination.call(this, group, options, callback); break;
		}

		return this;
	}

	/** Internals **/

	function createPagination(group, options, callback){
		if (typeof callback != 'function') callback = function(){}	// Create a dummy function

		options = $.extend(true, {}, $.pagination.defaults, options);

		var data = $.pagination.groups[group] = {
			current: options.current,
			pages: options.pages-1,
			callback: callback,
			incrementers: [],
			decrementers: [],
			allDigits: [],
			frontDigits: [],
			rearDigits: [],
			digits: [],
			frontSpacers: [],
			rearSpacers: [],
			thresholdLow: 0,
			thresholdHigh: options.pages-1
		};

		// Correct maxDigits for the spacers
		options.maxDigits = options.maxDigits - (options.numPaddingDigits*2);

		this.each(function(){
			var el = $(this), cDigit = 0;

			if (el.hasClass('ui-pagination')) return;

			el.addClass('ui-pagination').data('pagination-group', group);

			// Build the pagination from left to right
			var f = $(options.templates.first).data('pagination-type', 'first').text(options.text.first).appendTo(el),
				p = $(options.templates.previous).data('pagination-type', 'previous').text(options.text.previous).appendTo(el),
				n = $(options.templates.next).data('pagination-type', 'next').text(options.text.next),
				l = $(options.templates.last).data('pagination-type', 'last').text(options.text.last);

			if (options.numPaddingDigits){
				for (var fp = 0; fp < options.numPaddingDigits; ++fp){
					var pageNumber = $(options.templates.number).addClass('ui-pagination-anchor').appendTo(el);

					if (!data.allDigits[cDigit]) data.allDigits[cDigit] = [];
					data.allDigits[cDigit].push(pageNumber);

					if (!data.frontDigits[fp]) data.frontDigits[fp] = [];
					data.frontDigits[fp].push(pageNumber);

					cDigit++;
				}
			}

			data.frontSpacers.push($(options.templates.spacer).text(options.text.spacer).hide().appendTo(el));

			if (options.maxDigits)
				for (var i = 0; i < options.maxDigits; ++i){
					var pageNumber = $(options.templates.number).appendTo(el);

					if (!data.allDigits[cDigit]) data.allDigits[cDigit] = [];
					data.allDigits[cDigit].push(pageNumber);

					if (!data.digits[i]) data.digits[i] = [];
					data.digits[i].push(pageNumber);

					cDigit++;
				}

			data.rearSpacers.push($(options.templates.spacer).text(options.text.spacer).hide().appendTo(el));

			if (options.numPaddingDigits){
				for (var rp = options.numPaddingDigits-1; rp >= 0; --rp){
					var pageNumber = $(options.templates.number).addClass('ui-pagination-anchor').appendTo(el);

					if (!data.allDigits[cDigit]) data.allDigits[cDigit] = [];
					data.allDigits[cDigit].push(pageNumber);

					if (!data.rearDigits[rp]) data.rearDigits[rp] = [];
					data.rearDigits[rp].push(pageNumber);

					cDigit++;
				}
			}

			// Store references to our dec/incrementers
			data.decrementers.push(f,p);
			data.incrementers.push(n.appendTo(el),l.appendTo(el));
		})

		if (data.pages > 0)
			createInitialDigits(data, group);
	}

	// Forces the current page to be within the page bounds
	function correctCurrent(data){
		var current = data.current*1,
			dPages = (data.pages*1);

		if (dPages < 0){ dPages = 0; data.pages = 0 }

		if (current > dPages) data.current = dPages;
		else if (current < 0) data.current = 0;
	}

	// Create the visible numbers and spanners as we navigate through
	function createInitialDigits(data, group){
		var pages = data.pages+1,
			rearPages = pages,
			current = 0;

		// Create the front anchor pages
		$.each(data.frontDigits, function(k){
			$.each(this, function(){ if (pages) this.data('pagination-type', current).text(current+1).show(); else this.hide() })
			current++;
			if (pages) pages--;
		})

		data.thresholdLow = current;

		// Create the rear pages
		$.each(data.rearDigits, function(k){
			$.each(this, function(){ if (pages) this.data('pagination-type', rearPages-1).text(rearPages).show(); else this.hide() })
			rearPages--;
			if (pages) pages--;
		})

		data.thresholdHigh = rearPages-1;

		// Create any remainder pages
		$.each(data.digits, function(k){
			$.each(this, function(){ if (pages) this.data('pagination-type', current).text(current+1).show(); else this.hide() })
			current++;
			if (pages) pages--;
		})

		paginationCleanup(data, group);
	}

	// Applys opacity, disables invalid controls, formats numbers
	function paginationCleanup(data, group){
		correctCurrent(data);

		var current = data.current*1,
			next = current+1,
			prev = current-1,
			max = data.pages*1,
			containers = data.digits.length-1,
			last = max < containers ? max : containers,
			lowBounding = data.frontDigits.length ? data.frontDigits.last()[0].data('pagination-type')*1 : -1,
			highBounding = data.rearDigits.length ? data.rearDigits.last()[0].data('pagination-type')*1 : max+1,
			lowDisplay = data.digits[0][0].data('pagination-type')*1||0;
			highDisplay = data.digits[last][0].data('pagination-type')*1||max;

		// Correct our pages
		if (prev < 0) prev = 0;
		if (next > max) next = max;

		// Fall-thru calculation for visible digits
		if (current >= highBounding) renumberDigits( data, highBounding - containers -1 );
		else if (current <= lowBounding) renumberDigits( data, lowBounding+1 );
		else if (prev > lowBounding && prev < lowDisplay) renumberDigits( data, prev );
		else if (next < highBounding && next > highDisplay) renumberDigits( data, next-containers );

		// Rebuild the indexs
		lowDisplay = data.digits[0][0].data('pagination-type')*1;
		highDisplay = data.digits[last][0].data('pagination-type')*1;

		// Display/hide the spacers
		if (lowDisplay > data.thresholdLow) manageSpacers(data, 'front', 'show');
		else manageSpacers(data, 'front', 'hide');

		if (highDisplay < data.thresholdHigh) manageSpacers(data, 'rear', 'show');
		else manageSpacers(data, 'rear', 'hide');

		// Manage the digits
		$.each(data.allDigits, function(){
			var mode = this[0].data('pagination-type') == data.current ? 'disable' : 'enable';
			$.each(this, function(){ this.trigger(mode) })
			if (mode == 'disable') hasDisplayed = true;
		})

		// Manage the inc/decrementers
		$.each(data.decrementers, function(){ $(this).trigger( current == 0 ? 'disable' : 'enable' ) });
		$.each(data.incrementers, function(){ $(this).trigger( current == max ? 'disable' : 'enable' ) });

		// Fire the user callback
		data.callback.call(data.current, [group]);
	}

	// Used to quickly renumber the core digits
	function renumberDigits(data, start){
		$.each(data.digits, function(){
			$.each(this, function(){ this.data('pagination-type', start).text(start+1) })
			start++;
		})
	}

	function manageSpacers(data, type, act){
		$.each(data[type +'Spacers'], function(){
            if (act == 'show') {
                this.css('display', 'inline');
            } else {
                this.css('display', 'none');
            }
        });
	}

})(jQuery);