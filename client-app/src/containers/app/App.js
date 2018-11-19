import React, { Component } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import OlMap from '../../components/OlMap';
import SidePanel from '../../components/SidePanel';
import AppHeader from '../../components/AppHeader';
import {
  fetchStyles,
  setHighlightFeatureProps,
  setPolygonStyle,
  setPointStyle
} from '../../modules/map'

const theme = createMuiTheme();

const styles = {
  app: {
    height: '100%',
    width: '100%'
  },
  sidePanel: {
    height: 'calc(100% - 64px)',
    width: 349,
    position: 'absolute',
    marginTop: 64,
    borderRight: '1px solid ' + theme.palette.primary.main
  },
  map: {
    height: 'calc(100% - 64px)',
    width: 'calc(100% - 350px)',
    position: 'absolute',
    marginTop: 64,
    marginLeft: 350
  }
}

class App extends Component {
  componentDidMount() {
    this.fetchStyles()
  }

  fetchStyles() {
    let data = {
      baseGeoserverUrl: this.props.baseGeoserverUrl
    }
    let stylesConfig = [
      this.props.polygonLayer.get('styles').toJS(),
      this.props.pointLayer.get('styles').toJS()
    ]

    data.stylesConfig = [].concat.apply([], stylesConfig)
    this.props.fetchStyles(data)
  }

  render() {
    return (
      <MuiThemeProvider theme={theme}>
        <div style={styles.app}>
          <AppHeader/>
          <SidePanel
            style={styles.sidePanel}
            pointLayer={this.props.pointLayer}
            polygonLayer={this.props.polygonLayer}
            highlightFeatureProps={this.props.highlightFeatureProps}
            setPolygonStyle={this.props.setPolygonStyle}
            setPointStyle={this.props.setPointStyle}
          />
          <OlMap
            style={styles.map}
            baseGeoserverUrl={this.props.baseGeoserverUrl}
            mapOptions={this.props.mapOptions}
            pointLayer={this.props.pointLayer}
            polygonLayer={this.props.polygonLayer}
            mbStyles={this.props.mbStyles}
            setHighlightFeatureProps={this.props.setHighlightFeatureProps}
          />
        </div>
      </MuiThemeProvider>
    );
  }
}

const mapStateToProps = state => ({
  baseGeoserverUrl: state.map.get('baseGeoserverUrl'),
  mapOptions: state.map.get('mapOptions'),
  pointLayer: state.map.get('pointLayer'),
  polygonLayer: state.map.get('polygonLayer'),
  mbStyles: state.map.get('mbStyles'),
  selectedPointStyle: state.map.get('selectedPointStyle'),
  selectedPolygonStyle: state.map.get('selectedPolygonStyle'),
  highlightFeatureProps: state.map.get('highlightFeatureProps')
});

const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchStyles,
      setHighlightFeatureProps,
      setPolygonStyle,
      setPointStyle
    },
    dispatch
  );

export default connect(mapStateToProps, mapDispatchToProps)(App);
