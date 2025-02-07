// App.js
import React from 'react';
import { BrowserRouter as Router } from "react-router-dom";
import RichTextEditor from './componets/RichTextEditor'; // Adjust the path as necessary

function App() {
  return (
    <div className="App">
      <Router>
        <RichTextEditor />
      </Router>
    </div>
  );
}

export default App;