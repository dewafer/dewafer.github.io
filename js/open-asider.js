var fixed_info_asider = (function init(){

	var close_pos;

	function toggle(event){

		if(toggle.is_acting){
			return;
		}

		if(!isOpen()){
			// open button on the screen
			$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
			$('.fixed-info').animate({right: '0px'}, finish);
		} else {
			// close button on the screen
			$('.fixed-info').animate({right: close_pos + 'px'}, function(){
				$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
				finish();
			});
		}

		toggle.is_acting = true;

		function finish(){
			toggle.is_acting = false;
		}
	}

	function isOpen(){
		return $('.fixed-info-button > span.glyphicon').hasClass('glyphicon-chevron-right');
	}

	function set(info){
		if(info){
			$('.fixed-info-content').html('<a href="' + info.url + '">'
				+ ((info['photo-description'])? info['photo-description'] : info.excerpt )
				+ '</a>');
		}

		close_pos = $('.fixed-info-button').width() - $('.fixed-info').width();
		$('.fixed-info').css('right', close_pos + 'px').css('top', 'auto').css('bottom', '23%');
		$('.fixed-info-button').on('click mouseenter',toggle);
	}
	set();

	return { 'set': set, 'isOpen': isOpen };

})();