$(function init(){
	$('ul.nav > li > a').hover(
		function handlerIn(eventObject){
			$(this).parent().addClass('active');
		}
		,function handlerOut(eventObject){
			$(this).parent().removeClass('active');
		}
	).tooltip( {'container' : 'body'} );

	$('.left-photo-bg').on('click', function(event){
		if($(this).css('position') == 'fixed'){
			$(this).animate({ 'left': $('.left-nav').width() , 'right': (($(window).width() - $('.left-nav').width()) * .75 - 60) }, function(){
				$(this).css('position','static').parent().css('z-index','auto');
			});
		} else {
			$(this).css('position','fixed').parent().css('z-index','9999');
			$(this).animate({ 'left'    : '0'
						    ,  'right'  : '0'
							});
		}
	});
	$(window).resize(set_left_photo_bg_rl);
	function set_left_photo_bg_rl(){
		$('.left-photo-bg').css('left', $('.left-nav').width());
		$('.left-photo-bg').css('right', (($(window).width() - $('.left-nav').width()) * .75 - 60));
	}
	set_left_photo_bg_rl();
});