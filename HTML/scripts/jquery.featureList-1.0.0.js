/*
 * FeatureList - simple and easy creation of an interactive "Featured Items" widget
 * Examples and documentation at: http://jqueryglobe.com/article/feature_list/
 * Version: 1.0.0 (01/09/2009)
 * Copyright (c) 2009 jQueryGlobe
 * Licensed under the MIT License: http://en.wikipedia.org/wiki/MIT_License
 * Requires: jQuery v1.3+
*/
;(function($) {
	$.fn.featureList = function(options) {
		var tabs	= $(this);
		var output_list	= $(options.output_list);
		new jQuery.featureList(tabs, output_list, options);

		return this;	
	};

	$.featureList = function(tabs, output_list, options) {
		function slide(nr) {
			if (typeof nr == "undefined") {
				nr = visible_item + 1;
				nr = nr >= total_items ? 0 : nr;
			}
			
			if(output_list.is(":not(:animated)")){
			tabs.removeClass('current').filter(":eq(" + nr + ")").addClass('current');
			}
			moveWidth=itemWidth*nr;
			output_list.not(":animated").animate( { left: "-" + moveWidth }, 800 ,"easeOutExpo", function(){
			visible_item = nr;
			});

		}
        var type=arguments[3]||0;
		var options			= options || {}; 
		var total_items		= tabs.length;
		var visible_item	= options.start_item || 0;
		var moveWidth       = 0;
		var prev_btn        = options.prev_btn;
		var next_btn        = options.next_btn;
		var itemWidth       =$(output_list).find("dt").width();

		options.pause_on_hover		= options.pause_on_hover		|| true;
		options.transition_interval	= options.transition_interval	|| 3000;
		tabs.eq( visible_item ).addClass('current'); 
		tabs.click(function() {
			if ($(this).hasClass('current')) {
				return false;	
			}
            
			slide( tabs.index( this) );
		});
        next_btn.click(function(){
			nt=visible_item + 1;
			nt = nt >= total_items ? 0 : nt;
			slide(nt);
		});
        prev_btn.click(function(){
			nt=visible_item - 1;
			nt = nt < 0  ? total_items-1 : nt;
			slide(nt);
		});
		if (options.transition_interval > 0) {
			var timer = setInterval(function () {
				slide();
			}, options.transition_interval);

			if (options.pause_on_hover) {
				tabs.mouseenter(function() {
					clearInterval( timer );
				}).mouseleave(function() {
					clearInterval( timer );
					timer = setInterval(function () {
						slide();
					}, options.transition_interval);
				});
				output_list.mouseenter(function() {
					clearInterval( timer );
				}).mouseleave(function() {
					clearInterval( timer );
					timer = setInterval(function () {
						slide();
					}, options.transition_interval);
				});
			}
		}
	};
})(jQuery);