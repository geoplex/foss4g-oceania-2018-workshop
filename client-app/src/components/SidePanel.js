import React, { Component } from 'react'
import InfoPanel from './InfoPanel'
import SelectStatControl from './SelectStatControl'

class SidePanel extends Component {
  render() {
    return (
      <div style={this.props.style}>
        <SelectStatControl
          pointLayer={this.props.pointLayer}
          polygonLayer={this.props.polygonLayer}
          setPolygonStyle={this.props.setPolygonStyle}
          setPointStyle={this.props.setPointStyle}
        />
        <InfoPanel
          pointLayer={this.props.pointLayer}
          polygonLayer={this.props.polygonLayer}
          highlightFeatureProps={this.props.highlightFeatureProps}
        />
      </div>
    )
  }
}

export default SidePanel;


