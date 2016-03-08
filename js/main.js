    $(function(){
        //$('div.java-code').delay(750).slideDown('fast');
        var dtOpt = {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        };
        $('.today').text((new Date()).toLocaleString('zh-CN', dtOpt));
        setInterval(function(){
            $('.cursor').toggle();
        }, 450);

        setTimeout(myAnimation(), 2000);
    });

    function myAnimation(){
        return animate('.my-github-link', animate('.hire-me-mail', function(){
                setTimeout(myAnimation(), 1000);
            }
        ));
    }


    function removeAnimate(item, callback){
        return function(){
            var o = $('.input').find(item);
            var t = o.text();
            var i = t.length;
            var id = setInterval(function(){
                o.text(t.substring(0, i--));
                if(i < 0){
                    clearInterval(id);
                    o.remove();
                    if(callback) callback();
                }
            }, 80);
        }
    }

    function writeinAnimate(item, callback){
        var t = $(item).text();
        var i = 0;
        var input = $('<span>');
        input.appendTo('.input')
        var id = setInterval(function(){
            input.text(t.substring(0, ++i));
            if(i > t.length){
                clearInterval(id);
                input.remove();
                $(item).clone().appendTo('.input').show();
                if(callback) callback();
            }
        }, 80);
    }

    function animate(item, done){
        return function(){
            writeinAnimate(item, function(){
                setTimeout(
                    removeAnimate(item, done),
                    5500
                );
            });
        }
    }