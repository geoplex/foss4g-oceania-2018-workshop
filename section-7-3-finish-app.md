# 0 to 100 on AWS – Building a full stack web mapping application with PostGIS, GeoServer, OpenLayers and ReactJS

#### FOSS4G SotM Oceania - Afternoon Workshop #1 - 20th November 2018

### Section 7 Stage 3 - Finish the application

In this section we'll finish developing our web application by adding the
vector tile services we published in GeoServer, styling the layers with the
Mapbox styles created, and complete wiring up the UI controls so that we have
an interactive web map application for exploring and comparing ABS statistics.

**1.** First up we need to work around a build issue (minification problem when
building with `npm`) with the library that we'll use for styling the vector
tile layers. We can work around this by copying some of the libraries from
`node_modules` to our own application `src/external` directory.

From the top-level `foss4g-client` directory, copy the following files from
`node_modules` to `src/external`:

| Source | Destination |
| --- | --- |
| `node_modules/ol-mapbox-style/stylefunction.js` | `src/external/stylefunction.js` |
| `node_modules/ol-mapbox-style/util.js` | `src/external/util.js` |
| `node_modules/@mapbox/mapbox-gl-style-spec/deref.js` | `src/external/mapbox-gl-style-spec/deref.js`  (note the subfolder)|

Copy the following directories with contents from `node_modules` to `src/external/mapbox-gl-style-spec/`

| Source | Destination |
| --- | --- |
| `node_modules/@mapbox/mapbox-gl-style-spec/feature_filter` | `src/external/mapbox-gl-style-spec/feature_filter` |
| `node_modules/@mapbox/mapbox-gl-style-spec/function` | `src/external/mapbox-gl-style-spec/function ` |
| `node_modules/@mapbox/mapbox-gl-style-spec/util` | `src/external/mapbox-gl-style-spec/util` |

In `src/external/stylefunction.js`, replace `@mapbox` with in `.` in the
following `import` statements.

```
import derefLayers from './mapbox-gl-style-spec/deref';
import glfun from './mapbox-gl-style-spec/function';
import createFilter from './mapbox-gl-style-spec/feature_filter';
```

**2.** Now we'll wire up the request to fetch the MB styles that we published
in GeoServer earlier so that we can store those in the application state.

Return to the `src` directory, edit the `modules/map.js` file and add the
following Redux action constants below the import statements.

```
...
export const STYLES_REQUESTED = 'map/STYLES_REQUESTED';
export const STYLES_RECEIVED = 'map/STYLES_RECEIVED';
export const STYLES_ERROR = 'map/STYLES_ERROR';
...
```
Add two properties to the initial state object that will manage whether a request to get styles from GeoServer is currently active and also the styles themselves once retrieved.

```
const initialState = Immutable.fromJS({
  ...,
  isRequestingStyles: false,
  mbStyles: null
})

```

Now add the following function at the bottom of the file, to handle the async
request for styles from GeoServer. Once retrieved, the styles are set in the
state via a Redux action. Notice that an action is fired as soon as the styles
are requested as well as when they are recieved (or an error occurs).

```
...
export const fetchStyles = (data) => {
  return dispatch => {
    dispatch({
      type: STYLES_REQUESTED,
      payload: null
    });

    let promises = data.stylesConfig.map(styleConfig => {
      let url = data.baseGeoserverUrl + '/rest/workspaces/' + styleConfig.workspace + '/styles/' + styleConfig.templateStyle + '.mbstyle'
      return fetch(url, {
        credentials: 'include'
      }).then(
        result => result.json()
      ).then(style => {
        return {
          id: styleConfig.id,
          style: style,
          displayName: styleConfig.displayName,
          displayField: styleConfig.displayField
        }
      }).catch(error => {
        dispatch({
          type: STYLES_ERROR,
          payload: error
        })
      })
    })

    Promise.all(promises).then(styleResults => {
      dispatch({
        type: STYLES_RECEIVED,
        payload: styleResults
      })
    })
  }
}
```

Add new action handlers to the switch statement in the default reducer function
(from the line beginning with `export default`) to store the `mbStyles` in the
application state. Notice that the the template `<REPLACE_FIELD>` and
`<REPLACE_BASE_GEOSERVER_URL>` values are also replaced in the styles once
retrieved from GeoServer.

