// The following is an anynomous function 
// and will be executed once loaded.
// The reason why we use an anynomous 
// function here is to avoid unintentional 
// global namespace override.
(function init() {
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

	// load img
	function load_bg_img(){

		// the cache here is to keep the current loading img alive
		// if the network condition of the user is not very well
		// and the img is still loading after the interval
		// this could stop the browser to load the next img
		var img_cache = load_bg_img._img_cache;

		// start load
		(function load(){

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
		})();
		
		// keep the current img
		load_bg_img._img_cache = img_cache;
	}

	// get next img
	function next_rand_img(){
		// TODO: change this method to use Ajax to load
		// images list from some RESTFUL APIs which will
		// return a json object.
		return images[next_random(images.length)];
	}

	// get a random index of the images array
	function next_random(max){

		// if initialized and length of images(max) is not changed
		if( next_random.shifted_list &&  next_random.next 
			&& max == next_random.shifted_list.length ){
			// get next random index number
			return _get_next();
		}

		// initialize the random list
		var shifted_list = [];
		for( var i = 0 ; i < max ; i++ ){
			shifted_list[i] = i;
		}
		// use Array.sort(function(){...}) to sort the list randomly
		shifted_list.sort(function(a, b){ return 0.5 - Math.random(); });
		// apply static fields
		next_random.shifted_list = shifted_list;
		next_random.next = 0;

		// next random index number
		return _get_next();

		// get the next random index number
		function _get_next(){
			return next_random.shifted_list[next_random.next++ % max];
		}
	}

	// test will print [0, 1, 2, 3, 4, <repeat from 0>...] to your console every 300ms
	// the sort of [0, 1, 2, 3, 4] is random
	// setInterval(function test(){ console.log(next_random(5)); }, 300);

	$(window).resize(sync_cover_img_height);

	// make sure .site-wrapper and .cover-img have got the same size
	function sync_cover_img_height(){
		$('.cover-img').height($('.site-wrapper').height());
	}

})();
