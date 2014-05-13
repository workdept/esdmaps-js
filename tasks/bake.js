var Tabletop = require('tabletop');
var fs = require('fs');

module.exports = function(grunt) {
  function getCoordinates(data) {
    var coordinates = [];
    if (data.long) {
      coordinates.push(parseFloat(data.long)); 
    }
    else if (data.longitude) {
      coordinates.push(parseFloat(data.longitude));
    }
    else {
      return null;
    }

    if (data.lat) {
      coordinates.push(parseFloat(data.lat));
    }
    else if (data.latitude) {
      coordinates.push(parseFloat(data.latitude));
    }
    else {
      return null;
    }

    return coordinates;
  }

  function getProperties(data, propertyNames) {
    var properties = {};
    propertyNames.forEach(function(name) {
      var val = data[name];
      if (val) {
        properties[name] = val;
      }
    });
    return properties;
  }

  function getFeature(data, options) {
    var coordinates = getCoordinates(data);
    var properties;
    if (!coordinates) {
      return;
    }

    properties = getProperties(data, options.properties);
    properties['marker-size'] = 'small';
    properties['marker-color'] = data.hexcolor;

    return {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: coordinates
      },
      properties: properties
    };
  }

  function createGeoJSON(data, options) {
    var geoJSON = {
      type: "FeatureCollection",
      features: []
    };
    data.forEach(function(item) {
      var feature = getFeature(item, options);
      if (feature) {
        geoJSON.features.push(feature);
      }
    });
    return geoJSON;
  }

  function getSchools(spreadsheetId, options, callback) {
    Tabletop.init({
      key: spreadsheetId,
      callback: function(data, tabletop) {
        var err = null;
        var warnings = null;
        var geoJSON = createGeoJSON(data, options);
        callback(err, warnings, geoJSON);
      },
      simpleSheet: true
    });
  }

  function writeJSON(jsonData, outputFile, done, opts) {
    fs.writeFile(outputFile, jsonData, function(err) {
      if (err) {
        grunt.fatal(err);
      }
      else {
        done();
      }
    });
  }

  grunt.registerMultiTask('bakegeojson', 'Bake school data from Google Spreadsheet to a GeoJSON file.', function() {
    var done = this.async();
    var spreadsheetId = this.data.spreadsheetId;
    var options = {
      properties: this.data.properties
    };
    var outputFile = this.data.output;

    getSchools(spreadsheetId, options, function(err, warnings, data) {
      var jsons = JSON.stringify(data);
      writeJSON(jsons, outputFile, done);
    });
  });
};
