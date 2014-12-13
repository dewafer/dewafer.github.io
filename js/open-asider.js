// siderbar
var fixed_info_asider = (function init(){

	// right position for close
	var close_pos;

	function toggle(event){

		// skip if siderbar is animiating
		if(toggle.is_acting){
			return;
		}

		// toggle button and do animate
		if(!isOpen()){
			// open button on the screen
			$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
			$('.fixed-info').animate({right: '0px'}, finish);
		} else {
			// close button on the screen
			// do the animation first then change the button
			$('.fixed-info').animate({right: close_pos + 'px'}, function(){
				$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
				finish();
			});
		}

		// is animating
		toggle.is_acting = true;

		// animation finished
		function finish(){
			toggle.is_acting = false;
		}
	}

	// if close button is on the screen then siderbar is open
	function isOpen(){
		return $('.fixed-info-button > span.glyphicon').hasClass('glyphicon-chevron-right');
	}

	// set information of img, here is info
	function set(info){
		if(info){
			$('.fixed-info-content').html('<a href="' + info.url + '">'
				// will use excerpt if no photo-description exists
				+ ((info['photo-description'])? info['photo-description'] : info.excerpt )
				+ '</a>');
		}

		// the size of siderbar is closed and recalculate close_pos
		close_pos = $('.fixed-info-button').width() - $('.fixed-info').width();
		$('.fixed-info').css('right', close_pos + 'px').css('top', 'auto').css('bottom', '23%');
	}

	// set position with no info
	set();
	// register toggle event for button
	$('.fixed-info-button').on('click mouseenter',toggle);

	// return the methods to be used in rand-bg-img.js
	return { 'set': set, 'isOpen': isOpen };

})();