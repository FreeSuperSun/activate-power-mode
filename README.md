# activate-power-mode

Forked from disjukr/activate-power-mode 

研究代码用

## 程序的整体思路

程序其实是实现了两个功能,一个是打字的时候使得窗口实现震动效果;一个是打字的时候
实现彩弹效果.

震动的效果比较简单,在打字后,设置body一个随机的垂直和水平的位移,然后设定一个定时器,
到时间后将位移消除.

彩弹的效果实现是用canvas绘图实现的.

## 重构过程

相关语法的重写,弃用var关键字.

函数的拆分.

1. 将窗口震动的功能单独拿出来,单独做一个模块.
2. 去除多余的flag变量,尽量用对象自身的属性来判断状态,去掉多余的状态设置函数.

## 相应知识点
1. canvas的使用,主要是相关的API
2. document.activeElement 获取当前激活的页面元素
3. getBoundingClientRect()的使用,获取当前元素的位置和大小信息
4. 遍历中的数组动态进行删除或插入操作,需要注意索引的值
5. 利用 requestAnimationFrame来制作动画
---



[power mode](https://github.com/codeinthedark/editor/pull/1) script for any website

[demo](http://0xABCDEF.com/activate-power-mode/)

used [textarea-caret-position library](https://github.com/component/textarea-caret-position).


## how to use

```html
<script src="activate-power-mode.js"></script>
<script>
POWERMODE.colorful = true; // make power mode colorful
POWERMODE.shake = false; // turn off shake
document.body.addEventListener('input', POWERMODE);
</script>
```


## showcase

- http://blog.wangjunfeng.com/
