function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map((child) => {
        const isTextNode = typeof child === 'string';
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

function initChildren(fiber) {
  let prevChild = null;
  fiber.props.children.forEach((child, index) => {
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
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    fiber.parent.dom.append(dom);

    updateProps(dom, fiber.props);
  }

  initChildren(fiber);

  if (fiber.child) {
    return fiber.child;
  }

  if (fiber.sibling) {
    return fiber.sibling;
  }

  return fiber.parent?.sibling;
}

let nextWorkUnit = null;
function workLoop() {
  let shouldYield = false;

  while (!shouldYield && nextWorkUnit) {
    nextWorkUnit = preformWorkOfUnit(nextWorkUnit);
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

export default {
  render,
  createElement
};
