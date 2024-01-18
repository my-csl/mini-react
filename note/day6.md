# update children

## diff 更新 children

两个注意点：  
1、如果是删除的 children 是个组件，那此时的 fiber 的 dom 属性是空的，我们需要递归调用删除 children 的方法，将 fiber 的 child 作为当前递归的 fiber  
2、调用删除的时候是调用当前的 fiber 的 parent 删除当前 fiber 的 dom，如果 parent 是一个组件 fiber，那需要继续往上找 parent

## diff-删除多余的老节点

当我们在 reconcileChildren 中循环操作 children 时，如果循环完，oldFiber 指针还有值的话，说明此时旧节点比新节点长，我们需要把多余的 oldFiber 加入到 deletion 待删除数组中，这边添加的时候还应该一直循环去查找 oldFiber 的 sibling，因为多出来的可能不止一个节点

## 优化更新 减少不必要的计算

通过记录开始节点和结束节点，将更新限制在当前组件，同级的兄弟组件不重新渲染
