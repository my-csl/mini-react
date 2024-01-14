import React from './core/React.js';

// const App = React.createElement('div', { id: 'app' }, 'mini-', 'react');
const App = (
  <div id="app">
    <div>
      <h1>hello</h1>
      <h1>hello2</h1>
    </div>
    <h2>mini-react</h2>
  </div>
);

const AppOne = () => <App />;

console.log(AppOne);

export default App;
