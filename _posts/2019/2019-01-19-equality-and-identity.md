---
layout: post
title: 再谈相等性（Equality）和同一性（Identity）
published: false
---

最近在读《Effective Java》第三版，讲到equals和hashCode的正确实现，感觉挺有意思的，在这里做个笔记。

### 普遍的错误认识

我们(其实是我)普遍都有个错误的认识，那就是当我们谈到对象的Equality(相等性)时，一般很容易觉得我们就在谈如何正确覆写(Override)equals方法；而当我们谈对象的Identity(同一性)时，就觉得在谈如何正确覆写hashCode方法。

其实这是不对的。按照《Effective Java》的说法，如果覆写了equals方法，必须也要覆写hashCode方法，两者是相辅相成的。

> You must override hashCode in every class that overrides equals. 

很多同学知其然而不知其所以然，我们就来聊聊why。

根据JDK的文档，覆写hashCode时，你必须遵守以下三条约定(contract)：

> When the hashCode method is invoked on an object repeatedly during an execution of an application, it must consistently return the same value, provided no information used in equals comparisons is modified. This value need not remain consistent from one execution of an application to another.

> 当在一个程序的一次运行中重复调用一个对象的hashCode方法时，假如用来计算equals比较的数据没有改变的情况下，该方法必须一致地返回同一个值。此值不需要在一个程序的不同次运行中保持一致。

> If two objects are equal according to the equals(Object) method, then calling hashCode on the two objects must produce the same integer result.

> 如果根据equals(Object)方法，两个对象是相同的，那么在两个对象上调用必须产生相同的整数结果。

> If two objects are unequal according to the equals(Object) method, it is not required that calling hashCode on each of the objects must produce distinct results. However, the programmer should be aware that producing distinct results for unequal objects may improve the performance of hash tables.

> 如果根据equals(Object)方法，两个对象是不相同的，分别在两个对象上调用hashCode方法不要求必须产生不同的结果。然而，程序员应该意识到，为不同对象产生不同的结果有助于改善哈希表的性能。

如果你只覆写了equals而没有hashCode，就违法了其中第二条之约定。可能会造成的问题就是，如果这个类被用作HashMap的key，那么就会发生两个互相equals的对象但互相取不到value的值。参考以下代码：

```java

class User {
	private String username;
	public User(String username) {
        this.username = username;
	}
	@Override public boolean equals(Object o) {
        // 此方法比较两个user的username，如果username相同则返回true
        // ... 具体实现方法略 ...
	}
	// 该类没有覆写hashCode方法
}

// ... in other method
HashMap<User, String> userNicknameMap = new HashMap<>();
userNicknameMap.put(new User("Jack@example.com"), "jack");
// 下面这个结果肯定是null
assert userNicknameMap.get(new User("Jack@example.com")) == null;

```

我觉得这个应该挺好理解的，有基础的同学都应该知道这个问题，这样的错应该不太可能会犯。
但是，覆写equals方法就没有你想象的那么简单了，对于老鸟来说不犯错也不是一件容易的事情。
我们来看看why。

### equals的4个易犯的错

要写好equals并不是一件简单的事情，根据[《How to Write an Equality Method in Java by Martin Odersky, Lex Spoon, and Bill Venners》][1]的说法，常见的易犯错误有以下四点。

> 1. Defining equals with the wrong signature.
> 2. Changing equals without also changing hashCode.
> 3. Defining equals in terms of mutable fields.
> 4. Failing to define equals as an equivalence relation.

> 1. 使用了错误的参数签名定义equals方法
> 2. 覆写了equals方法但没有覆写hashCode方法
> 3. 覆写equals方法时使用了可变域
> 4. 覆写equals方法时没有遵守等价关系

#### 使用了错误的参数签名定义equals方法

这种错误非常低级，通常只有初学者才会范，但一些基础不扎实的老鸟们 review 代码的时候也很有可能会不小心忽略这点：

