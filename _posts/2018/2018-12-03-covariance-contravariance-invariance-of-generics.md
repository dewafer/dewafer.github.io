---
layout: post
title: 泛型的协变、逆变、不变
---

听潘总说，新版Go语言要上泛型了，哈哈！说到泛型最终还是离不开它的协变、逆变和不变的问题，譬如在Java里`String`是`Object`的子类型，那么`List<String>`是`List<Object>`的子类型吗？最近正好在读《kotlin in Action》里关于泛型的一章，我觉得这章写得很好，非常简单易懂，因此在这里做个笔记。

要回答上述这个问题，我们首先要定义两个术语：子类型（subtype）和父类型（supertype）。

#### 子类型（subtype）与父类型（supertype）

根据《kotlin in Action》中的定义：

>  A type B is a subtype of a type A if you can use the value of the type B whenever a value of the type A is required. For instance, Int is a subtype of Number, but Int isn’t a subtype of String. 

> 子类型（subtype）指，如果你可以在任何必须使用类型A的值的地方使用类型B的值，那么我们就说类型B是类型A的子类型。譬如，（在kotlin里）`Int`是`Number`的子类型，但不是`String`的子类型。

> The term supertype is the opposite of subtype. If A is a subtype of B, then B is a supertype of A.

> 父类型（supertype）与子类型（subtype）相反，就是说如果A是B的子类型，那么B就是A的父类型。

根据字面意思，这很好理解，简单来说我们可以把它们理解成为父类(superclass)和子类（subclass），但两者并不完全相同，主要原因有两点。

第一点是因为，在kotlin里有nullable和非nullable类型的区别，譬如非nullable类型`Int`是nullable类型`Int?`的子类型（subtype）但不是子类（subclass）。

这点很好理解，因为一个nullable的变量通常可以被赋予两种类型的值——`null`和非`null`的值。那么在同类型的非nullable的类型变量下，你只能赋予非`null`的值。
所以你可以把一个非nullable的变量赋予给同类型的nullable的变量，这也就符合了子类型（subtype）的定义——我可以在nullable类型的地方用同类型的非nullable的值。

举个例子就是，譬如：

```kotlin
var nullableNumber: Number? = ... // Number 的 nullable 变量
var nonNullNumber: Number = ...   // Number 的 非nullable 变量

nullableNumber = nonNullNumber    // 你可以这么赋值，但是你不能
nonNullNumber = nullableNumber    // 这行会编译不过
```

第二点，就是为了让我们能更好地讨论前面的问题：如果`String`是`Object`的子类型，那么`List<String>`是`List<Object>`的子类型吗？

理解了子类型(subtype)的定义之后，这个问题可以转化成：如果`String`是`Object`的子类型，那么我可以在需要用`List<Object>`的地方用`List<String>`吗？
那么我们就尝试着来回答这个问题。

#### 泛型协变(Covariance)

简单来说，上面的问题的答案是：可以，但这是有代价的。

我们把上述情况，就是如果`String`是`Object`的子类型，那么我可以在需要用`List<Object>`的地方用`List<String>`的情况，叫做协变(Covariance)。
考虑以下示例：

```kotlin
// process类
class Process {
  fun execute() { ... }
}

// 循环执行List中所有的Process
fun executeProcess(processList: List<Process> ) {
  for (process in processList) {
    process.execute();
  }
}

// Process类的子类，SpecialProcess
class SpecialProcess : Process {
  fun doSthSpecial() { ... }
}

// 循环执行doSthSpecial，执行完成后执行execute
fun executeSpecialProcess(specialProcessList: List<SpecialProcess>) {
  for (specialProcess in specialProcessList) {
    specialProcess.doSthSpecial()
  }
  // 然后执行normal execute
  executeProcess(specialProcessList) // 可以正常调用，因为泛类型List<SpecialProcess>发生了协变，而方法定义中，这边参数只定义了List<Process>。
  // 想想如果👆这行报错说不接受List<SpecialProcess>类型，你会不会觉得不符合常理？
}

```

