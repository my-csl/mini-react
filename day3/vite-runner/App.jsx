import React from './core/React.js';

function Counter({ num }) {
  return <div>count: {num}</div>;
}

function App() {
  return (
    <div id="app">
      <h1>hello2</h1>
      <h2>mini-react</h2>
      <Counter num={10} />
      <Counter num={20} />
    </div>
  );
}

export default App;
