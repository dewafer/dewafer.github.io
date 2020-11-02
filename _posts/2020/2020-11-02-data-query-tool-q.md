---
layout: post
title: 数据查询工具Q
---

作为一个不合格的OPS，最近一阵子经常被PDM抓去搞数据查询的工作。然后有时候会有一些比较尴尬的情况出现，尤其是需要查询的数据量有点大又不是那么大的时候：用Spark是杀鸡焉用宰牛刀，而用Excel过滤又经常没有响应；这个时候就非常尴尬，因为，通常情况下这样的查询PDM们自己也会做，但他们手上的资源又没有强大到能够顺利处理这些数据。

我曾经被一位技术型PDM问到，有没有可以在csv文件上跑SQL的工具？hummm，`awk`、`sort`、`uniq`、`grep`会不会？`sqlite`会不会？`mysqlimport`会不会？……行吧我来帮你搞吧……

后来发现了这样一个神器：[q](https://github.com/harelba/q)

来看看官方给出的Example：

```
q "SELECT COUNT(*) FROM ./clicks_file.csv WHERE c3 > 32.3"

ps -ef | q -H "SELECT UID, COUNT(*) cnt FROM - GROUP BY UID ORDER BY cnt DESC LIMIT 3"
```

哦豁，太贴心了。再看看`tldr`上的Example：

```
> tldr q

  q

  Execute SQL-like queries on .csv and .tsv files.
  More information: https://harelba.github.io/q.

  - Query .csv file by specifying the delimiter as ',':
    q -d',' "SELECT * from path/to/file"

  - Query .tsv file:
    q -t "SELECT * from path/to/file"

  - Query file with header row:
    q -ddelimiter -H "SELECT * from path/to/file"

  - Read data from stdin; '-' in the query represents the data from stdin:
    output | q "select * from -"

  - Join two files (aliased as f1 and f2 in the example) on column c1, a common column:
    q "SELECT * FROM path/to/file f1 JOIN path/to/other_file f2 ON (f1.c1 = f2.c1)"

  - Format output using an output delimiter with an output header line (note: command will output column names based on the input file header or the column aliases overridden in the query):
    q -Ddelimiter -O "SELECT column as alias from path/to/file"

```

哦吼，不要太贴心❥(^_-)。

嗯，的确，实践告诉我们：不会数据工程的开发不是一个好运维。