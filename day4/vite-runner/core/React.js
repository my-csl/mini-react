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
  const dom =
    el.type === 'TEXT_ELEMENT' ? document.createTextNode('') : document.createElement(el.type);

  Object.keys(el.props).forEach((key) => {
    if (key !== 'children') {
      dom[key] = el.props[key];
    }
  });

  el.props.children.forEach((child) => {
    render(child, dom);
  });

  container.append(dom);
}

export default {
  render,
  createElement
};
