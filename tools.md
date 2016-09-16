---
layout: page
title: "工具"
description: "一点点实用的小公举。"
header-img: "img/contact-bg.jpg"
---

<form class="form-horizontal" role="form">
 <div class="form-group">
   <label class="col-sm-2 control-label">UUID generator</label>
   <div class="col-sm-10">
     <input type="text" class="form-control" id="random-uuid-text" placeholder="Random UUID" readonly>
   </div>
 </div>
 <div class="form-group">
   <div class="col-sm-offset-2 col-sm-10">
     <button type="button" class="btn btn-primary" id="gen-random-uuid">Generate</button>
     <button type="button" class="btn btn-default" id="copy-random-uuid">Copy</button>
   <label>
     <input type="checkbox" id="gen-random-uuid-uppercase"> Uppercase
   </label>
   </div>
 </div>
</form>

<hr>

<form action="" class="form-horizontal" role="form">
  <div class="form-group">
    <label for="encode-input" class="col-sm-2 control-label">Input to encode.</label>
    <div class="col-sm-10">
      <textarea id="encode-input" cols="30" rows="10" class="form-control" placeholder="Unicode here."></textarea>
    </div>
  </div>
  <div class="form-group">
    <label for="decode-input" class="col-sm-2 control-label">Input to decode</label>
    <div class="col-sm-10">
      <textarea id="decode-input" cols="30" rows="10" class="form-control" placeholder="Base64 here."></textarea>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button type="button" class="btn btn-success" id="base64-encode-button">Encode</button>
      <button type="button" class="btn btn-danger" id="base64-decode-button">Decode</button>
    </div>
  </div>
</form>

<script src="{{ "/js/tool-loader.js " | prepend: site.baseurl }}"></script>
<script src="{{ "/js/tool-uuid-generator.js " | prepend: site.baseurl }}"></script>
<script src="{{ "/js/tool-base64.js" | prepend: site.baseurl }}"></script>
