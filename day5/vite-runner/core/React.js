function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
    }
  };
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children
        .map((child) => {
          const isTextNode = typeof child === 'string' || typeof child === 'number';
          return isTextNode ? createTextNode(child) : child;
        })
        .filter(Boolean)
    }
  };
}

function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el]
    }
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
    const isSameType = oldFiber && oldFiber.type === child.type;

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
        alternate: oldFiber
      };
    } else {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        child: null,
        sibling: null,
        dom: null,
        effectTag: 'placement'
      };
    }

    if (oldFiber) {
      // 因为我们是一个链表，循环到下一次的时候oldFiber应该指向兄弟节点
      oldFiber = oldFiber.sibling;
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevChild.sibling = newFiber;
    }
    prevChild = newFiber;
  });
}

function updateFunctionComponent(fiber) {
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
let currentRoot = null;
let nextWorkUnit = null;
function workLoop(deadline) {
  let shouldYield = false;

  while (!shouldYield && nextWorkUnit) {
    // dom 渲染
    nextWorkUnit = preformOfWorkUnit(nextWorkUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkUnit && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot
  };

  nextWorkUnit = wipRoot;
}

function commitRoot() {
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
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

export default {
  createElement,
  render,
  update
};
