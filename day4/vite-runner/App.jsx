import React from './core/React';

function Counter({ num }) {
  return <div>count: {num}</div>;
}

const App = (
  <div id="app">
    <h1>hello</h1>
    <h2>mini-react</h2>
    <Counter num={10} />
    <Counter num={20} />
  </div>
);

export default App;
