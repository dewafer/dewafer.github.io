---
layout: post
title: MySQL实现Sequence
subtitle: 从我的大象笔记中导出的内容
---

```sql
CREATE TABLE `sequence` (
  `seq_name` VARCHAR(50) NOT NULL COMMENT '',
  `current_value` BIGINT(20) NOT NULL DEFAULT 0 COMMENT '',
  `increment` INT(11) NOT NULL DEFAULT 1 COMMENT '',
  `max_value` BIGINT(20) NULL DEFAULT NULL COMMENT '',
  `description` LONGTEXT NULL COMMENT '',
  PRIMARY KEY (`seq_name`)  COMMENT '');
```

```sql
CREATE  FUNCTION `currval`(in_seq_name VARCHAR(50)) RETURNS bigint(20)
BEGIN
         DECLARE value BIGINT;
         SELECT current_value INTO value
         FROM t_up_sequence
         WHERE upper(seq_name) = upper(in_seq_name); -- 大小写不区分.
         RETURN value;
END
```

```sql
CREATE FUNCTION `nextval`(in_seq_name VARCHAR(50)) RETURNS bigint(20)
BEGIN
         DECLARE value BIGINT;
         DECLARE max BIGINT;


         UPDATE t_up_sequence
         SET current_value = current_value + increment
         WHERE upper(seq_name) = upper(in_seq_name);


         SELECT currval(in_seq_name) INTO value;


         SELECT max_value INTO max
         FROM t_up_sequence
         WHERE upper(seq_name) = upper(in_seq_name);


         IF not isnull(max) then
           if (value > max) then
             select setval(in_seq_name, 0) into value;
end if;
 end if;


         return value;
END
```


```sql
CREATE FUNCTION `setval`(in_seq_name VARCHAR(50), value BIGINT) RETURNS bigint(20)
BEGIN
         UPDATE t_up_sequence
         SET current_value = value
         WHERE upper(seq_name) = upper(in_seq_name);
         RETURN currval(in_seq_name);
END
```