```java
public boolean equals(MyClass o) {
    // ...
}
```

粗看上面的定义方法没错，但其实它并没有覆写`Object#equals`方法，而是重载了一个参数签名为`MyClass`的方法。第一眼看这个方法没错，它的确能正常工作：

```java
class Point {
    private int x;
    private int y;
    // 省略构造器和getter setter
    public boolean equals(Point o) {
        return this.getX() == o.getX() && this.getY() == o.getY();
    }
}

// ...
Point pointA = new Point(10, 20);
Point pointB = new Point(10, 20);

assert pointA.equals(pointB);
```

那么它错在哪里呢？它错就错在没有覆写(Override)而是重载(Overload)了equals方法，而在Java中，重载方法的解析是通过编译期的静态类型决定的，而不是运行期的动态类型。

```java
Object point2B = pointB;

assert pointA.equals(point2B) == false;
```

这样的错误一般只在比较早期的代码中才可能会有，现在的码农一般不太会犯这个错，一是因为如果是基础知识扎实经历过早期Java开发的经验丰富的老手理论上一眼就能看出问题所在，二是因为如果是培训班出身或者年纪比较轻的开发人员，他们从小就被教导使用IDE来生成这些方法而不自己手写，所以在现在来看，基本不太会碰到这样的问题。

如果使用IDE来生成equals方法，就会有`@Override`注解来帮忙：

```java
@Override public boolean equals(MyClass o) {
    // 编译就会报错
}
```

题外话，那这个坑是不是可以拿来当做面试题呢？让应试者抛弃IDE手写equals方法，或者给一段错误的equals让他找错？是不是很方便就能区分基础知识扎实的老手和培训班出来的菜鸟呢了？


#### 改变了equals方法但没有改变hashCode方法

关于这个问题，我们上面一章已经讨论过了就不做重复了。


#### 覆写equals方法时使用了可变域

我觉得这是一个非常非常容易陷入的坑，特别是一些只会CRUD的职业搬砖的同学。个人认为对于Java搬砖工来说，能意识到 immutable 对象的重要性已经是非常难能可贵了，如果能在业务场景下正确地使用 immutable 对象那更是功底深厚了。

这里所说的使用了可变域，有两种情况。

一种情况是该类的域(field)是带有setter的可变域，这种情况下，如果该对象已经放入了哈希表中，那要再将它取出来就会有点麻烦，考虑以下代码：

```java
Point p = new Point(100, 200);

HashSet<Point> points = new HashSet<>();
points.add(p);

assert points.contains(p);

// 麻烦就出在当这个对象已经入了哈希表，哈希表中对应的bucket是使用该对象内，用来
// 计算hashCode的域在其变更之前的值计算出来的，当这个域值变了，哈希表就有点晕了

p.setX(150);
assert points.contains(p) == false;

// 但是这个对象其实还是在这个Set中的不是吗

assert points.stream().anyMatch(p1 -> p1.equals(p));

```

第二种情况是当计算equals引用的域属于外部不可靠的情况。《Effective Java》给出了一个JDK内的反面教材：`java.net.URL`。

`java.net.URL`这个类的equals方法的计算依赖了URL地址中主机名的IP地址来计算一致性。
但其实大家都知道URL地址中的主机名的IP地址解析是根据当前系统所使用的DNS的，而且不一定
每次解析出的IP地址结果都是一致的。因此JDK中的该类其实是违反了equals方法的协议的。
这是JDK中的一个错误，但因为必须向后兼容所以短时间内也无法改变了。

这就是第二种情况。

#### 覆写equals方法时没有遵守等价关系

这里说的等价关系指初等数学上相等所意味的四大特性：

* 自反性：对于任意非空值X，其本身必须相等，即X必须等于X。
* 对称性：对于非空值A，如果A等于B，那么B必须也等于A。
* 传递性：对于非空值A，如果A等B，并且B等于C，那么A和C必须相等。
* 一致性：对于非空值A和B，在两者没有变动的情况下，必须恒相等。