```
export default (state = initialState, action) => {
  switch (action.type) {
    case STYLES_REQUESTED:
      state = state.set('isRequestingStyles', true)
      return state;
    case STYLES_RECEIVED:
      state = state.set('isRequestingStyles', false)
      let mbStyles = {}
      action.payload.forEach(styleResult => {
        let style = JSON.parse(
          JSON.stringify(styleResult.style)
            .replace(new RegExp('<REPLACE_FIELD>', 'g'), styleResult.displayField)
            .replace(new RegExp('<REPLACE_BASE_GEOSERVER_URL>', 'g'), process.env.REACT_APP_BASE_GEOSERVER_URL)
        )
        mbStyles[styleResult.id] = {
          displayName: styleResult.displayName,
          style: style
        }
      })
      state = state.set('mbStyles', Immutable.fromJS(mbStyles))
      return state;
    case STYLES_ERROR:
      console.error(action.payload)
      return state;
    default:
      return state;
  }
};
```

**3.** Now we'll import the `fetchStyles` function into the App container, map
it to the props of this component and call it once the component loads.

In `containers/app/App.js`, import the function

```
import {
  fetchStyles
} from '../../modules/map'
```

Then map the action dispatcher to the `App` props.

```
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchStyles
    },
    dispatch
  );
```

Finally, fetch the styles when the component mounts by adding the `componentDidMount` and `fetchStyles` methods.

```
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
    ...
  }
}
```

**4.** Now that we have the MBStyles in the application state we'll add the vector tile layers to the map.

In the `components/OlMap.js` component import the following additional modules

```
...
import VectorTileLayer from 'ol/layer/vectortile'
import VectorTileSource from 'ol/source/vectortile'
import MVT from 'ol/format/mvt'
import Style from 'ol/style/style'
import Fill from 'ol/style/fill'
import Stroke from 'ol/style/stroke'
import stylefunction from '../external/stylefunction'
```

Modify the constructor to set a `highlightAreaId` property on the class

```
constructor(props) {
  super(props)
  this.map = null
  this.highlightAreaId = null
}
```

Add the following methods to the class to create and style the vector tile layers

```
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
```

And finally call the `loadLayers` method once the mbStyles have been retrieved
and are available to the `OlMap` component. Modify the `componentDidUpdate`
lifecycle method to the following.

```
componentDidUpdate(prevProps, prevState) {
  let self = this
  if (!prevProps.mbStyles && !!self.props.mbStyles) {
    self.loadLayers()
  }
}
```

**5.** We then just need to pass in the mbStyles prop to the `OlMap` component.

Modify the `mapStateToProps` function in `containers/app/App.js` to include `mbStyles`

```
const mapStateToProps = state => ({
  ...
  mbStyles: state.map.get('mbStyles')
});
```

Now pass the `mbStyles` prop into the `OlMap` component by modifying the JSX.

```
<OlMap
  ...,
  mbStyles={this.props.mbStyles}
/>
```

You should now see a point layer and polygon layer on the map! From here we
just need to wire up the UI controls to select the statistic to be displayed by
each layer and the identify function.

#### Selecting statistics for map layers

**1.** In `components/OlMap.js`, we need to update the React component
lifecycle hook to detect when the `selectedStyle` property of one of the layers
has changed, and change the layer style in response.  Update the
`componentDidUpdate()` method to read as follows:

```
  componentDidUpdate(prevProps, prevState) {
    let self = this
    if (!prevProps.mbStyles && !!self.props.mbStyles) {
      self.loadLayers()
    } else {
      if (prevProps.polygonLayer.get('selectedStyle') !== self.props.polygonLayer.get('selectedStyle')) {
        self.setVectorTileLayerStyle(self.polygonLayer, self.props.polygonLayer.get('name'), self.props.polygonLayer.get('selectedStyle'))
      }
      if (prevProps.pointLayer.get('selectedStyle') !== self.props.pointLayer.get('selectedStyle')) {
        self.setVectorTileLayerStyle(self.pointLayer, self.props.pointLayer.get('name'), self.props.pointLayer.get('selectedStyle'))
      }
    }
  }
```

**2.** In `modules/map.js`, we will create two new action creators to respond
to changes in the style selection.

Add two new action constants near the top of the file, alongside the existing
`STYLES_*` constants:

```
export const SET_POLYGON_STYLE = 'map/SET_POLYGON_STYLE';
export const SET_POINT_STYLE = 'map/SET_POINT_STYLE';
```

In the default reducer function, add two new cases to the switch statement to
modify the `selectedStyle` property of the specified layer:

```
    case SET_POLYGON_STYLE:
      state = state.setIn(['polygonLayer', 'selectedStyle'], action.payload)
      return state;
    case SET_POINT_STYLE:
      state = state.setIn(['pointLayer', 'selectedStyle'], action.payload)
      return state;
```

