# 搞定 useState

## 实现原理

实现 useState 的主要方式就是我们把 useState 内部维护的 stateHook 保存在了当前的组件 fiber 上，作为 fiber 的一个属性  
每次重新运行 useState（组件更新的时候），我们就会读取 fiber 的 alternate 属性获取到对应的旧的 fiber，然后拿到上次的 stateHook，作为这次 useState 的初始值，这样就能保证每次的 state 是在上一次的 state 的基础上更新的  
如果组件内有多个 useState，那我们就需要把 fiber 上原本保存的 stateHook 改成 stateHooks 数组，然后把组件函数运行时所有的 stateHook 加入到这个 stateHooks 中，然后我们维护一个 stateHookIndex，因为我们的 state hook 都是按顺序添加的，等更新等时候先重置 stateHookIndex 为 0，然后每运行一次 useState 的时候 stateHookIndex++，然后获取每个 state 对应的 stateHook 的时候都通过 stateHooks[stateHookIndex]去获取，这样就能保证每个 state 都能获取到自己对应的 stateHook 了。所以 react 中的 hook 都不能在 if 判断中，在 if 判断中，那就拿不到对应的 stateHook 了

## 优化

更新 state 的时候，我们获取到这次更新的值，然后跟上一次的值进行比较，如果相同我们就跳过更新
