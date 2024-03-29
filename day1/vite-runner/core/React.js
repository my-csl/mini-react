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
      children: children.map((child) => {
        return typeof child === 'string' ? createTextNode(child) : child;
      })
    }
  };
}

function render(el, container) {
  const dom =
    el.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(el.type);

  // 设置 props，需要把children属性排除
  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  });

  el.props.children.forEach((child) => {
    // 使用递归将child节点append到当前的dom
    render(child, dom);
  });

  container.append(dom);
}

export default {
  createElement,
  render
};
