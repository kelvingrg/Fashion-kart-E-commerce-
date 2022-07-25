(function ($) {
 "use strict";
    
	//---------------------------------------------
	//Nivo slider
	//---------------------------------------------
		$('#ensign-nivoslider').nivoSlider({
			effect: 'random',
			slices: 15,
			boxCols: 8,
			boxRows: 4,
			animSpeed: 500,
			pauseTime: 6000,
			startSlide: 0,
			directionNav: true,
			controlNavThumbs: false,
			pauseOnHover: false,
			controlNav: false,
			prevText: '<i class="sp-angle-left"></i>',
			nextText: '<i class="sp-angle-right"></i>'
		});

})(jQuery); 