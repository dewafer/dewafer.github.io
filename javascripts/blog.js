$(update_blog_post_title_link);

function update_blog_post_title_link(){
		$('.blog-post-title').hover(
	  function () {
	    $(this).find('span').removeClass("invisible");
	  },
	  function () {
	    $(this).find('span').addClass("invisible");
	  }
	);
}

function query_blog_posts(json_url, query_str) {
	$.getJSON(json_url, function(data){

				var term = $.query.get(query_str);
				if( term && data[term] ){

					$('.blog-title').text(term);

					for( var idx in data[term] ){

						var post = data[term][idx];

						var article = $('<article class="blog-post"/>');

						article.html(post.excerpt);

						var title = $('<h2 class="blog-post-title"/>').html(post.title + ' <a href="' + post.url + '" ><span class="glyphicon glyphicon-link invisible"></span></a>');
						var meta = $('<p class="blog-post-meta"/>').text(post.meta);
						article.prepend(meta).prepend(title);
						if(post.more){
							article.append($(post.more));
						}
						article.appendTo('section');
					}
				}

				update_blog_post_title_link();
		});
}