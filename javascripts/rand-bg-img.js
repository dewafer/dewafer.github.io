// The following is an anynomous function 
// and will be executed once loaded.
// The reason why we use an anynomous 
// function here is to avoid unintentional 
// global namespace override.
(function init() {

	// show background images randomly
	var images = [];

	// background change interval in seconds
	var BG_CHG_INTERVAL_SEC = 12;

	// interval id for stop
	var img_interval_id;

	// this flag controls the asider open-status after load
	load_bg_img._open_asider_after_load = false;

	// start
	request_images(function done(){
		if( images.length < 1){
			// fail safe
			hide_loading();
			$('.cover-img.holderjs').attr('data-background-src', '?holder.js/1920x1080/social/text:Hello, World!');
			// if no photos exist, there will be a hello-world picture.
			Holder.run({images:$('.cover-img.holderjs').get(0)})
			return;
		} 

		// load first img
		load_bg_img();

		reset_interval();

		// reset interval when asider close
		fixed_info_asider.mouseout(function (){
			reset_interval();
		});
	});

	function reset_interval(){
		if(img_interval_id){
			clearInterval(img_interval_id);
		}
		if( images.length > 1 ){
			// start interval
			img_interval_id = setInterval(load_bg_img, BG_CHG_INTERVAL_SEC * 1000);
		}
	}

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
					if(data['background-photos'][i]['photo-url'] && 
						(data['background-photos'][i]['show-on-homepage'] && data['background-photos'][i]['show-on-homepage'] == 'true')
																	){
						// load img list from json object
						var img = data['background-photos'][i];
						images.push(img);

						// create pointer for each img
						var pointer = $('<li>');
						pointer
							.attr('data-photo-id', images.length - 1)
							.on('click', function(){
								// go to the img if li is clicked

								var theLi = this;
								// there is no need to close the open
								// siderbar because it will be automatically
								// closed in the load_bg_img function
								// close if info is open
								//if(fixed_info_asider.isOpen()){
								//	fixed_info_asider.close(next);
								//} else {
									next();
								//}

								function next(){
									fixed_info_asider.disable();
									if(load_bg_img._is_loading()) return;
									// the next picture will be the id of li -1
									next_random.next = $(theLi).attr('data-photo-id') - 1;
									load_bg_img(true, function (){ if(fixed_info_asider.disabled){ fixed_info_asider.enable(); } });
									$(theLi).addClass('active');
									$(theLi).siblings().removeClass('active');
									reset_interval();
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
	function load_bg_img(is_show_loading, next){

		// the cache here is to keep the current loading img alive
		// if the network condition of the user is not very well
		// and the img is still loading after the interval
		// this could stop the browser to load the next img
		var img_cache = load_bg_img._img_cache;

		// check the loading status
		load_bg_img._is_loading = function(){
			return img_cache && !img_cache.prop('complete');
		};

		// load function
		var load = function (){

			// close the sidebar before load
			// skip if info is open
			//if(fixed_info_asider.isOpen()){
			//	return;
			//}

			var next_img = next_rand_img();

			var after_loaded = function () {

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

				// open the sidebar if needed
				if(load_bg_img._open_asider_after_load){
					fixed_info_asider.open(next);
				} else {
					if(next) { next(); }
				}

			};

			// fading in and out image when it's loaded
			img_cache = $('<img/>');
			img_cache.on('load', function (){
				hide_loading();
				if(fixed_info_asider.isOpen()){
					fixed_info_asider.close(after_loaded);
				} else {
					after_loaded();
				}
			});
			
			// load next rand img
			img_cache.attr('src',next_img['photo-url']);

			// keep the current img
			load_bg_img._img_cache = img_cache;

		};

		var start_load = function (){
			if(is_show_loading) {
				// close the sidebar before load
				//if(fixed_info_asider.isOpen()){
				//	fixed_info_asider.close(function () {
						// asider is closed and disabled before load
						// if is_show_loading == true
						show_loading(load);
				//	});
				//} 
			} else {
				load();
			}
		};


		// skip if it's still loading
		if(load_bg_img._is_loading()){
			return;
		}

		// prevent load if is mouseover
		if(fixed_info_asider.isMouseover()){
			return;
		}

		start_load();

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

	// hide loading block
	function hide_loading(){
		//if( $('#loading_block').length > 0 ){
			// first time loaded, fadeout loading block
			$('#loading_block').fadeOut(function(){
				// remove loading block
				// $(this).remove();
				// change animation-iteration-count instead of remove the element
				_change_animate_iteration('0');
				// slide all the childrens of body
				$('div.cover-container > div').slideDown(function(){
					// fix overflow
					$('div.cover-container > div').css('overflow', 'visible');
					// resize on DOM finished.
					sync_cover_img_height();
				});
			});
		//}
	}

	// show loading block
	function show_loading(next){
		$('.cover-img > div').fadeOut(function(){
			//$('div.cover-container > div').slideUp(function(){
				$('.cover-img > div').remove();
				_change_animate_iteration('infinite');
				$('#loading_block').fadeIn(function(){
					if(next){
						next();
					}
				});
			//});
		});
	}

	function _change_animate_iteration(count){
		$('.container1 > div, .container2 > div, .container3 > div')
			.css('animation-iteration-count', count)
				.css('-webkit-animation-iteration-count', count);
	}

})();
