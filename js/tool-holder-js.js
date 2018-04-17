(function(){

  $(() => {
    'use strict';

    $('#holder-js-data-url').val($('#holder-js-preview').attr('data-src'));

    $('#holder-js-data-url').on('change', (event) => {
      let imgUrl = $(event.currentTarget).val();
      $('#holder-js-preview').attr('data-src', imgUrl);
      Holder.run();
      outputFullUrl();
    });

    $('#get-holder-js-full-url').on('click', () => {
      outputFullUrl();
    });

    $('#copy-holder-js-full-url').on('click', ()=>{
        if($('#holder-js-full-url-output').val().length > 0) {
            $('#holder-js-full-url-output').select();
            try {
                document.execCommand("copy");
            } catch(e) {
                console.error(e);
                prompt("Copy to clipboard: Ctrl+C, Enter", $('#holder-js-full-url-output').val());
            }
        }
    });

    // $('#copy-holder-js-full-url').tooltip({
    //     placement: 'bottom',
    //     trigger: 'hover ',
    //     title: 'Ctrl(Cmd) + V to paste.'
    // });

    function outputFullUrl() {
      $('#holder-js-full-url-output').val($('<img>').attr('data-src', $('#holder-js-data-url').val())[0].outerHTML);
    }

  });

})();
