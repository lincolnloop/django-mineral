/**
*	@name							Defaultvalue
*	@descripton						Gives value to empty inputs
*	@version						1.3.1
*	@requires						Jquery 1.3.2
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licens							MIT License - http://www.opensource.org/licenses/mit-license.php
*
*	@param {String} str				The default value
*	@param {Function} callback		Callback function
*/

(function(jQuery){
     jQuery.fn.extend({
         defaultValue: function(o, callback) {
			
			var options = o || {};
			var settings = jQuery.extend({
     			value: options.value || null
  			}, options);
			
            return this.each(function(index, element) {
				
				var $input				=	$(this);
				var	defaultValue		=	settings.value || $input.attr('rel');
				var	callbackArguments 	=	{'input':$input};
					
				// Create clone and switch
				var $clone = createClone();
				
				// Add clone to callback arguments
				callbackArguments.clone = $clone;
				
				$clone.insertAfter($input);
				
				var setState = function() {
					if( $input.val().length <= 0 ){
						$clone.show();
						$input.hide();
					} else {
						$clone.hide();
						$input.show();
					}
				};
				
				// Events for password fields
				$input.bind('blur', setState);
				
				// Create a input element clone
				function createClone(){
					
					var $el;
					
					if($input.context.nodeName.toLowerCase() == 'input') {
						$el = jQuery("<input />").attr({
							'type'	: 'text'
						});
					} else if($input.context.nodeName.toLowerCase() == 'textarea') {
						$el = jQuery("<textarea />");	
					}
					
					$el.attr({
						'value'		: defaultValue,
						'class'		: $input.attr('class')+' empty',
						'size'		: $input.attr('size'),
						'style'		: $input.attr('style'),
						'tabindex' 	: $input.attr('tabindex'),
						'name'		: 'defaultvalue-clone-' + (((1+Math.random())*0x10000)|0).toString(16).substring(1)
					});
					
					$el.focus(function(){
					
						// Hide text clone and show real password field
						$el.hide();
						$input.show();
						
						// Webkit and Moz need some extra time
						// BTW $input.show(0,function(){$input.focus();}); doesn't work.
						setTimeout(function () {
							$input.focus();
						}, 1);
					
					});				
					
					return $el;
				}

				setState();
				
				if(callback){
					callback(callbackArguments);
				}	
				
            });
        }
    });
})(jQuery);