At the end of the file, add two new action creators:

```
export const setPolygonStyle = (style) => {
  return dispatch => {
    dispatch({
      type: SET_POLYGON_STYLE,
      payload: style
    });
  }
}

export const setPointStyle = (style) => {
  return dispatch => {
    dispatch({
      type: SET_POINT_STYLE,
      payload: style
    });
  }
}
```

**3.** In `containers/app/App.js`, we will import the new action creators and
bind them to the dispatcher.  They will then be available as "props" which can
be passed down to the SidePanel.  Modify the import from `modules/map` to read
as follows:

```
import { fetchStyles, setPointStyle, setPolygonStyle } from '../../modules/map'
```

Then, modify the `mapDispatchToProps` function at the end of the file to read as follows:

```
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      fetchStyles,
      setPointStyle,
      setPolygonStyle
    },
    dispatch
  )
```

In the JSX for the `render` method, add two new properties to the SidePanel element, to pass the bound action creators down to the SidePanel component:

```
          <SidePanel
            ...
            setPointStyle={this.props.setPointStyle}
            setPolygonStyle={this.props.setPolygonStyle}
          />
```

**4.** In `components/SidePanel.js`, since we are now passing in
`setPointStyle` and `setPolygonStyle` as props, you can remove the two
placeholder methods and instead pass the props down to `SelectStatControl`.
Delete the `setPolygonStyle` and `setPointStyle` methods and change the
`render` method to pass down `{this.props.setPointStyle}` and
`{this.props.setPolygonStyle}` instead of the placeholder methods.  When you're
done, the `SelectStatControl` element in JSX should read as follows:

```
        <SelectStatControl
          pointLayer={this.props.pointLayer}
          polygonLayer={this.props.polygonLayer}
          setPointStyle={this.props.setPointStyle}
          setPolygonStyle={this.props.setPolygonStyle}
        />
```

If we return to our application in the web browser, we should be able to select
a different statistic from the drop-down in the side panel and immediately see
a change to the points or polygons on the map.

#### Showing feature details in the info panel

**1.** In `modules/map.js`, we will create a new state property, and an action
creator to update that property in response to feature selections on the map.

Add a new action constant near the top of the file, alongside the existing
`STYLES_*` constants:

```
export const SET_HIGHLIGHT_FEATURE_PROPS = 'map/SET_HIGHLIGHT_FEATURE_PROPS';
```

In the definition of `initialState`, add a new property `highlightFeatureProps`, and
initialise it to `null`:

```
const initialState = Immutable.fromJS({
  ...,
  highlightFeatureProps: null
})
```

In the default reducer function, add a new case to the switch statement to
modify the `highlightFeatureProps` property when a SET_HIGHLIGHT_FEATURE_PROPS 
action is received.

```
    case SET_HIGHLIGHT_FEATURE_PROPS:
      state = state.set('highlightFeatureProps', Immutable.fromJS(action.payload))
      return state;
```

At the end of the file, add a new action creator:

```
export const setHighlightFeatureProps = (data) => {
  return dispatch => {
    dispatch({
      type: SET_HIGHLIGHT_FEATURE_PROPS,
      payload: data
    });
  }
}
```

**2.** Next, we will import the action `setHighlightFeatureProps` creator and make the 
`highlightFeatureProps` property available to the InfoPanel component.

In `containers/app/App.js`, add `setHighlightFeatureProps` to the action creator import
statement:

```
import { fetchStyles, setPointStyle, setPolygonStyle, setHighlightFeatureProps } from '../../modules/map'
```

In the App class `render` method, add a property to pass `highlightFeatureProps` down
to the SidePanel component, and a property to pass the `setHighlightFeatureProps` action
creator down to OlMap.

```
          <SidePanel
            ...
            highlightFeatureProps={this.props.highlightFeatureProps}
          />
          <OlMap
            ...
            setHighlightFeatureProps={this.props.setHighlightFeatureProps}
          />
```

In `mapStateToProps`, add a mapping for `highlightFeatureProps`:

```
const mapStateToProps = state => ({
  ...,
  highlightFeatureProps: state.map.get('highlightFeatureProps')
})
```

In `mapDispatchToProps`, bind the `setHighlightFeatureProps` action creator:

```
const mapDispatchToProps = dispatch =>
  bindActionCreators(
    {
      ...,
      setHighlightFeatureProps
```

**3.** Now that `highlightFeatureProps` has been passed down to SidePanel as a prop,
we will make it available to InfoPanel.

