# esdmaps.js

A JavaScript library for creating web maps for [Excellent Schools Detroit](http://www.excellentschoolsdetroit.org/en).

This leverages [Mapbox.js](https://www.mapbox.com/mapbox.js/), which is based on [Leaflet](http://leafletjs.com/). 

## Usage 

```html
<html>
    <head>
        <title>esdmaps.js example</title>
        <link href="//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.css" rel="stylesheet">
        <link href="esdmaps.css" rel="stylesheet">
        <style>
          body { margin:0; padding:0; }
          #map { position:absolute; top:0; bottom:0; width:100%; } 
        </style>
    </head>

    <body>
        <div id="map" class="esdmaps-map" data-preset="recommended-schools-k-8-2014"></div>
        <script src="//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.js"></script> 
        <script src="esdmaps.js"></script>
    </body>
</html>
```

### Dependency bootstrapping version

In a situation where users might have trouble remembering to link to the dependencies, the script ``esdmaps-embed.js`` can be used instead.  This adds the Mapbox.js Javascript and CSS to the page and loads the ``esdmaps.js`` script. 

```html
<html>
    <head>
        <title>esdmaps.js example</title>
        <style>
          body { margin:0; padding:0; }
          #map { position:absolute; top:0; bottom:0; width:100%; } 
        </style>
    </head>

    <body>
        <div id="map" class="esdmaps-map" data-preset="recommended-schools-k-8-2014"></div>
        <script src="esdmaps-embed.js"></script>
    </body>
</html>
```

## Data attributes

You can create maps purely through the markup API without writing any JavaScript.  This is the first-case API for esdmaps.js.

To create a map, create a ``<div>`` element that will act as the map container and configure the map using various ``data-`` attributes.

The container element needs to have a class of ``esdmaps-map`` to be detected and converted to a map.

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

### center

**Data attribute**: data-center

L.latLng object representing the initial center of the map.  When
specified as a data attribute, specify this option as a
comma-separated string:

```
<div id="map" class="esdmaps-map" data-preset="recommended-schools-k-8-2014" data-points-url="/data/recommended-k-8-schools-2014-spring.json" data-center="42.43686276,-83.1611874" data-zoom="15"></div>
```

### zoom

**Data attribute**: zoom

Integer representing the initial zoom level of the map.

## Preset Options

### popupTemplate

A string representing a Mustache template, or a template function that takes a context object as an argument, for the popup contents.  This template will be rendered with the feature properties from the GeoJSON as the template context.

### popupOnHover

True if popups should be shown on hover as well as click.

### hoverPopupTemplate

A string representing a Mustache template, or a template function that takes a context object as an argument, for the hover popup contents.  This template will be rendered with the feature properties from the GeoJSON as the template context.

If this is not specified, the normal popup content is shown on hover.
