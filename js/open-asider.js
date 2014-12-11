(function init(){

	var close_pos = $('.fixed-info-button').width() - $('.fixed-info').width();
	$('.fixed-info').css('right', close_pos + 'px').css('top', 'auto').css('bottom', '170px');

	$('.fixed-info-button').on('click mouseenter',toggle);

	function toggle(event){

		if(toggle.is_acting){
			return;
		}

		if($('.fixed-info-button > span.glyphicon').hasClass('glyphicon-chevron-left')){
			// open button on the screen
			$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
			$('.fixed-info').animate({right: '0px'}, finish);
		} else {
			// close button on the screen
			$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
			$('.fixed-info').animate({right: close_pos + 'px'}, finish);
		}

		toggle.is_acting = true;

		function finish(){
			toggle.is_acting = false;
		}
	}

})();