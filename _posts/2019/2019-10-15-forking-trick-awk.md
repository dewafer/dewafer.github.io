---
layout: post
title: AWK奇技淫巧
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

其中第一列是交易事务唯一号，第二例是用户唯一号，第三列是交易时间，第四列是其他信息。

第二个文件包含用户账号信息，叫做`users.txt`，大致如下

```
userid_001 user_nick_name_001 other_information
userid_002 user_nick_name_002 other_information
userid_003 user_nick_name_003 other_information
...
```

其中第一列是用户唯一号，第二例是用户昵称，第三列是其他信息。

第一个需求是要求打印一个文件，将`transactions.txt`文件中的用户唯一号替换成用户昵称。大致如下：

```
transaction_id_001 user_nick_name_001 2019-10-01T00:00:00Z other_information
transaction_id_002 user_nick_name_002 2019-10-01T01:00:00Z other_information
transaction_id_003 user_nick_name_003 2019-10-02T00:00:00Z other_information
...
```

既把`transactions.txt`中的用户唯一号替换成`users.txt`中的用户昵称。

awk解决方案，使用以下命令：

```
awk 'NR==FNR { user[$1]=$2 ; next } { print $1,user[$2],$3,$4 }' users.txt transaction.txt
```

输出结果：

```
transaction_id_001 user_nick_name_001 2019-10-01T00:00:00Z other_information
transaction_id_002 user_nick_name_002 2019-10-01T01:00:00Z other_information
transaction_id_003 user_nick_name_003 2019-10-02T00:00:00Z other_information
transaction_id_004 user_nick_name_004 2019-10-02T00:00:00Z other_information
...
```

awk语法解释：

```
awk 'NR==FNR { 处理第一个文件 ; next } { 处理第二文件 }' 第一个文件.txt 第二个文件.txt
```

awk的语法格式为：

```
A pattern-action statement has the form

        pattern { action }

A missing { action } means print the line; a missing pattern always matches.  Pattern-action statements are separated by newlines or semicolons.
```

其中`NR==FNR`是第一个匹配模式（pattern），`NR`为当前记录的序号（oridianl number），`FNR`为当前记录在文件中的序号。
当`NR==FNR`时，我们可知当前正在处理第一个文件。

紧跟着的操作（action）`{ user[$1]=$2 ; next }`意为：将第一列的值（`users.txt`中的用户唯一号）作为键；第二列的值（`users.txt`中的用户昵称）作为值存入`user`变量中，然后跳过余下的匹配模式（`{ print $1,user[$2],$3,$4 }`）。

上述操作在处理第一个文件（`users.txt`）时将用户唯一号作为键；用户昵称作为值存入了`user`变量中，待后处理。

在接下来第二个匹配模式`{ print $1,user[$2],$3,$4 }`中，我们将`transaction.txt`文件中的每一行打印出来，并且使用第二列作为键从`user[$2]`中取得用户昵称并打印出来。

至此完成上述需求。

第二个需求是要去按照日期来统计某一个用户的交易量，并要求打印成一下格式：

```
2019-10-01 user_nick_name_001 3
2019-10-01 user_nick_name_002 5
2019-10-02 user_nick_name_003 7
2019-10-03 user_nick_name_004 9
...
```

有了上述的基础解决这个问题就很简单了，使用以下命令：

```
awk 'NR==FNR { user[$1]=$2 ; next } { count[substr($3,1,10),$2]+=1 } END { for (c in count) { split(c,a,SUBSEP); print a[1],user[a[2]],count[c] } }' users.txt transaction.txt
```

解释一下，第一个匹配模式（`NR==FNR { user[$1]=$2 ; next }`）就略过了，第一个需求中讲过了。

第二个匹配模式`{ count[substr($3,1,10),$2]+=1 }`意指，在处理第二个文件时（由于在处理第一个文件时使用了`next`所以该匹配模式自动被跳过，下同），将截断后的日期（`2019-10-01T00:00:00Z`截断成`2019-10-01`）加用户唯一号作为键，将该用户在当天的事务量计数并保存在`count`变量中。

第三个匹配模式`END { for (c in count) { split(c,a,SUBSEP); print a[1],user[a[2]],count[c] } }`为，当最后一行处理完后，使用`for`循环打印`count`中的内容。

其中`split(c,a,SUBSEP)`是用`SUBSEP`特殊分隔符来分割键值。根据手册说明，awk支持多维数组（多下标），多维数组的使用方式如上所示(`array[j,w,k]`)；awk会使用特殊分隔符`SUBSEP`来链接多维数组的各个键；`SUBSEP`默认值为`034`。

> Variables may be scalars, array elements (denoted x[i]) or fields.
>
> Variables  are  initialized to the null string.  
> Array subscripts may be any string, not necessarily numeric; this allows for a form of associative memory.  
>
> Multiple subscripts such as [i,j,k] are permitted; the constituents are concatenated, separated by the value of SUBSEP.
>
> SUBSEP separates multiple subscripts (default 034)

输出结果：

```
2019-10-03 user_nick_name_001 1
2019-10-03 user_nick_name_002 1
2019-10-03 user_nick_name_003 1
2019-10-01 user_nick_name_001 2
2019-10-01 user_nick_name_002 2
2019-10-04 user_nick_name_004 3
2019-10-02 user_nick_name_003 1
2019-10-02 user_nick_name_004 1
...
``` 

至此完成上述需求。
