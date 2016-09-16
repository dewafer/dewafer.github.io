---
---
/* jekyll-babel should process this file */
(function(){

  document.body.onload(() => {
      'use strict';

      $('#gen-random-uuid').on('click', (event)=>{ $('#random-uuid-text').val(genRandomUUID()) });
      $('#copy-random-uuid').on('click', (event)=>{
          if($('#random-uuid-text').val().length > 0) {
              $('#random-uuid-text').select();
              try {
                  document.execCommand("copy");
              } catch(e) {
                  console.error(e);
                  prompt("Copy to clipboard: Ctrl+C, Enter", $('#random-uuid-text').val());
              }
          }
      });
      $('#gen-random-uuid-uppercase').on('click', (event)=>{
          if($('#random-uuid-text').val().length > 0) {
              if($('#gen-random-uuid-uppercase').is(':checked')) {
                  $('#random-uuid-text').val($('#random-uuid-text').val().toUpperCase());
              } else {
                  $('#random-uuid-text').val($('#random-uuid-text').val().toLowerCase());
              }
          }
      });
      $('#copy-random-uuid').tooltip({
          placement: 'bottom',
          trigger: 'hover ',
          title: 'Ctrl(Cmd) + V to paste.'
      });
      function genRandomUUID() {
          if($('#gen-random-uuid-uppercase').is(':checked')) {
              return uuid().toUpperCase();
          } else {
              return uuid();
          }
      }
      function uuid() {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
              var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
              return v.toString(16);
          });
      }
  });

})();