但如果像上面那样，所有需要用`List<Process>`的地方都能发生协变，那是不安全的。
考虑以下代码：

```kotlin
// broken process 类
class BrokenProcess : Process {
  // ...
}

// 往list里新加一个 broken process
fun appendNewBrokenProcess(processList: List<Process>) {
  processList.add(BrokenProcess()) // 这行会编译不过，但我们先假设这行能 work，稍后解释为什么。
}

// 如果有一个special process的list
val specialProcesses : List<SpecialProcess> = ...

// 先调用appendNewBrokenProcess方法往列表里增加一个broken process
// 注意special process list在下面这个方法的参数里发生了协变
appendNewBrokenProcess(specialProcesses)

// 然后我们去执行这个special process的list
executeSpecialProcess(specialProcesses) 
// 👆这个调用会抛ClassCastException，因为special process list里面多了个非SpecialProcess类型的BrokenProcess

```

从上面的示例可以看到，这一段代码并不安全，尤其是`appendNewBrokenProcess`这个方法，因为它使`List<SpecialProcess>`发生了协变，并且修改了发生协变的对象，往它里写入了
不应该被接受的类型的新元素（`specialProcesses`列表应该只接受`SpecialProcess`，但它却加了个`BrokenProcess`），从而导致了后面的`executeSpecialProcess`方法调用出cast exception的错。

所以我们说，如果随随便便让泛型发生协变，虽然编译期不会有问题，但并不能保证代码在运行时的安全性。你可能会说，我不在乎，只要能编译过能跑就行。
可是你要知道这是Java/kotlin啊，是讲究工程性的强类型的语言啊，编译期查错可一直是这些强类型语言优势之一啊，怎么能这么轻言放弃！沦落为二流的语言呢？！
这个时候我们就得通过付出一些代价，来获得强类型语言应该要有的，编译期就能保证的安全性。

接下来我们就来聊一下这些“代价”。

#### `in`与`out`关键字

如果你仔细去看kotlin的源代码会发现，在`List`的定义中的泛型里，有一个`out`关键字：

```kotlin
interface List<out E> : Collection<E>
```

并且，如果你更仔细看，你会发现在kotlin的`List`接口中（注意是kotlin的，不是Java的`List`接口），是没有`add`方法的。
因为kotlin把传统意义上的列表拆成了只读的`kotlin.collections.List`和可读可写的`kotlin.collections.MutableList`两个接口，
所以在`MutableList`中会有`add`方法，而在`List`中则没有。

```kotlin
interface MutableList<E> : List<E>, MutableCollection<E>
```

所以，在我们上述的代码中：

```kotlin
// 往list里新加一个 broken process
fun appendNewBrokenProcess(processList: List<Process>) {
  processList.add(BrokenProcess()) // 这行会编译不过，但我们先假设这行能 work，稍后解释为什么。
}
```

虽然`List<SpecialProcess>`可以进行协变，但协变之后因为`List`接口没有`add`方法，你是无法更改`List<SpecialProcess>`中的内容的，
这样就能保证了代码在运行期的安全，因为编译不能过啊，运行都运行不起来。

你说我可以把这边的`List<Process>`改成`MutableList<Process>`啊，这样就能`add`了吧。
是的，你可以改，但是回顾`MutableList`的定义你会发现，他定义的泛型`E`是没有带`out`关键字的，所以，就算你有个`MutableList<SpecialProcess>`
也不能赋值给`MutaleList<Process>`的，因为它不能发生协变（没有`out`）。

`List`接口中定义的泛型上增加的`out`关键字，其实就指明该`List`可以发生协变，既：

> 就是如果`String`是`Object`的子类型，那么我可以在需要用`List<Object>`的地方用`List<String>`的情况，叫做协变(Covariance)。

其实在kotlin中，除了`out`，还有个`in`，它正好与`out`相反，可以令指定的对象发生逆变(Contravariance)，我们后面来解释什么是逆变。
如果两个都不指定，则不能发生变化，称作不变(invariance)。

#### 与Java的相同与不同