除了必须遵守这四个基本的数学特性之外，还要加上一条原则，那就是对于空值与非空值的比较：

* 对于任意非空值X，当其与空值比较时，必定不能相等。

以上就是几个针对equals方法来说非常重要的点，我觉得很好理解，也没有什么需要特殊解释的。

《Effective Java》中还提供了针对equals方法实现的“最佳实践”，个人觉得这种都是很boilerplate的代码，
没有什么值得细细品味的，读过一遍就好了，不用细究。并且，与其将这些bolierplate的代码到处复制黏贴，其实还有更好的解决方案，我们后文在详细说明，因此就不在这里贴代码了。

### 面向对象带来的问题

相等关系在面向对象的语言中一直是一个难以处理的问题，在面向对象的语言中是无法同事保持equals的规约又享受多态带来的便利，只能二者选一。

我们来看一个JDK中已知的，选择了面向对象的多态特性但是放弃了equals规约的实例。

考虑以下代码：

```java
// 系统的现在时间
long now = System.currentTimeMillis();

// date类型
Date dt = new Date(now);
// timestamp类型
Timestamp ts = new Timestamp(now);

// date == timestamp
assert dt.equals(ts);
// 但是 timestamp 不等于 date
assert ts.equals(dt) == false;
```

是的，JDK中的`java.sql.Timestamp`的`equals`方法违反了我们前面提到的等价关系的第二条：对于非空值A，如果A等于B，那么B必须也等于A。这是一个已知的问题并且也因为兼容性的问题一直没有修复。如果在集合中混用`Timestamp`和`Date`就会碰到问题，如果你仔细阅读它的javadoc就会发现它有个警告：


> **Note:** This type is a composite of a `java.util.Date` and aseparate nanoseconds value. Only integral seconds are stored in the `java.util.Date` component. The fractional seconds - the nanos - are separate. 
> The `Timestamp.equals(Object)` method never returns `true` when passed an object that isn't an instance of `java.sql.Timestamp`, because the nanos component of a date is unknown.
> As a result, the `Timestamp.equals(Object)` method is not symmetric with respect to the `java.util.Date.equals(Object)` method.  Also, the `hashCode` method uses the underlying `java.util.Date` implementation and therefore does not include nanos in its computation.
> Due to the differences between the `Timestamp` class and the `java.util.Date` class mentioned above, it is recommended that code not view `Timestamp` values generically as an instance of `java.util.Date`.  The inheritance relationship between `Timestamp` and `java.util.Date` really denotes implementation inheritance, and not type inheritance.

其实原因也很简单，`Timestamp`扩展了`Date`，增加了一个`nano`字段来存放nano秒，但它本质上来说还是一个`Date`，所以如果你`timestamp instanceof Date`会返回`true`，因此当`Date`类的`equals`方法判断来着是不是个`Date`的时候就返回了`true`，此时nano秒就不作为比较对象来进行equals比较了，并且由于`Timestamp`本质上来说就是一个`Date`，撇去nano秒之后各值都相等，所以我们得到了equals为true的结果，这样就打破了对称性。

除了对称性，另外一个多态类下的equals方法容易打破的特性是传递性，[《How to Write an Equality Method in Java by Martin Odersky, Lex Spoon, and Bill Venners》][1]这篇文章中的《Pitfall #4: Failing to define `equals` as an equivalence relation》一节讲得非常好，并且还提出了解决方案（此解决方案也是我们后面要讲的Lombok所使用的解决方案），我就不在这里赘述了。

### 生产中高效率的实现：lombok的@EqualsAndHashCode

// GO ON

------


[1]: https://www.artima.com/lejava/articles/equality.html	"How to Write an Equality Method in Java by Martin Odersky, Lex Spoon, and Bill Venners"