In `components/SidePanel.js`, in the `render` method, set the
`highlightFeatureProps` property of the `InfoPanel` element to pass down
`highlightFeatureProps`:

```
        <InfoPanel
          ...
          highlightFeatureProps={this.props.highlightFeatureProps}
```

**4.** We will now update the `OlMap` component to dispatch the 
`setHighlightFeatureProps` action when a user clicks on the map.

In `components/OlMap.js`, add the following method to the OlMap component
to handle a single click on the map and call `setHighlightFeatureProps`:

```
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
```

Then, in the `loadMap` method, add the following code to subscribe the
`handleMapOnSingleClick` method to the 'singleclick' event on the map.

```
  loadMap () {
    ...
    self.map.on('singleclick', self.handleMapOnSingleClick, self)
  }
```

Return to the application in the web browser and try clicking on one of the
polygon areas.  You should see the details of the area populated in the side
bar.

**5.** Finally, we'll add the additional statistics that we prepared earlier to the web application so that we can compare them. Open the `modules\map.js` file and modify the `styles` property of the `polygonLayer` object in the `initialState` to include the additional statistics.

```
polygonLayer: {
    name: 'abs_stats_poly',
    workspace: 'workshop',
    selectedStyle: 'median_age_persons_poly',
    styles: [
      {
        id: 'tot_p_p_sq_km_poly',
        displayField: 'tot_p_p_sq_km',
        displayName: 'Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      },
      {
        id: 'tot_p_f_sq_km_poly',
        displayField: 'tot_p_f_sq_km',
        displayName: 'Female Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      },
      {
        id: 'tot_p_m_sq_km_poly',
        displayField: 'tot_p_m_sq_km',
        displayName: 'Male Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      },
      {
        id: 'indigenous_p_tot_p_sq_km_poly',
        displayField: 'indigenous_p_tot_p_sq_km',
        displayName: 'Indigenous Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      },
      {
        id: 'median_age_persons_poly',
        displayField: 'median_age_persons',
        displayName: 'Median Age',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      },
      {
        id: 'median_rent_weekly_poly',
        displayField: 'median_rent_weekly',
        displayName: 'Median Weekly Rent',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      },
      {
        id: 'median_tot_prsnl_inc_weekly_poly',
        displayField: 'median_tot_prsnl_inc_weekly',
        displayName: 'Median Personal Weekly Income',
        workspace: 'workshop',
        templateStyle: 'poly_green'
      }
    ]
  }
```

**6.** Similarly, modify the `pointLayer` object styles in the initialState to include the additional statistics.

```
pointLayer: {
    name: 'abs_stats_point',
    workspace: 'workshop',
    selectedStyle: 'median_tot_prsnl_inc_weekly_point',
    styles: [
      {
        id: 'tot_p_p_sq_km_point',
        displayField: 'tot_p_p_sq_km',
        displayName: 'Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      },
      {
        id: 'tot_p_f_sq_km_point',
        displayField: 'tot_p_f_sq_km',
        displayName: 'Female Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      },
      {
        id: 'tot_p_m_sq_km_point',
        displayField: 'tot_p_m_sq_km',
        displayName: 'Male Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      },
      {
        id: 'indigenous_p_tot_p_sq_km_point',
        displayField: 'indigenous_p_tot_p_sq_km',
        displayName: 'Indigenous Population per sq. km',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      },
      {
        id: 'median_age_persons_point',
        displayField: 'median_age_persons',
        displayName: 'Median Age',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      },
      {
        id: 'median_rent_weekly_point',
        displayField: 'median_rent_weekly',
        displayName: 'Median Weekly Rent',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      },
      {
        id: 'median_tot_prsnl_inc_weekly_point',
        displayField: 'median_tot_prsnl_inc_weekly',
        displayName: 'Median Personal Weekly Income',
        workspace: 'workshop',
        templateStyle: 'point_pink'
      }
    ]
  }
```
***Note***: you can modify the `templateStyle` of any of these styles to use a different published style from geoserver (i.e. ***point_orange***, ***poly_blue***, etc).

If you return to the application in the web browser now you should now see additional statistics in the dropdown menus for comparison. 

This completes the development of the client application. If necessary you can [download](https://s3-ap-southeast-2.amazonaws.com/foss4g-oceania-2018-workshop-resources/client_stage_3.zip) a copy of the `src` directory at this point. 

***

**Previous**: [7.2. Redux and UI](section-7-2-ui.md) | **Up**: [Index](README.md) | **Next**: [7.4. Publish app](section-7-4-publish-app.md)
