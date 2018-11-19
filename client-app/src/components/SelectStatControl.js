import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper'
import PaperHeader from './PaperHeader'
import SelectStat from './SelectStat'

const styles = theme => ({
  root: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 200
  }
});

class SelectStatControl extends Component {
  render() {
    return (
      <Paper className={this.props.classes.root}>
        <PaperHeader title="Select Statistic" />
        <SelectStat
          selectId="polygon-select"
          label="Polygon Layer Statistic"
          handleChange={this.props.setPolygonStyle}
          layer={this.props.polygonLayer}
        />
        <SelectStat
          selectId="point-select"
          label="Point Layer Statistic"
          handleChange={this.props.setPointStyle}
          layer={this.props.pointLayer}
        />
      </Paper>
    )
  }
}

export default withStyles(styles)(SelectStatControl);


