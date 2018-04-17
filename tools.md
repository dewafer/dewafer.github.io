---
layout: page
title: "工具"
description: "一点点实用的小公举。"
---

<h3>UUID generator</h3>

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

<h3>Base64 encoder/decoder</h3>

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

<hr>

<h3>Image to DataURL</h3>
<form action="" class="form-horizontal" role="form">
  <div class="form-group">
    <label for="image-input" class="col-sm-2 control-label">Choose an image.</label>
    <div class="col-sm-10">
      <input type="file" id="image-input" accept='image/* '>
    </div>
  </div>
  <div class="form-group">
    <label class="col-sm-2 control-label">Preview</label>
    <div class="col-sm-10">
      <img id="image-preview" data-src="holder.js/256x256?auto=yes&amp;text=Image Preview Here" class="img-responsive img-thumbnail" alt="Image Preview">
    </div>
  </div>
  <div class="form-group">
    <label for="image-data-url-output" class="col-sm-2 control-label">Data URL</label>
    <div class="col-sm-10">
      <textarea id="image-data-url-output" cols="30" rows="10" class="form-control" placeholder="Image data url here" readonly></textarea>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button type="button" class="btn btn-default" id="copy-image-data-url">Copy</button>
    </div>
  </div>
</form>

<hr>

<h3>holder.js</h3>
<a class="btn btn-primary" href="https://github.com/imsky/holder" target='_blank'>Holder.js</a>

<form action="" class="form-horizontal" role="form">
  <div class="form-group">
    <label for="holder-js-data-url" class="col-sm-2 control-label">Make an holder image.</label>
    <div class="col-sm-10">
      <textarea id='holder-js-data-url' cols="30" rows="10" class="form-control" placeholder="URL of holder.js(holder.js/300x300?text=Holder Image)"></textarea>
    </div>
  </div>
  <div class="form-group">
    <label class="col-sm-2 control-label">Preview</label>
    <div class="col-sm-10">
      <img id="holder-js-preview" data-src="holder.js/256x256?auto=yes&amp;text=Holder Image Preview Here" class="img-responsive img-thumbnail" alt="Image Preview">
    </div>
  </div>
  <div class="form-group">
    <label for="holder-js-full-url-output" class="col-sm-2 control-label">Data URL</label>
    <div class="col-sm-10">
      <textarea id="holder-js-full-url-output" cols="30" rows="10" class="form-control" placeholder="Image data url here" readonly></textarea>
    </div>
  </div>
  <div class="form-group">
    <div class="col-sm-offset-2 col-sm-10">
      <button type="button" class="btn btn-success" id="get-holder-js-full-url">Get Img</button>
      <button type="button" class="btn btn-default" id="copy-holder-js-full-url">Copy</button>
    </div>
  </div>
</form>


<script src="{{ "/js/tool-uuid-generator.js " | prepend: site.baseurl }}"></script>
<script src="{{ "/js/tool-base64.js" | prepend: site.baseurl }}"></script>
<script src="{{ "/js/tool-image-to-dataurl.js" | prepend: site.baseurl }}"></script>
<script src="{{ "/js/tool-holder-js.js" | prepend: site.baseurl }}"></script>
