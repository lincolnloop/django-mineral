/*
tabs plugin
TODO: jQuery this
*/
$.widget("ui.prototify", {

    // default options
    options: {
        type: 'box'
    },

    _create: function() {
        var canvas = this.element.get(0);
        var width = canvas.width;
        var height = canvas.height;
        var textContent = canvas.textContent;


        canvas = canvas.getContext('2d');

        canvas.lineWidth = 1;
        canvas.strokeStyle = '#999';

        canvas.beginPath();
        canvas.moveTo(0,0);
        canvas.lineTo(width, height);
        canvas.closePath();
        canvas.stroke();

        canvas.beginPath();
        canvas.moveTo(0, height);
        canvas.lineTo(width, 0);
        canvas.closePath();
        canvas.stroke();

        canvas.font = "18pt Arial";
        canvas.textAlign = "center";
        canvas.textBaseline = "middle";
        canvas.fillText(textContent, width/2, height/2, width);
    },

    destroy: function() {
        $.Widget.prototype.destroy.apply(this, arguments); // default destroy
        // now do other stuff particular to this widget
    }

 });


$("ul.auto-tabs li a:not(.format)").live("click", function(){
    var li_obj = $(this).parent();
    var selected_tab = $(this).attr("rel");

    // remove previously selected items
    li_obj.parent().parent().children(".tab").addClass("hidden").removeClass("selected");
    li_obj.parent().children("li.selected").removeClass("selected");


    li_obj.addClass("selected");
    $("#" + selected_tab).removeClass("hidden").addClass("selected");

    return false;
});