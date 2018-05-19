import React, { Component } from 'react';
import Canvas from 'simple-react-canvas';
import { publishLine, subscribeToSketchingLines } from './api';

class Sketching extends Component {
  state = {
    lines: [],
  }

  componentDidMount() {
    subscribeToSketchingLines(this.props.sketching.id, (linesEvent) => {
      this.setState((prevState) => {
        return {
          lines: [...prevState.lines, ...linesEvent.lines],
        };
      });
    });
  }

  handleDraw = (line) => {
    publishLine({
      sketchingId: this.props.sketching.id,
      line,
    });
  }

  render() {
    return (this.props.sketching) ? (
      <div
        className="Sketching"
      >
        <div className="Sketching-title">{this.props.sketching.name}</div>
        <Canvas
          onDraw={this.handleDraw}
          sketchingEnabled={true}
          lines={this.state.lines}
        />
      </div>
    ) : null;
  }
}

export default Sketching;
