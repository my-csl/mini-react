import React from './core/React.js';

// const App = React.createElement('div', { id: 'app' }, 'mini-', 'react');
const App = <div id="app">mini-react</div>;

const AppOne = () => <App />;

console.log(AppOne);

export default App;
