---
layout: post
title: AWK奇技淫巧
published: false
---

AWK大家都很熟悉了，今天来记录一下AWK的奇技淫巧之一。

假设有如下两个业务文件，第一个文件包含交易信息，叫做`transactions.txt`，大致如下

```
transaction_id_001 userid_001 2019-10-01T00:00:00Z other_information
transaction_id_002 userid_002 2019-10-01T01:00:00Z other_information
transaction_id_003 userid_003 2019-10-02T00:00:00Z other_information
transaction_id_004 userid_004 2019-10-02T00:00:00Z other_information
...
```

其中第一列是交易事物唯一号，第二例是用户唯一号，第三列是交易时间，第四列是其他信息。

第二个文件包含用户账号信息，叫做`users.txt`，大致如下

```
userid_001 user_nick_name_001 other_information
userid_002 user_nick_name_002 other_information
userid_003 user_nick_name_003 other_information
...
```

其中第一列是用户唯一号，第二例是用户昵称，第三列是其他信息。

起一个需求是要求打印一个文件，大致如下：

```
transaction_id_001 user_nick_name_001 2019-10-01T00:00:00Z other_information
transaction_id_002 user_nick_name_002 2019-10-01T01:00:00Z other_information
transaction_id_003 user_nick_name_003 2019-10-02T00:00:00Z other_information
...
```

既把`transactions.txt`中的用户唯一号替换成`users.txt`中的用户昵称。

解决方案，使用以下命令：

```

```

/*

awk -F '\t' 'NR==FNR {a[$1]=$2;next} {if($1 in a) {print "OK"} else {print $0}}' file1 file2

awk -F '分隔符' 'NR==FNR {处理第一个文件;next} { 处理第二个文件 }' file1 file2

*/
