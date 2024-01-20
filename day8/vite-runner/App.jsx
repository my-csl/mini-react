import React from './core/React.js';

function Foo() {
  const [count, setCount] = React.useState(0);

  const handleClick = () => {
    setCount((num) => num + 1);
  };

  React.useEffect(() => {
    console.log('effect init1');

    return (oldCount) => {
      console.log('clean up0', oldCount);
    };
  }, []);

  React.useEffect(() => {
    console.log('effect count', count);

    return (oldCount) => {
      console.log('clean up1', oldCount);
    };
  }, [count]);

  React.useEffect(() => {
    console.log('effect 11');

    return (oldCount) => {
      console.log('clean up2', oldCount);
    };
  }, [count]);

  console.log('render');

  return (
    <div>
      foo: {count}
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
