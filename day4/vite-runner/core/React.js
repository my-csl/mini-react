function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode = typeof child === 'string' || typeof child === 'number';
        return isTextNode ? createTextNode(child) : child;
      })
    }
  };
}

function createTextNode(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: []
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

function initChildren(fiber, children) {
  let prevChild = null;
  children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null,
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

function preformWorkOfUnit(fiber) {
  const isFunctionComponent = typeof fiber.type === 'function';

  if (!isFunctionComponent) {
    if (!fiber.dom) {
      const dom = (fiber.dom = createDom(fiber.type));

      updateProps(dom, fiber.props);
    }
  }

  const children = isFunctionComponent ? [fiber.type(fiber.props)] : fiber.props.children;
  initChildren(fiber, children);

  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }

  /**
   * <div>
   *  <div>
   *    <span>one</span>
   *    <span>two</span>
   *  </div>
   *  <div>hhhh~~</div>
   * </div>
   * 如上，渲染完two后，我们会去找two的parent的sibling，也就是第二个span的sibling
   * 但是这个时候sibling是null，如果这个时候直接返回了就会造成后续的dom不渲染了
   * 所以我们要继续往上找sibling，也就是继续渲染父亲甚至祖先的兄弟节点，这样才能保证把整个链表都渲染完
   */
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) return nextFiber.sibling;
    nextFiber = nextFiber.parent;
  }
}

let nextWorkUnit = null;
let root = null;
function workLoop() {
  let shouldYield = false;

  while (!shouldYield && nextWorkUnit) {
    nextWorkUnit = preformWorkOfUnit(nextWorkUnit);
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

  // 如果是组件的fiber，那就不存在dom，不需要添加
  if (fiber.dom) {
    let parent = fiber.parent;
    // 如果parent没有dom也就是父级fiber是个组件fiber，那继续往上找parent
    while (!parent.dom) {
      parent = parent.parent;
    }
    parent.dom.append(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

export default {
  render,
  createElement
};
