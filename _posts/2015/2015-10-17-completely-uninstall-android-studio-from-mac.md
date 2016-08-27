---
layout: post
title: 如何从MAC中彻底移除Android Studio
subtitle: 从我的大象笔记中导出的内容
---

从Stackoverflow找来的答案，参考URL：http://stackoverflow.com/questions/17625622/how-to-completely-uninstall-android-studio


1. 删除app
  ```shell
    rm -Rf /Applications/Android\ Studio.app
    rm -Rf ~/Library/Preferences/AndroidStudio*
    rm ~/Library/Preferences/com.google.android.studio.plist
    rm -Rf ~/Library/Application\ Support/AndroidStudio*
    rm -Rf ~/Library/Logs/AndroidStudio*
    rm -Rf ~/Library/Caches/AndroidStudio*
  ```
2. 删除工程
  ```shell
    rm -Rf ~/AndroidStudioProjects
  ```
3. 删除gradle相关内容（缓存和wrapper），如果要继续用gradle的请不要删。
  ```shell
    rm -Rf ~/.gradle
  ```
4. 删除虚拟机，注意其他Android IDE也可以会用这个文件夹， 如果你还要用其他的IDE就不要删。
  ```shell
    rm -Rf ~/.android
  ```
5. 删除Android SDK
  ```shell
    rm -Rf ~/Library/Android*
  ```
