# 0 to 100 on AWS – Building a full stack web mapping application with PostGIS, GeoServer, OpenLayers and ReactJS

#### FOSS4G SotM Oceania - Afternoon Workshop #1 - 20th November 2018

## 7. Create a ReactJS and OpenLayers Web Mapping Application

We now have all of the server-side components of our stack deployed and we're
ready to start building our web application.

The concept is an interactive app that lets you visualise, query and compare
different ABS statistics across Victoria. We'll build it using the following
key technologies.

| Technology / Library | Description | 
| --- | --- |
| [ReactJS](https://reactjs.org/) | Provides the JavaScript framework for building a single page application |
| [Redux](https://Redux.js.org/) and [ImmutableJS](http://facebook.github.io/immutable-js/) | Provides the framework for managing application state |
| [Material UI]() | Provides a set of React UI components based on Google's Material Design |
| [OpenLayers](https://openlayers.org/) | Provides the mapping API |
| [OL Mapbox Style](https://github.com/boundlessgeo/ol-mapbox-style) | Style vector tile layers in OpenLayers |

Each stage of the application build is detailed in its own section:

* [7.1. Skeleton React app](section-7-1-skeleton-app.md)
* [7.2. Redux and UI control](section-7-2-ui.md)
* [7.3. Finish the app](section-7-3-finish-app.md)
* [7.4. Publish the app to S3](section-7-4-publish-app.md)

***

**Previous**: [6. Style vector tiles](section-6-style.md) | **Up**: [Index](README.md) | **Next**: [7.1. Skeleton React app](section-7-1-skeleton-app.md)
