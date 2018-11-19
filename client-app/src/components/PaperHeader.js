import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

const styles = theme => ({
  paperHeading: {
    background: theme.palette.background.default,
    fontWeight: 400
  }
});

class PaperHeader extends Component {
  render() {
    return (
      <div>
        <Typography className={this.props.classes.paperHeading} variant="subheading" color="primary" align="center">
          {this.props.title}
        </Typography>
        <Divider />
      </div>
    )
  }
}

export default withStyles(styles)(PaperHeader);


