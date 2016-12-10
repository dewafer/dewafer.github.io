---
layout: post
title: Ruby On Rails 学习笔记
subtitle: 又是一篇学习笔记
---

* 安装rails
    1. 安装[RVM](http://rvm.io) 及Ruby：
        1. `gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3`
        2. 安装RVM及Ruby（[参考](http://rvm.io/rvm/install)）:`\curl -sSL https://get.rvm.io | bash -s stable --ruby`
        3. 将下面这段加入`~\.bashrc`，然后`source ~\.bashrc`。[参考](http://askubuntu.com/a/121075)
            ```
            [[ -s "$HOME/.rvm/scripts/rvm" ]] && source "$HOME/.rvm/scripts/rvm" # Load RVM into a shell session *as a function*
            ```
    2. 安装nodejs：[参考](https://nodejs.org/en/download/package-manager/#debian-and-ubuntu-based-linux-distributions)
    ```
    curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
    sudo apt-get install -y nodejs
    ```
    3. 安装Rails：`gem install rails --version 4.0.0 --no-ri --no-rdoc`

* 制作rails站点：
    1. `rails new <project_name>`
    2. 修改Gemfile
    3. 安装Gems：`bundle install`、`bundle update`
    4. [可选、一步到位]展开脚手架：`rails generate scaffold <ModelName> <field>:<type> <field>:<type>...`
    5. [或者、手动创建]创建控制器：`rails generate controller <ControllerName> <action> <action>...`
    6. 修改路由：`/config/routes.rb`
    7. 修改页面：
        * 布局面`/app/views/layouts/application.html.erb`
        * 控制器页面`/app/views/<controller_name>/<action>.html.erb`
        * 局部视图`/app/views/layouts/_<partial_name>.html.erb`
    8. 创建模型：`rails generate model <Model> <field>:<type> <field>:<type>...`
    9. 修改迁移文件`/db/migrate/[timestamp]_create_<model>s.rb`
    10. 迁移数据库`rake db:migrate`
    11. 尝试沙箱控制台`rails console --sandbox`
    12. 针对模型增加验证`/app/models/<model>.rb`
    13. 对DB建立索引`rails generate migration add_index_to_<model>s_<field>`，然后修改`/db/migrate/[timestamp]_add_index_to_<model>s_<field>.rb`
    14. 迁移数据库`rake db:migrate`
    15. [看情况]为用户模型增加密码验证等一套功能，在`/app/models/users.rb`中加入`has_secure_password`
    16. 表单使用`form_for(@model) do |f| ... end`方法，提交错误可以使用`@model.errors.full_messages`显示错误信息。
    17. 还可以使用`flash`消息，注意`flash`消息的声明周期是1个request，`render`不属于新request，要只在`render`里显示消息，使用`flash.now`。
    18. 登录使用`session`，把`session`视为资源，在路由中`resources :sessions, only;[:new, :create, :destory]`限定，其中`:new`为登录页，`:create`为登录`POST`的endpoint，`:destory`为登出的endpoint。
    19. 登录表单使用`form_for(:session, url: sessions_path) do |f| ... end`。
    20. `xxxHelp`中的方法默认只能在试图中用，要在`Controller`中使用的话，必须在`Controller`中使用`include xxxHelper`引入。
