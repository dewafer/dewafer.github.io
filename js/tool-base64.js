document.body.onload(() => {
  'use strict';
  // Using btoa/atob, see: https://developer.mozilla.org/en-US/docs/Web/API/WindowBase64/btoa#Unicode_strings
  // ucs-2 string to base64 encoded ascii
  function utoa(str) {
      return window.btoa(unescape(encodeURIComponent(str)));
  }
  // base64 encoded ascii to ucs-2 string
  function atou(str) {
      return decodeURIComponent(escape(window.atob(str)));
  }

  $('#base64-encode-button').on('click', () => {
    if($('#encode-input').text() && $('#encode-input').text().length > 0 ) {
      $('#decode-input').text(utoa($('#encode-input').text()));
    }
  });

  $('#base64-decode-button').on('click', () => {
    if($('#decode-input').text() && $('#decode-input').text().length > 0 ) {
      $('#encode-input').text(atou($('#decode-iunput').text()));
    }
  });
});
