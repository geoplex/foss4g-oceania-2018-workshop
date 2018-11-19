import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper'
import Table from '@material-ui/core/Table'
import TableBody from '@material-ui/core/TableBody'
import TableCell from '@material-ui/core/TableCell'
import TableRow from '@material-ui/core/TableRow'
import PaperHeader from './PaperHeader'

const styles = theme => ({
  root: {
    width: '90%',
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing.unit * 3,
    overflowX: 'auto'
  },
  table: {
    minWidth: 200
  },
  cellValue: {
    whiteSpace: 'nowrap'
  },
  paperHeading: {
    background: theme.palette.background.default,
    fontWeight: 400
  }
});

class InfoPanel extends Component {
  render() {
    let selectedPolygonStyle = this.props.polygonLayer.get(
      'styles'
    ).find(
      style => style.get('id') === this.props.polygonLayer.get('selectedStyle')
    )

    let selectedPointStyle = this.props.pointLayer.get(
      'styles'
    ).find(
      style => style.get('id') === this.props.pointLayer.get('selectedStyle')
    )

    let polygonValue = this.props.highlightFeatureProps ? this.props.highlightFeatureProps.get(selectedPolygonStyle.get('displayField')).toFixed(1) : '-'
    let pointValue = this.props.highlightFeatureProps ? this.props.highlightFeatureProps.get(selectedPointStyle.get('displayField')).toFixed(1) : '-'
    let saValue = this.props.highlightFeatureProps ?  + this.props.highlightFeatureProps.get('area_id') + ' (' + this.props.highlightFeatureProps.get('area_type') + ')' : '-'

    return (
      <Paper className={this.props.classes.root}>
        <PaperHeader title="Selected Area Info" />
        <Table className={this.props.classes.table}>
          <TableBody>
            <TableRow>
              <TableCell>
                Statistical Area
              </TableCell>
              <TableCell className={this.props.classes.cellValue}>{saValue}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {selectedPolygonStyle.get('displayName')}
              </TableCell>
              <TableCell numeric className={this.props.classes.cellValue}>{polygonValue}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>
                {selectedPointStyle.get('displayName')}
              </TableCell>
              <TableCell numeric className={this.props.classes.cellValue}>{pointValue}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Paper>
    )
  }
}

export default withStyles(styles)(InfoPanel);


