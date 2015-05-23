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
			open();
		} else {
			// close button on the screen
			// do the animation first then change the button
			close();
		}
	}

	// is animating
	function start(){
		// is animating
		toggle.is_acting = true;
	}
	// animation finished
	function end(){
		toggle.is_acting = false;
	}

	function open(done){
		start();
		$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-left').addClass('glyphicon-chevron-right');
		$('.fixed-info').animate({right: '0px'}, function(){
			end();
			if(done) { done(); }
		});
	}

	function close(done){
		start();
		// change the button first then do the animation
		$('.fixed-info-button > span.glyphicon').removeClass('glyphicon-chevron-right').addClass('glyphicon-chevron-left');
		$('.fixed-info').animate({right: close_pos + 'px'}, function(){
			end();
			if(done) { done(); }
		});
	}

	function disable(done){
		close(function(){
			start();
			if(done) { done(); }
		});
	}

	function enable(done){
		end();
		if(done) { done(); }
	}

	function disabled(){
		return toggle.is_acting;
	}

	// if close button is on the screen then siderbar is open
	function isOpen(){
		return $('.fixed-info-button > span.glyphicon').hasClass('glyphicon-chevron-right');
	}

	// set information of img, here is info
	function set(info){
		if(info){
			$('.fixed-info-content').html('<h4>'
				// will use title if no photo-description exists
				+ info.title
				+ "</h4><p>"
				+ ((info['photo-description'])? info['photo-description'] : "" )
				+ "</p>"
				).click(function(){
					$(window.location).attr('href', info.url);
				});
		}

		// the size of siderbar is closed and recalculate close_pos
		close_pos = $('.fixed-info-button').width() - $('.fixed-info').width();
		$('.fixed-info').css('right', close_pos + 'px').css('top', 'auto').css('bottom', '23%');
		var content_max_width = $(window).width() * .8 ;
		$('.fixed-info-content').css('max-width', content_max_width);
	}

	// is mouse over?
	function isMouseover(){
		return isMouseover._mouseover;
	}

	// mouseout event
	function mouseout(fn){
		if(!mouseout._eventlist){
			mouseout._eventlist = [];
		}

		mouseout._eventlist.push(fn);
	}

	// set position with no info
	set();
	// register toggle event for button
	$('.fixed-info-button').on('click',toggle);
	// register window resize event
	$(window).resize(set());
	// register mouseover mouseout event for asider
	$('.fixed-info').on('mouseover', function(){ isMouseover._mouseover = true; });
	$('.fixed-info').on('mouseout', function(){
		isMouseover._mouseover = false;
		if(mouseout._eventlist && mouseout._eventlist.length > 0){
			for(var idx in mouseout._eventlist){
				mouseout._eventlist[idx]();
			}
		}
	});

	// return the methods to be used in rand-bg-img.js
	return { 'set': set, 'isOpen': isOpen, 'open': open, 'close': close, 'disable': disable, 
			'enable': enable, 'disabled': disabled, 'isMouseover': isMouseover, 'mouseout': mouseout };

})();