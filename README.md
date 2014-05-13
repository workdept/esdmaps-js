# esdmaps.js

A JavaScript library for creating web maps for [Excellent Schools Detroit](http://www.excellentschoolsdetroit.org/en).

This leverages [Mapbox.js](https://www.mapbox.com/mapbox.js/), which is based on [Leaflet](http://leafletjs.com/). 

## Data attributes

You can create maps purely through the markup API without writing any JavaScript.  This is the first-case API for esdmaps.js.

To create a map, include a ``<div>`` 

## Programmatic API

### ESDMaps.map(element, presetId|id|url|tilejson, options)

Returns an instance of [L.mapbox.Map](https://www.mapbox.com/mapbox.js/api/v1.6.2/l-mapbox-map/#section-l-mapbox-map) with a point layer initialized. 

## Options

### presetId

**Data attribute**: preset 

A string identifying a predefined map.

These options can be overridden by explcitly specifying other options.

Available presets:

* **recommended-schools-k-8-2014** - Spring 2014 Recommended K-8 Schools

### altPopup

**Data attribute**: alt-popup

String containing an ID or HTMLElement object for the element that will receive popup window information.

When a popup is opened, in addition to the regular Leaflet popups, the popup contents will be written to this element.  

This allows for a better display of popup information on mobile devices.  You can use CSS to show or hide the different popup elements.

If nothing is specified for this option, a ``<div>`` element with an id of ``esdmaps-alt-popup`` will be created as the next sibling to the map container element.

### pointsUrl

**Data attribute**: points-url

URL of GeoJSON source containing point data.
