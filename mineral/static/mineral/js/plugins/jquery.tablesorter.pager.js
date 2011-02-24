(function($) {
	$.extend({
		tablesorterPager: new function() {

			function updatePageDisplay(c) {
				var s = $(c.cssPageDisplay,c.container).val((c.page+1) + c.seperator + c.totalPages);
			}

			function setPageSize(table,size) {
				var c = table.config;
				c.size = size;
				c.totalPages = Math.ceil(c.totalRows / c.size);
				c.pagerPositionSet = false;
				moveToPage(table);
				fixPosition(table);
			}

			function fixPosition(table) {
				var c = table.config;
				if(!c.pagerPositionSet && c.positionFixed) {
					var c = table.config, o = $(table);
					if(o.offset) {
						c.container.css({
							top: o.offset().top + o.height() + 'px',
							position: 'absolute'
						});
					}
					c.pagerPositionSet = true;
				}
			}

			function moveToFirstPage(table) {
				var c = table.config;
				c.page = 0;
				moveToPage(table);
			}

			function moveToLastPage(table) {
				var c = table.config;
				c.page = (c.totalPages-1);
				moveToPage(table);
			}

			function moveToNextPage(table) {
				var c = table.config;
                if (c.page < (c.totalPages-1)) {
                    c.page += 1;
                    moveToPage(table);
                }
			}

			function moveToPrevPage(table) {
				var c = table.config;
                if (c.page > 0) {
                    c.page -= 1;
                    moveToPage(table);
                }
			}


			function moveToPage(table) {
				var c = table.config;
				if(c.page < 0 || c.page > (c.totalPages-1)) {
					c.page = 0;
				}

				renderTable(table,c.rowsCopy);
                renderPagination(table);
			}

			function renderTable(table,rows) {

				var c = table.config;
				var l = rows.length;
				var s = (c.page * c.size);
				var e = (s + c.size);
				if(e > rows.length ) {
					e = rows.length;
				}


				var tableBody = $(table.tBodies[0]);

				// clear the table body

				$.tablesorter.clearTableBody(table);

				for(var i = s; i < e; i++) {

					//tableBody.append(rows[i]);

					var o = rows[i];
					var l = o.length;
					for(var j=0; j < l; j++) {

						tableBody[0].appendChild(o[j]);

					}
				}

				fixPosition(table,tableBody);

				$(table).trigger("applyWidgets");

				if( c.page >= c.totalPages ) {
        			moveToLastPage(table);
				}

				updatePageDisplay(c);
			}

            function renderPagination(table) {
                /*
                 * Creates numbered pagination links
                 * and appends to config.cssPaginationDisplay
                 */
                var config = table.config;
                var pager = config.container;

                var paginationNode = $(pager).find(config.cssPaginationDisplay);
                paginationNode.children('span.page').remove();

                if (config.totalPages) {
                    for (var x=0; x < config.totalPages; x+=1) {
                        $('<span class="page">' + (x+1) + '</span>').appendTo(paginationNode);
                    }
                }

                var pages = paginationNode.children('span.page');
                if (config.totalPages > 1) {
                    pages.bind('click', function() {
                        config.page = parseInt($(this).text()) - 1;
                        moveToPage(table);
                    });
                }

                $(pages[config.page]).addClass('active');

            }

			this.appender = function(table,rows) {

				var c = table.config;

				c.rowsCopy = rows;
				c.totalRows = rows.length;
				c.totalPages = Math.ceil(c.totalRows / c.size);

				renderTable(table,rows);
			};

			this.defaults = {
				size: 10,
				offset: 0,
				page: 0,
				totalRows: 0,
				totalPages: 0,
				container: null,
				cssNext: '.next',
				cssPrev: '.prev',
				cssFirst: '.first',
				cssLast: '.last',
				cssPaginationDisplay: '.pagination',
				cssPageDisplay: '.pagedisplay',
				cssPageSize: '.pagesize',
				seperator: "/",
				positionFixed: true,
				appender: this.appender
			};

			this.construct = function(settings) {

				return this.each(function() {

					config = $.extend(this.config, $.tablesorterPager.defaults, settings);

					var table = this, pager = config.container;

					$(this).trigger("appendCache");

					$(config.cssFirst,pager).click(function() {
						moveToFirstPage(table);
						return false;
					});
					$(config.cssNext,pager).click(function() {
						moveToNextPage(table);
						return false;
					});
					$(config.cssPrev,pager).click(function() {
						moveToPrevPage(table);
						return false;
					});
					$(config.cssLast,pager).click(function() {
						moveToLastPage(table);
						return false;
					});
					$(config.cssPageSize,pager).change(function() {
						setPageSize(table,parseInt($(this).val()));
						return false;
					});

                    renderPagination(table);


				});
			};

		}
	});
	// extend plugin scope
	$.fn.extend({
        tablesorterPager: $.tablesorterPager.construct
	});

})(jQuery);