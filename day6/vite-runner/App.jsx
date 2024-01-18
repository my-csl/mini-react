import React from './core/React.js';

// 这里我们因为还没实现 useState ，暂时先把改变的prop提取到组件外部
// 因为当构建新的fiber链表的时候，函数式组件都会重新运行，里面定义的变量也会全部重新创建
// 这样我们每次prop都是一样的了
let count = 0;
let prop = { id: 'count' };

function Counter({ num }) {
  const handleClick = (e) => {
    console.log('click~~', e);
    count++;
    prop = {};
    React.update();
  };

  return (
    <div {...prop}>
      count: {count}
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

let barCount = 0;
function Bar() {
  const update = React.update();

  const handleClick = () => {
    barCount++;
    update();
  };

  console.log('Bar render');
  return (
    <div>
      bar: {barCount}
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

let fooCount = 0;
function Foo() {
  const update = React.update();

  const handleClick = () => {
    fooCount++;
    update();
  };

  console.log('Foo render');
  return (
    <div>
      foo: {fooCount}
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

let appCount = 0;
function App() {
  const update = React.update();

  const handleClick = () => {
    appCount++;
    update();
  };

  console.log('App render');
  return (
    <div id="app">
      <h1>hello</h1>
      <h2>mini-react</h2>
      app: {appCount}
      <button onClick={handleClick}>+1</button>
      <hr />
      <Bar />
      <hr />
      <Foo />
    </div>
  );
}

export default App;
