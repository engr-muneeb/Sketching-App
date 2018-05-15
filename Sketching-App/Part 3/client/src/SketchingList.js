import React, { Component } from 'react';
import {
  subscribeToSketchings,
} from './api';


class SketchingList extends Component {
  constructor(props) {
    super(props);

    subscribeToSketchings((sketching) => {
      this.setState(prevState => ({
        sketchings: prevState.sketchings.concat([sketching]),
      }));
    });
  }

  state = {
    sketchings: [],
  };

  render() {
    const sketchings = this.state.sketchings.map(sketching => (
      <li
        className="SketchingList-item"
        key={sketching.id}
      >
        {sketching.name}
      </li>
    ));

    return (
      <ul
        className="SketchingList"
      >
        {sketchings}
      </ul>
    );
  }
}

export default SketchingList;
