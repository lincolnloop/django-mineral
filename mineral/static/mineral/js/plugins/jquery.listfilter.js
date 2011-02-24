/*
Filter plugin
*/
$.widget("ui.listfilter", {

    // default options
    options: {},

    _create: function() {

		var filter = $(this.element);

        filter.keyup(function(){

            filter.parent().next('.choices').find('li').each(function () {
                if ($(this).text().search(new RegExp(filter.val(), "i")) < 0) {
                    $(this).hide();
                } else {
                    $(this).show();
                }
            });

        });


    },

    destroy: function() {
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
        // now do other stuff particular to this widget
    }

});