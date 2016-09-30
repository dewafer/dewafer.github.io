---
---
/* jekyll-babel should process this file */
(function(){

  $(() => {
    'use strict';

    $('#image-input').on('change', (event) => {
      if(event.currentTarget.files && event.currentTarget.files[0]) {
        let fileReader = new FileReader();

        fileReader.onload = (e) => {
          let imgUlr = e.target.result;
          $('#image-preview').attr('src', imgUlr);
          $('#image-data-url-output').val(imgUlr);
        }

        fileReader.readAsDataURL(event.currentTarget.files[0]);
      }
    });

    $('#copy-image-data-url').on('click', (event)=>{
        if($('#image-data-url-output').val().length > 0) {
            $('#image-data-url-output').select();
            try {
                document.execCommand("copy");
            } catch(e) {
                console.error(e);
                prompt("Copy to clipboard: Ctrl+C, Enter", $('#image-data-url-output').val());
            }
        }
    });

    $('#copy-image-data-url').tooltip({
        placement: 'bottom',
        trigger: 'hover ',
        title: 'Ctrl(Cmd) + V to paste.'
    });

  });

})();
