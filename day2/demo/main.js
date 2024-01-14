function workLoop(deadline) {
  let shouldYield = false;

  while (!shouldYield) {
    // dom 渲染
    shouldYield = deadline.timeRemaining() < 1;
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);
