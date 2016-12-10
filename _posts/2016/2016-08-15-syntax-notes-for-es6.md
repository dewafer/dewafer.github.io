---
layout: post
title: ES6语法学习笔记
subtitle: 又是一篇学习笔记
---

* Block-Scoped Declarations 块作用域申明
    * `let`:
    ```javascript
    {
        console.log( a );  // undefined
        console.log( b );  // ReferenceError

        var a;
        let b;   // before this line is TDZ(Temporal Dead Zone) of b
    }
    ```

    * `var` + `for`:
    ```javascript
    var funcs = [];

    for (var i = 0; i < 5; i++) {
        funcs.push( function() {
            console.log( i );
        } );
    }

    funcs[3]();   // 5
    ```

    * `let` + `for`
    ```javascript
    var funcs = [];

    for (let i = 0; i < 5; i++) {
        funcs.push( function() {
            console.log(i);
        } );
    }

    funcs[3]();  // 3
    ```

* Block-scoped Functions 块作用域方法
```javascript
{
    foo();    // works

    function foo() {
        // ...
    }
}
foo();    // ReferenceError
```
特别注意：块作用域陷阱，考虑：
```javascript
if (something) {
    function  foo() {
        console.log( "1" );
    {
} else {
    function foo() {
        console.log( "2" );
    }
}
foo();        // ???
```
在es6之前的环境，无论`something`是什么结果都是`"2"`，在es6环境最后一行抛出 `ReferenceError`。

* Spread/Rest操作符
        ```javascript
        function foo(x, y, z) {
            console.log( x, y, z);
        }
        foo( ...[1, 2, 3] );    // 1 2 3
        ```
        ```javascript
        var a = [2, 3, 4];
        var b = [ 1, ...a, 5 ];

        console.log( b );        // [ 1, 2, 3, 4, 5 ]
        ```
        ```javascript
        function foo(x, y, ...z) {
            console.log( x, y, z);
        }
        foo( 1, 2, 3, 4, 5 );     // 1 2 [3, 4, 5]
        ```

* 默认参数
```javascript
    function foo( x = 11, y = 31) {
        console.log( x + y );
    }

    foo();                    // 42
    foo( 5, 6 );            // 11
    foo( 0, 42 );          // 42

    foo( 5 );                        // 36
    foo( 5, undefined );      // 36 <-- `undefined` is missing
    foo( 5, null );                // 5 <-- null coerces to `0`

    foo( undefined, 6 );        // 17 <-- `undefined` is missing
    foo( null, 6 );                  // 6 <-- null coerces to `0`
```

* 胖箭头表达式（() => {} )：胖箭头表达式的this是默认绑定到当前lexcal scope的。
