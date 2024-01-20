# 搞定 useEffect

useEffect 整体的实现原理和 useState 还是比较相识的，都是通过将收集到的 hook 绑定到 fiber 上，等需要使用的时候再去 fiber 上取过来用  
但是 useEffect 有个不同就是他会有一个 cleanup 函数，cleanup 是我们传递给 useEffect 回调函数的返回值，然后 useEffect 重新执行的时候会先把所有的 cleanup 函数执行，再去执行 useEffect 的回调。  
这里为啥要执行完全部 cleanup 才去执行 useEffect 回调呢？暂时搞不清楚 react 这样实现的目的。  
现在的逻辑是递归执行全部 cleanup，再递归执行全部 useEffect 回调，我们可以考虑使用一次递归，在递归中收集需要处理的回调函数，然后用两次循环去处理 cleanup 和 useEffect 的回调
