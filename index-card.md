---
layout: page-index
description: "这是 懒惰成翔的 常年不更新的 dewafer的 个人博客。"
---
<div class="container">
  <div class="row">
    {% for post in paginator.posts %}
    <div class="col-sm-4 col-lg-3">
      <div class="post-preview post-preview-card">
          <a href="{{ post.url | prepend: site.baseurl }}">
              <h2 class="post-title">
                <!-- <i class="fa fa-file-text-o"></i> -->
                  {{ post.title }}
              </h2>
              {% if post.subtitle %}
              <h3 class="post-subtitle">
                <i class="fa fa-hashtag"></i>
                  {{ post.subtitle }}
              </h3>
              {% endif %}
          </a>
          <p class="post-meta">{{ post.date | date: "%Y/%-m/%-d" }}<!--，作者：{% if post.author %}{{ post.author }}{% else %}{{ site.author }}{% endif %}--></p>
      </div>
    </div>
    {% endfor %}
  </div>

  {% if paginator != nil %}
  <div class="row">
    <div class="col-lg-8 col-lg-offset-2 col-md-10 col-md-offset-1">
      <!-- Pager -->
      {% if paginator.total_pages > 1 %}
      <ul class="pager">
          {% if paginator.previous_page %}
          <li class="previous">
              <a href="{{ paginator.previous_page_path | prepend: site.baseurl | replace: '//', '/' }}">&larr; 新的文章</a>
          </li>
          {% endif %}
          {% if paginator.next_page %}
          <li class="next">
              <a href="{{ paginator.next_page_path | prepend: site.baseurl | replace: '//', '/' }}">旧的文章 &rarr;</a>
          </li>
          {% endif %}
      </ul>
      {% endif %}
    </div>
  </div>
  {% endif %}
</div>
