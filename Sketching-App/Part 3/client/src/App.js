import React, { Component } from 'react';
import './App.css';
import SketchingForm from './SketchingForm';
import SketchingList from './SketchingList';

class App extends Component {
  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h2>Our awesome sketching app</h2>
        </div>

        <SketchingForm />

        <SketchingList />
      </div>
    );
  }
}

export default App;
