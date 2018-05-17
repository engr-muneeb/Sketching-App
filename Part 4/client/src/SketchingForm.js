import React, { Component } from 'react';
import {
  createSketching,
} from './api';

class SketchingForm extends Component {
  state = {
    sketchingName: '',
  }

  handleSubmit = (event) => {
    event.preventDefault();
    createSketching(this.state.sketchingName);
    this.setState({
      sketchingName: '',
    });
  }

  render() {
    return (
      <div className="Form">
        <form onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={this.state.sketchingName}
            onChange={(evt) => this.setState({ sketchingName: evt.target.value })}
            placeholder="Sketching name"
            className="Form-sketchingInput"
            required
          />
          <button
            type="submit"
            className="Form-button"
          >Create</button>
        </form>
      </div>
    );
  }
}
export default SketchingForm;
