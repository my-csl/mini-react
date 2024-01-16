import React from './React';

const ReactDom = {
  createRoot(container) {
    return {
      render(el) {
        React.render(el, container);
      }
    };
  }
};

export default ReactDom;
