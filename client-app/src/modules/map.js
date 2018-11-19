import fetch from 'isomorphic-fetch'
import Immutable from 'immutable'

export const STYLES_REQUESTED = 'map/STYLES_REQUESTED';
export const STYLES_RECEIVED = 'map/STYLES_RECEIVED';
export const STYLES_ERROR = 'map/STYLES_ERROR';
export const SET_HIGHLIGHT_FEATURE_PROPS = 'map/SET_HIGHLIGHT_FEATURE_PROPS';
export const SET_POLYGON_STYLE = 'map/SET_POLYGON_STYLE';
export const SET_POINT_STYLE = 'map/SET_POINT_STYLE';

const initialState = Immutable.fromJS({
  baseGeoserverUrl: process.env.REACT_APP_BASE_GEOSERVER_URL,
  mapOptions: {
    center: [16137312, -4553696],
    zoom: 11
  },
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
  },
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
  },
  isRequestingStyles: false,
  mbStyles: null,
  highlightFeatureProps: null
})

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
    case SET_HIGHLIGHT_FEATURE_PROPS:
      state = state.set('highlightFeatureProps', Immutable.fromJS(action.payload))
      return state;
    case SET_POLYGON_STYLE:
      state = state.setIn(['polygonLayer', 'selectedStyle'], action.payload)
      return state;
    case SET_POINT_STYLE:
      state = state.setIn(['pointLayer', 'selectedStyle'], action.payload)
      return state;
    default:
      return state;
  }
};

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

export const setHighlightFeatureProps = (data) => {
  return dispatch => {
    dispatch({
      type: SET_HIGHLIGHT_FEATURE_PROPS,
      payload: data
    });
  }
}

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