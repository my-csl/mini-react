# day3-统一提交&实现 function component

## 统一提交

### 背景

在 day2 的代码里面，我们的提交逻辑都是每次构建好一个 dom 的时候都会立刻将它添加进页面 dom 树中

### 问题

> 这里我们再扩展一下 requestIdleCallback
> 怎么理解浏览器空闲时间？
> 我们知道一般电脑屏幕刷新率都是 60 赫兹，也就是 1 秒钟屏幕会更新 60 次，平均 1 次耗时 16ms
> 所以我们 js 执行动画和屏幕刷新次数保持一致的话就是流畅的，如果我们每次动画更新间隔超过 16ms 那用户就会觉得卡顿
> 回到 requestIdleCallback 上，就是如果浏览器当前刷新时 1 帧内（16ms）还有剩余时间，那么他就会执行 requestIdleCallback 的回调函数
> 反之，如果当前 1 帧刷新时间超过 16ms 了，那就说明浏览器没有空闲时间，也就不会执行 requestIdleCallback 的回调函数了
> 参考：https://www.cnblogs.com/Wayou/p/requestIdleCallback.html

但是我们每次执行 dom 渲染是在使用 requestIdleCallback 的回调中，这个回调会在当前浏览器空闲时间执行，那浏览器肯定存在没有空闲时间的问题，所以可能造成我们页面先渲染了前 3 个 dom，后面浏览器没有空闲时间了，等到了 2 秒以后才有空闲时间，那剩余的 dom 就会在 2 秒以后渲染出来

### 解决方案

所以我们要把 dom 统一提交，把所有 dom 都构建完毕以后然后把这一整个 dom 添加到页面 dom 树中，也就是 React 所说的，保证了每次 dom 更新都是一次完整的 dom。也就是把当前的整个链表执行完以后再去更新 dom，不要执行一个链表节点更新一个 dom 了。

### 思考

把大任务分散成小任务，然后把小任务的结果收集，执行完以后统一返回大任务的结果

## 实现 function component

### 本质

组件在使用的时候本质上也就是一个 jsx 标签，最后也是由 createElement 函数进行转化的，但是这个 createElement 的 type 是传递的函数式组件本身这个函数。所以我们在进行 render 的时候，如果是函数式组件，要通过执行 createElement 的 type 获取到 fiber 的 children，为啥是作为 children 呢？因为这个组件肯定是作为了其他元素的的子节点，他已经是一个 fiber 了，他要去执行自己的 children 进行渲染，然后他要渲染的内容就是函数式组件的返回值，也就是 createElement 参数的 type 参数，也是他自己这个 fiber 的 type 属性

### 问题

在执行的多个组件渲染的时候，有个组件忘记传递 num 了，然后一直失败，后面通过 debug 发现是有个 children 是 undefined，原来 num 没有传递然后成了 undefined 值，又在 createElement 的 children 转化时没处理，等 render 的时候就报错了。最后处理是把为 falsy 的 children 全部过滤了。
