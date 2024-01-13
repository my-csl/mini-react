# day1-实现最简 mini-react

## 今天学到了什么？

- React 的 vdom 到真实 dom 的一个最小化的实现步骤
- 了解了 React 最开始启动 createRoot 时候做的事情，之前知道需要先 createRoot 但是没去想过后面的逻辑
- vite 的 html 文件可以直接使用一个 jsx/tsx/ts，之前认为只能 js
- vite 中的 jsx/tsx 文件默认转换是用的 React 的那一套规则，转换的时候是用 esbuild 转换的，每个 jsx 标签转换出来都是一个 createElement 方法，但是我们实际使用的时候是不会在每个 jsx 文件中进行 createElement 方法导入的，这个实际都是 esbuild 帮我们做了，帮我们导入了`import React from React`。如果不是使用 React 的那一套 jsx/tsx 转换规则，可以在 vite 配置文件进行修改

## 遇到了哪些问题？

- 视频碰到的问题都踩了一遍，比如 html 文件的 id 没换，字符串输入的时候没有进行 vnode 转换

## 怎么解决的？

- 根据报错信息排查，然后会议视频中的内容

## 这节课对自己有什么帮助？

- 对 vite 中的 jsx 转换配置更了解了
- 对 React 的 vdom 规则大致了解了

## 里面的哪些知识点是可以直接用到工作中的？

-

## 放上你写的代码链接(让你动手)

- https://github.com/my-csl/mini-react

## TODO

### 递归渲染每个 vnode 的子节点造成的问题？

- 如果 vnode 过于复杂，节点过多，层级过深，这个递归开始就没办法结束，这样会造成 js 代码执行时间太长，造成页面白屏或者卡顿现象
- 所以 React16 以后引入了 Fiber 架构，让 dom 更新实现了异步更新和任务优先级调度

### 关于函数式组件

- 函数式组件应该在 render 判断如果 type 为函数，那就执行 type 获取到 vnode 对象保存在一个属性上？
