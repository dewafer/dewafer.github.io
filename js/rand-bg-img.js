// The following is an anynomous function 
// and will be executed once loaded.
// The reason why we use an anynomous 
// function here is to avoid unintentional 
// global namespace override.
(function init() {

	// show background images randomly
	var images = [];

	// background change interval in seconds
	var BG_CHG_INTERVAL_SEC = 22;

	// interval id for stop
	var img_interval_id;

	// start
	request_images(function done(){
		if( images.length < 1){
			// fail safe
			remove_loading();
			$('.cover-img.holderjs').attr('data-background-src', '?holder.js/1920x1080/social/text:Hello, World!');
			// if no photos exist, there will be a hello-world picture.
			Holder.run({images:$('.cover-img.holderjs').get(0)})
			return;
		} 

		// load first img
		load_bg_img();

		if( images.length > 1 ){
			// start interval
			img_interval_id = setInterval(load_bg_img, BG_CHG_INTERVAL_SEC * 1000);
		}
	});

	// this method uses Ajax to load
	// images list from some RESTFUL APIs which will
	// return a json object.
	function request_images (do_next) {
		// load img list
		$.getJSON('/background-photos/json/', function success(data){
			if(data['background-photos']){
				// clear img list
				images = [];

				for(var i=0; i< data['background-photos'].length; i++) {
					if(data['background-photos'][i]['photo-url']){
						// load img list from json object
						var img = data['background-photos'][i];
						images.push(img);

						// create pointer for each img
						var pointer = $('<li>');
						pointer
							.attr('data-photo-id', i)
							.on('click', function(){
								// go to the img if li is clicked

								var theLi = this;
								// close if info is open
								if(fixed_info_asider.isOpen()){
									fixed_info_asider.close(next);
								} else {
									next();
								}

								function next(){
									// the next picture will be the id of li -1
									next_random.next = $(theLi).attr('data-photo-id') - 1;
									load_bg_img();
									$(theLi).addClass('active');
									$(theLi).siblings().removeClass('active');
								}
							})
							.appendTo('.photo-list-pointer > ul');

						if(i == 0){
							pointer.addClass('active');
						}
					}
				}
			}
			if(do_next){
				// do while done
				do_next();
			}
		});
	}

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

			// skip if info is open
			if(fixed_info_asider.isOpen()){
				return;
			}

			var next_img = next_rand_img();

			// fading in and out image when it's loaded
			img_cache = $('<img/>');
			img_cache.on('load', function () {
				remove_loading();

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

				// load inf of img to the siderbar
				fixed_info_asider.set(next_img);

				// active img's li
				var pointer = $('li[data-photo-id="'+ next_random.next + '"]');
				pointer.siblings().removeClass('active');
				pointer.addClass('active');

			});
			
			// load next rand img
			img_cache.attr('src',next_img['photo-url']);
		})();
		
		// keep the current img
		load_bg_img._img_cache = img_cache;
	}

	// get next img
	function next_rand_img(){
		return images[next_random(images.length)];
	}

	// get a random index of the images array
	function next_random(max){

		// if initialized and length of images(max) is not changed
		if( next_random.shifted_list && next_random.next !== undefined
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
		next_random.next = -1;

		// next random index number
		return _get_next();

		// get the next random index number
		function _get_next(){
			next_random.next = (next_random.next + 1) % max;
			return next_random.shifted_list[next_random.next];
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

	// remove loading block from DOM
	function remove_loading(){
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
	}

})();