kotlin中的`in`与`out`叫做定义处变化（declaration-site variance），Java没有相同的东西，但是Java有个类似的东西，如果你还记得：

```java
// java
interface Collection<E> ... {
  void addAll(Collection<? extends E> items);
}
```

对，这边的`extends`其实就和`out`差不多意思，但Java叫做使用处变化（use-site variance），也就是说，发生协变或逆变得情况实在泛型的使用处声明的，而非定义处。
kotlin正好与之相反，并且注意，kotlin也是支持使用处变化（use-site variance）声明的，这个时候，在kotlin中称作类型投影（Type projections）。

简单来说，在kotlin中，`Array<out Any>`等同于Java的`Array<? extends Object>`，而`Array<in String>`则等同于`Array<? super String>`。
在这种情况下，Java叫做使用处变化（use-site variance），而在kotlin中则称作类型投影（Type projections）。

kotlin中有而Java中没有的情况叫做定义处变化（declaration-site variance），就是说泛型能否使拥有泛型参数的类发生协变，可以在泛型变量定义时指定。

了解了这些之后，我们回来说说前文所提到的代价。

大家都知道，如果在Java中你有个`Collection`：

```java
  Collection<? extends String> strCollection = ...
```

你是无法使用这个`Collection`的`add`的方法写入这个集合的，但你却可以使用`get`方法从集合里读出`String`对象。
在kotlin里也一样，`out`的泛型是只能读不能写，而`in`与之相反。在kotlin中之所以用`in`和`out`来定义，是因为`in`和`out`指定了泛型变量能出现的位置。
`in`指的是方法的传入位置(in position)，`out`则指的是传出位置(out position)。

```kotlin
  fun somefunction(param: String) : String
                   ----- in -----   - out -
```

逆变的情况正好相反，我就不赘述了。我们记住PECS原则就行了：

> PECS stands for Producer-Extends, Consumer-Super.

对kotlin来说，就是：

> Consumer in, Producer out

#### 逆变

逆变(Contravariance)正好与协变相反，用我们前文的问题来解释，逆变就是：如果`String`是`Object`的子类型，那么我可以在需要用`List<String>`的地方用`List<Object>`的情况，就称作逆变。

逆变比较常见的一个情况就是比较器：

```kotlin
interface Comparator<in T> {
  fun compare(e1: T, e2: T): Int
}
```

考虑以下代码：

```kotlin
  val anyComparator = Comparator<Any> {
    e1, e2 -> e1.hashCode() - e2.hashCode()
  }
  val strings: List<String> = ...
  strings.sortedWith(anyComparator) // 发生了逆变
  // 👆sortedWith接受参数类型Comparator<String>，但是在Comparator定义的时候在泛型参数上使用了in
  // 所以Comparator<Any>发生了逆变：String是Any的子类型，在需要使用Comparator<String>的地方使用了Comparator<Any>
```

再来看一个官方的示例，也是比较，有可比较接口：

```kotlin
interface Comparable<in T> {
    operator fun compareTo(other: T): Int
}
```

考虑以下代码：

```kotlin
fun demo(x: Comparable<Number>) {
    x.compareTo(1.0) // 1.0 has type Double, which is a subtype of Number
    // Thus, we can assign x to a variable of type Comparable<Double>
    val y: Comparable<Double> = x // OK!
    // 👆发生了逆变：Double是Number的子类型，但是在这里Comparable<Number>变成了Comparable<Double>的子类型，因此x可以赋给y。
}
```


#### 后记

看完了kotlin的这泛型这一章，突然觉得`in`、`out`、`PECS`都好熟悉，好像以前哪里看到过，但又想不起来了。
想起来也会，关于泛型变化的这些内容，都是比较通用的，理应不拘束与单一的语言，所以可能我以前学某一门其他的语言的时候看到过。
但并不记得了。

几乎有泛型的语言，都会有类似的协变(Covariance)、逆变(Contravariance)和不变(Invariance)的问题，最好的学习方法应该还是花时间去阅读该门语言的官方文档。

不奢望此文能为大家理解起到帮助的作用，只求不误导就好了。
