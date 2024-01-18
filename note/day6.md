# update children

## diff 更新 children

两个注意点：  
1、如果是删除的 children 是个组件，那此时的 fiber 的 dom 属性是空的，我们需要递归调用删除 children 的方法，将 fiber 的 child 作为当前递归的 fiber  
2、调用删除的时候是调用当前的 fiber 的 parent 删除当前 fiber 的 dom，如果 parent 是一个组件 fiber，那需要继续往上找 parent
