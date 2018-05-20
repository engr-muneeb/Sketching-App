import React, { Component } from 'react';
import './App.css';
import SketchingForm from './SketchingForm';
import SketchingList from './SketchingList';
import Sketching from './Sketching';
import Connection from './Connection';

class App extends Component {
  state = {
  };

  selectSketching = (sketching) => {
    this.setState({
      selectedSketching: sketching,
    });
  }

  render() {
    let ctrl = (
      <div>
        <SketchingForm />

        <SketchingList
          selectSketching={this.selectSketching}
        />
      </div>
    );

    if (this.state.selectedSketching) {
      ctrl = (
        <Sketching
          sketching={this.state.selectedSketching}
          key={this.state.selectedSketching.id}
        />
      );
    }

    return (
      <div className="App">
        <div className="App-header">
          <h2>Our awesome sketching app</h2>
        </div>

        <Connection />

        { ctrl }
      </div>
    );
  }
}

export default App;
