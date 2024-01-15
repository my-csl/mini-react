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
  nextWorkUnit = {
    dom: container,
    props: {
      children: [el]
    }
  };

  root = nextWorkUnit;
}

function createDom(type) {
  return type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(type);
}

function updateProps(dom, props) {
  Object.keys(props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = props[key];
    }
  });
}

// 将vdom转换为链表结构
function initChildren(fiber, children) {
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      child: null,
      sibling: null
    };

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
  initChildren(fiber, children);
}

function updateHostComponent(fiber) {
  // 1、创建dom
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));

    // 2、设置 props，需要把children属性排除
    updateProps(dom, fiber.props);
  }

  const children = fiber.props.children;
  initChildren(fiber, children);
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

let root = null;
let nextWorkUnit = null;
function workLoop(deadline) {
  let shouldYield = false;

  while (!shouldYield && nextWorkUnit) {
    // dom 渲染
    nextWorkUnit = preformOfWorkUnit(nextWorkUnit);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextWorkUnit && root) {
    commitRoot(root.child);
    root = null;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function commitRoot(fiber) {
  commitWork(fiber);
}

function commitWork(fiber) {
  if (!fiber) return;

  if (fiber.dom) {
    let parent = fiber.parent;
    while (!parent.dom) {
      parent = parent.parent;
    }
    parent.dom.append(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

export default {
  createElement,
  render
};
