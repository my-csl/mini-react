import React from './core/React.js';

function Foo() {
  const [count, setCount] = React.useState(0);
  const [bar, setBar] = React.useState('bar');

  const handleClick = () => {
    // setCount((num) => num + 1);
    setBar('bar');
  };
  console.log('render');
  return (
    <div>
      foo: {count}
      <div>{bar}</div>
      <button onClick={handleClick}>+1</button>
    </div>
  );
}

function App() {
  return (
    <div id="app">
      <h1>hello</h1>
      <h2>mini-react</h2>
      <hr />
      <Foo />
    </div>
  );
}

export default App;
