/**
 * esdmaps.js v0.0.1
 *
 * A simple JavaScript libary to generate web maps for Excellent Schools
 * Detroit.
 */
(function(root, factory) {
  if (typeof exports !== 'undefined') {
    // @todo: Support node?
    factory(root, exports, null);
  } 
  else {
    root.ESDMaps = factory(root, root.ESDMaps || {}, root.L); 
  }
})(this, function(root, ESDMaps, L) {
  ESDMaps.VERSION = '0.0.1';
  var settings = ESDMaps.settings = {
    altPopupClass: 'esdmaps-alt-popup',
    altPopupOpenClass: 'esdmaps-alt-popup-open'
  };

  // Utility functions, so we don't need jQuery
  
  function forEach(array, fn) {
    for (var i = 0; i < array.length; i++)
      fn(array[i], i);
  }

  function defaults(obj) {
    forEach(Array.prototype.slice.call(arguments, 1), function(source) {
      for (var prop in source) {
        if (obj[prop] === void 0) obj[prop] = source[prop];
      }
    });
    return obj;
  }

  function pick(obj, whitelist) {
    var out = {};
    forEach(whitelist, function(k) {
      if (obj[k]) {
        out[k] = obj[k];
      }
    });
    return out;
  }

  function getJSON(url, success, error) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);

    request.onreadystatechange = function() {
      if (this.readyState === 4){
        if (this.status >= 200 && this.status < 400){
          success(JSON.parse(this.responseText));
        } else {
          if (error) {
            error();
          }
        }
      }
    };

    request.send();
    request = null;
  }

  function elData(el, attrs) {
    var data = {};
    forEach(attrs, function(attr) {
      var name = 'data-' + attr;
      if (el.hasAttribute(name)) {
        data[attr] = el.getAttribute(name);
      }
    });
    return data;
  }

  function addClass(el, className) {
    if (el.classList)
      el.classList.add(className);
    else
      el.className += ' ' + className;
  }

  function removeClass(el, className) {
    if (el.classList)
      el.classList.remove(className);
    else
      el.className = el.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
  }

  // Presets API

  ESDMaps._presets = {};

  var registerPreset = ESDMaps.registerPreset = function(id, options) {
    ESDMaps._presets[id] = options;
  };

  var getPreset = ESDMaps.getPreset = function(id) {
    return ESDMaps._presets[id];
  };

  function initAltPopup(map, options) {
    var altPopup;

    if (typeof options.altPopup === "undefined") {
      altPopup = makeAltPopupEl(); 
      container = map.getContainer();
      container.parentNode.insertBefore(altPopup, container.nextSibling);
    }
    else if (typeof options.altPopup === "string") {
      altPopup = document.querySelector('#' + options.altPopup);
    }
    else {
      // Assume it's an HTMLElement
      altPopup = options.altPopup; 
    }

    if (altPopup) {
      // We wrap this in an if just in case selecting the element by
      // querySelctor failed.
      addClass(altPopup, settings.altPopupClass); 

      map.on('popupopen', function(e) {
        altPopup.innerHTML = e.popup.getContent();
        addClass(altPopup, settings.altPopupOpenClass);
      });

      map.on('popupclose', function(e) {
        altPopup.innerHTML = '';
        removeClass(altPopup, settings.altPopupOpenClass);
      });
    }
  }

  function addPointLayer(map, url, options) {
    getJSON(url, function(data) {
      L.geoJson(data, {
        pointToLayer: L.mapbox.marker.style,
        style: function(feature) { return feature.properties; },
        onEachFeature: function(feature, layer) {
          if (typeof options.popupTemplate === "string") {
            layer.bindPopup(L.mapbox.template(options.popupTemplate, feature.properties));
          }
          else if (typeof options.popupTemplate === "function") {
            layer.bindPopup(options.popupTemplate(feature.properties)); 
          }
        }
      }).addTo(map);
    });

    return map;
  }

  ESDMaps.map = function(element, _, options) {
    options = options || {};
    var preset = getPreset(_);
    var map;
    var container;

    if (!preset) {
      return L.mapbox.map(element, _, options);
    }

    options = defaults(options, pick(preset, ['zoom', 'center', 'popupTemplate', 'pointsUrl']));
    map = L.mapbox.map(element, preset.mapboxId, options);

    initAltPopup(map, options);

    if (options.pointsUrl) {
      addPointLayer(map, options.pointsUrl, options);
    }

    return map;
  };

  function makeAltPopupEl() {
    var el = document.createElement('div');
    el.setAttribute('id', 'esdmaps-alt-popup');
    return el;
  }

  function mapFromElement(el) {
    var data = elData(el, ['preset', 'alt-popup', 'points-url']);

    if (data.preset) {
      ESDMaps.map(el, data.preset, {
        altPopup: data['alt-popup'],
        pointsUrl: data['points-url']
      });

    }
    // @todo: Handle case when there's no preset
  }

  var detectMaps = ESDMaps.detectMaps = function() {
    forEach(document.querySelectorAll('.esdmaps-map'), mapFromElement); 
  };

  // Register presets
 
  // @todo: Update to reflect production MapBox ids and GeoJSON sources
  registerPreset('recommended-schools-k-8-2014', {
    mapboxId: 'ghing.ExcellentSchoolsDetroit',
    center: L.latLng(42.3484, -83.058),
    zoom: 14,
    pointsUrl: '/data/recommended-k-8-schools-2014-spring.json',
    popupTemplate: "<div><h2>{{schoolname}}</h2>" +
      "<p>{{address}}</p>" +
      "<p>{{city}}, {{state}} {{zip}}</p>" +
      "<a href='{{scorecard-url}}' target='_blank'>View Scorecard Profile</a></div>" 
  });

  detectMaps();

  return ESDMaps;
});
