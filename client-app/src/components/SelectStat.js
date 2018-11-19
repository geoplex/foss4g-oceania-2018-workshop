import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles';
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Select from '@material-ui/core/Select'
import MenuItem from '@material-ui/core/MenuItem'

const styles = theme => ({
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 200
  }
});

class SelectStat extends Component {
  handleChange = event => {
    this.props.handleChange(event.target.value)
  }

  render() {
    let value = this.props.layer.get(
      'styles'
    ).find(
      style => style.get('id') === this.props.layer.get('selectedStyle')
    ).get('id')

    return (
      <FormControl className={this.props.classes.formControl}>
        <InputLabel htmlFor={this.props.selectId}>{this.props.label}</InputLabel>
        <Select
          value={value}
          onChange={this.handleChange}
          inputProps={{
            name: 'displayName',
            id: this.props.selectId,
          }}
        >
          {this.props.layer.get('styles').map(style => {
            return <MenuItem key={style.get('id')} value={style.get('id')}>{style.get('displayName')}</MenuItem>
          })}
        </Select>
      </FormControl>
    )
  }

}

export default withStyles(styles)(SelectStat);


