(function () {
	// show background images randomly
	var images = [
		"large_image/DSC_4041_1920.jpg"
		,"large_image/DSC_4042_1920.jpg"
		,"large_image/DSC_4043_1920.jpg"
		,"large_image/DSC_4047_1920.jpg"
		,"large_image/DSC_4071_1920.jpg"
	];

	// background change interval in seconds
	var BG_CHG_INTERVAL_SEC = 22;

	// load first img
	load_bg_img();

	// start interval
	var img_interval_id = setInterval(load_bg_img, BG_CHG_INTERVAL_SEC * 1000);

	var img_cache;

	// load img
	function load_bg_img(){
		// skip if it's still loading
		if(img_cache && !img_cache.prop('complete')){
			return;
		}

		// fading in and out image when it's loaded
		img_cache = $('<img/>');
		img_cache.on('load', function () {
			if( $('#loading_block').length > 0 ){
				// first time loaded, fadeout loading block
				$('#loading_block').fadeOut(function(){
					// remove loading block
					$(this).remove();
					// slide all the childrens of body
					$('div.cover-container > div').slideDown(function(){
						// fix overflow
						$('div.cover-container > div').css('overflow', 'visible');
						// resize on DOM finished.
						sync_cover_img_height();
					});
				});
			}

			// display img
			$('.cover-img > div')
				.fadeOut()
				.remove();
			$('<div/>')
				.addClass('cover-img')
				.css('background-image', 'url(' + img_cache.attr('src') + ')')
				.css('display', 'none')
				.appendTo('.cover-img')
				.fadeIn();
		});
		
		// load next rand img
		img_cache.attr('src',next_rand_img());
	}

	var last_img_idx;

	// get next img
	function next_rand_img(){
		var next;
		do{
			next = Math.floor(images.length * Math.random());
		}while(last_img_idx == next);

		last_img_idx = next;
		return images[next];
	}

	$(window).resize(sync_cover_img_height);

	// make sure .site-wrapper and .cover-img have got the same size
	function sync_cover_img_height(){
		$('.cover-img').height($('.site-wrapper').height());
	}

})();
