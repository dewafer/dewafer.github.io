---
---
/* jekyll-babel should process this file */
(function(){
  'use strict';
  let backup;

  if(document.body.onload) {
    backup = document.body.onload;
  }

  let listeners = [];

  document.body.onload = (callback) => {

    if(callback instanceof Function) {
      listeners = listeners.concat(callback);

    } else {

      let event = callback;
      if(backup) backup(event);
      listeners.forEach((fn) => fn(event));
    }
  };

})();
