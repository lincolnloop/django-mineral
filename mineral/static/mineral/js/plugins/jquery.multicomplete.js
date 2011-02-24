/*
tabs plugin
TODO: jQuery this
*/
$.widget("ui.multicomplete", {

    // default options
    options: {
        source: null
    },

    _create: function() {
        this._multify();
    },


    _multify: function() {

        this.placeholder = $('<span class="item-placeholder"></span>');
        this.item_list = $('<span class="item-list"></span>');
        this.input = $(this.element).find('input[type=text]');
        var self = this;

        this.item_list.appendTo(this.placeholder);
        this.placeholder.insertBefore(this.input);

        this.input.insertAfter(this.item_list).addClass('ui-multicomplete-input');

        this.input.autocomplete({
            source: this.options.source,
            select: function(event, ui) {
                self.createItem(ui.item.value);
            },
            close: function(event, ui) {
                event.originalTarget.value = '';
                $(event.originalTarget).focus();
            }
        });
    },

    createItem: function(value) {
        var item = $('<span class="item">' + value + '</span>');
        var remove = $('<a class="remove">X</a><');
        remove.appendTo(item);
        item.appendTo(this.item_list);

        remove.bind('click', function() {
            $(this).parent().remove();
        });
    },

    destroy: function() {
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
        // now do other stuff particular to this widget
    }

});