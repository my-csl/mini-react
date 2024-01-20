function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode = typeof child === 'string' || typeof child === 'number';
        return isTextNode ? createTextNode(child) : child;
      }),
      // .filter(Boolean)
    },
  };
}

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };

  nextWorkUnit = wipRoot;
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
  // props更新三种情况
  // 1、old 有 new 没有 删除
  Object.keys(prevProps).forEach((key) => {
    if (key !== 'children') {
      if (!(key in nextProps)) {
        dom.removeAttribute(key);
      }
    }
  });
  // 2、new 有 old 有  更新
  // 3、new 有 old 没有  新增
  Object.keys(nextProps).forEach((key) => {
    if (key !== 'children') {
      if (nextProps[key] !== prevProps[key]) {
        const isListener = /^on([A-Z]+.*)/.exec(key);
        if (isListener) {
          const eventType = isListener[1].toLocaleLowerCase();
          dom.removeEventListener(eventType, prevProps[key]);
          dom.addEventListener(eventType, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  });
}

// 将vdom转换为链表结构
function reconcileChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let prevChild = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child?.type;

    let newFiber;
    if (isSameType) {
      // 标签相同即为 update
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: oldFiber.dom,
        effectTag: 'update',
        // 如果是更新的时候，我们先把对应的旧子节点记住，这样当我们diff更新的时候，可以快速的找到对应的旧子节点
        alternate: oldFiber,
      };
    } else {
      if (child) {
        newFiber = {
          type: child.type,
          props: child.props,
          parent: fiber,
          child: null,
          sibling: null,
          dom: null,
          effectTag: 'placement',
        };
      }
      if (oldFiber) {
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      // 因为我们是一个链表，循环到下一次的时候oldFiber应该指向兄弟节点
      oldFiber = oldFiber.sibling;
    }

    if (index === 0 || !prevChild) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }

    if (newFiber) {
      prevChild = newFiber;
    }
  });

  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionComponent(fiber) {
  stateHooks = [];
  effectHooks = [];
  stateHookIndex = 0;
  wipFiber = fiber;

  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children);
}

function updateHostComponent(fiber) {
  // 1、创建dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));

    // 2、设置 props，需要把children属性排除
    updateProps(dom, fiber.props, {});
  }

  const children = fiber.props.children;
  reconcileChildren(fiber, children);
}

function preformOfWorkUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

// work in progress root 工作中的root
let wipRoot = null;
let wipFiber = null;
let currentRoot = null;
let nextWorkUnit = null;
let deletions = [];
function workLoop(deadline) {
  let shouldYield = false;

  while (!shouldYield && nextWorkUnit) {
    // dom 渲染
    nextWorkUnit = preformOfWorkUnit(nextWorkUnit);

    if (wipRoot?.sibling?.type === nextWorkUnit?.type) {
      nextWorkUnit = null;
    }

    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkUnit && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function update() {
  let currentFiber = wipFiber;

  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextWorkUnit = wipRoot;
  };
}

let stateHooks = [];
let stateHookIndex = 0;
function useState(initial) {
  let currentFiber = wipFiber;
  const oldHook = currentFiber?.alternate?.stateHooks;

  const stateHook = {
    state: oldHook ? oldHook[stateHookIndex].state : initial,
  };

  stateHooks.push(stateHook);
  stateHookIndex++;

  currentFiber.stateHooks = stateHooks;

  const setState = (action) => {
    let getter = typeof action === 'function' ? action : () => action;

    const eagerState = getter(stateHook.state);

    if (eagerState === stateHook.state) return;

    stateHook.state = getter(stateHook.state);

    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };

    nextWorkUnit = wipRoot;
  };

  return [stateHook.state, setState];
}

function commitDeletion(fiber) {
  if (fiber.dom) {
    let parentFiber = fiber.parent;
    while (!parentFiber.dom) {
      parentFiber = parentFiber.parent;
    }
    parentFiber.dom.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child);
  }
}

function commitRoot() {
  deletions.forEach(commitDeletion);
  commitWork(wipRoot.child);
  commitEffectHook();
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitWork(fiber) {
  if (!fiber) return;

  let parentFiber = fiber.parent;
  while (!parentFiber.dom) {
    parentFiber = parentFiber.parent;
  }

  if (fiber.effectTag === 'update') {
    updateProps(fiber.dom, fiber.props, fiber.alternate.props);
  } else if (fiber.effectTag === 'placement') {
    if (fiber.dom) {
      parentFiber.dom.append(fiber.dom);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

let effectHooks;
function commitEffectHook() {
  function run(fiber) {
    if (!fiber) return;

    if (!fiber.alternate) {
      // init
      fiber.effectHooks?.forEach((hook) => {
        hook.cleanup = hook.callback();
      });
    } else {
      // update
      fiber.effectHooks?.forEach((newHook, index) => {
        if (newHook.deps > 0) {
          const oldEffectHook = fiber.alternate.effectHooks[index];

          const needUpdate = oldEffectHook.deps.some((oldDep, i) => {
            return newHook.deps[i] !== oldDep;
          });

          needUpdate && (newHook.cleanup = newHook.callback());
        }
      });
    }

    run(fiber.child);
    run(fiber.sibling);
  }

  function runCleanup(fiber) {
    if (!fiber) return;

    fiber?.alternate?.effectHooks?.forEach((hook) => {
      if (typeof hook.cleanup === 'function' && hook.deps.length > 0) {
        hook.cleanup(hook.deps);
      }
    });

    runCleanup(fiber.child);
    runCleanup(fiber.sibling);
  }

  runCleanup(wipRoot);
  run(wipRoot);
}

function useEffect(callback, deps) {
  const effectHook = {
    callback,
    deps,
    cleanup: undefined,
  };

  effectHooks.push(effectHook);

  wipFiber.effectHooks = effectHooks;
}

export default {
  createElement,
  render,
  update,
  useState,
  useEffect,
};
