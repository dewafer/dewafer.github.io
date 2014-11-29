$(blog_post_title_link);

function blog_post_title_link(){
		$('.blog-post-title').hover(
	  function () {
	    $(this).find('span').removeClass("invisible");
	  },
	  function () {
	    $(this).find('span').addClass("invisible");
	  }
	);
}