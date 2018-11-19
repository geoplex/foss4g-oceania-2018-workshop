import React, { Component } from 'react'
import Map from 'ol/map'
import View from 'ol/view'
import TileLayer from 'ol/layer/tile'
import Stamen from 'ol/source/stamen'
import VectorTileLayer from 'ol/layer/vectortile'
import VectorTileSource from 'ol/source/vectortile'
import MVT from 'ol/format/mvt'
import Style from 'ol/style/style'
import Fill from 'ol/style/fill'
import Stroke from 'ol/style/stroke'
import 'ol/ol.css'
import stylefunction from '../external/stylefunction'


class OlMap extends Component {
  constructor(props) {
    super(props)
    this.map = null
    this.pointLayer = null
    this.polygonLayer = null
    this.highlightAreaId = null
    this.isDragging = false
  }

  componentDidMount() {
    let self = this
    self.loadMap()
  }

  componentDidUpdate(prevProps, prevState) {
    let self = this
    if (!prevProps.mbStyles && !!self.props.mbStyles) {
      self.loadLayers()
    }
    if (!prevProps.polygonLayer.get('selectedStyle') !== this.props.polygonLayer.get('selectedStyle')) {
      this.setVectorTileLayerStyle(this.polygonLayer, this.props.polygonLayer.get('name'), this.props.polygonLayer.get('selectedStyle'))
    }
    if (!prevProps.pointLayer.get('selectedStyle') !== this.props.pointLayer.get('selectedStyle')) {
      this.setVectorTileLayerStyle(this.pointLayer, this.props.pointLayer.get('name'), this.props.pointLayer.get('selectedStyle'))
    }
  }

  getVectorTileUrl (layerConfig) {
    let requestParams = {
      REQUEST: 'GetTile',
      SERVICE: 'WMTS',
      VERSION: '1.0.0',
      LAYER: layerConfig.get('workspace') + ':' + layerConfig.get('name'),
      STYLE: '',
      TILEMATRIX: 'EPSG:900913:{z}',
      TILEMATRIXSET: 'EPSG:900913',
      FORMAT: 'application/x-protobuf;type=mapbox-vector',
      TILECOL: '{x}',
      TILEROW: '{y}'
    }
    let requestParamsString = Object.keys(requestParams).map(x => x + '=' + requestParams[x]).join('&');
    return this.props.baseGeoserverUrl + '/gwc/service/wmts?' + requestParamsString;
  }

  handleMapOnSingleClick (event) {
    let self = this
    let features = self.map.getFeaturesAtPixel(event.pixel);

    if (features && features.length) {
      let featureProps = features[0].getProperties()
      self.highlightAreaId = featureProps.area_id
      self.polygonLayer.setStyle(self.polygonLayer.getStyle())
      this.props.setHighlightFeatureProps(featureProps)
    } else {
      self.highlightAreaId = null
      if (self.polygonLayer) {
        self.polygonLayer.setStyle(self.polygonLayer.getStyle())
      }
      this.props.setHighlightFeatureProps(null)
    }
  }

  setVectorTileLayerStyle(layer, source, mbStyleId) {
    let self = this
    let mbStyle = self.props.mbStyles.get(mbStyleId).get('style').toJS();
    stylefunction(layer, mbStyle, source);

    let origStyleFunction = layer.getStyleFunction()
    layer.setStyle((feature, resolution) => {
      if (feature.getProperties().area_id === self.highlightAreaId) {
        return new Style({
          stroke: new Stroke({
            color: 'rgba(200,20,20,0.8)',
            width: 5
          }),
          fill: new Fill({
            color: 'rgba(200,20,20,0.2)'
          })
        });
      }
      return origStyleFunction(feature, resolution)
    })
  }

  createVectorTileLayer(layerConfig) {
    let self = this
    return new VectorTileLayer({
      declutter: true,
      source: new VectorTileSource({
        format: new MVT(),
        url: self.getVectorTileUrl(layerConfig)
      })
    })
  }

  loadLayers () {
    let self = this
    self.polygonLayer = self.createVectorTileLayer(self.props.polygonLayer)
    self.pointLayer = self.createVectorTileLayer(self.props.pointLayer)

    self.setVectorTileLayerStyle(self.polygonLayer, self.props.polygonLayer.get('name'), self.props.polygonLayer.get('selectedStyle'))
    self.setVectorTileLayerStyle(self.pointLayer, self.props.pointLayer.get('name'), self.props.pointLayer.get('selectedStyle'))

    self.map.getLayers().push(self.polygonLayer)
    self.map.getLayers().push(self.pointLayer)
  }

  loadMap () {
    let self = this
    let layers = [
      new TileLayer({
        source: new Stamen({
          layer: 'toner-lite'
        })
      })
    ]
    self.map = new Map({
      layers: layers,
      target: 'map',
      view: new View({
        center: self.props.mapOptions.get('center').toJS(),
        zoom: self.props.mapOptions.get('zoom')
      })
    })

    self.map.on('singleclick', self.handleMapOnSingleClick, self)
  }

  render() {
    return (
      <div id='map' style={this.props.style} />
    )
  }

}

export default OlMap;


