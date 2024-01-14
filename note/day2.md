# 实现任务调度器&fiber

## fiber 想解决的问题？

1、异步更新 dom  
2、解决大量 dom 更新时的卡顿问题  
3、fiber 架构本身并没有节省 dom 更新的操作时间，是利用了异步的方式实现 dom 的切片化更新  
4、在异步时腾出空间去响应用户的操作，不会造成 UI 卡顿的现象  
5、本质上异步时通过 requestIdleCallback 这个 api，这个函数属于一个宏任务  
6、requestIdleCallback Api 的作用是在浏览器空闲时间去执行传入的回调函数，回调函数可以实时获取到剩余的可操作时间

## fiber 链表生成的一个优化点

fiber 链表不是一开始就生成一个完整的链表，而是一边执行更新一边生成链表。  
每次执行 preformOfWorkUnit 方法时，会先生成同级的 fiber，也就是只会去循环 children，生成当前 fiber 的 child（子 fiber）和 child 的 sibling（兄弟 fiber）。这里当前 fiber 会去循环自己的 children，把第一个节点当作自己的 child，后续的节点作为 child 的 sibling  
所以 preformOfWorkUnit 方法会返回当前 fiber 的 child，没有 child 就返回当前 fiber 的 sibling，最后返回 fiber 父节点 fiber 的 sibling（叔叔 fiber）。  
只要有 child 每次都会返回 child，也就是生成的 dom 还是会一直去递归生成子节点，等子节点没有了再去执行兄弟节点，没有兄弟节点再去执行叔叔节点

## 理论反馈业务

如果业务中有一些很耗时的逻辑，除了放入 worker 中，那也可以类似切片操作  
将一个大任务切分出多个小任务，然后将所有小任务放入队列，依此将任务从队列取出异步执行，每次执行传入上一次任务的返回结果，最后一个任务完成时用预先设置好的回调触发
