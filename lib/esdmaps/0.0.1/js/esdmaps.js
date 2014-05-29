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
    mapboxId: 'esd.ExcellentSchoolsDetroit',
    altPopupClass: 'esdmaps-alt-popup',
    altPopupOpenClass: 'esdmaps-alt-popup-open',
    baseUrl: "//static.excellentschoolsdetroit.org/libs/esdmaps-js",
    selectedMarkerColor: '#124472'
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
          layer.bindPopup(renderTemplate(options.popupTemplate, feature.properties));

          layer.on('popupopen', function(e) {
            var marker = e.target;
            marker.feature.properties['old-color'] = marker.feature.properties['marker-color'];
            marker.feature.properties['marker-color'] = settings.selectedMarkerColor, 
            marker.setIcon(L.mapbox.marker.icon(marker.feature.properties));
          });

          layer.on('popupclose', function(e) {
            var marker = e.target;
            marker.feature.properties['marker-color'] = marker.feature.properties['old-color'];
            marker.setIcon(L.mapbox.marker.icon(marker.feature.properties));
          });

          if (options.showPopupOnHover) {
            initHoverPopup(layer, options);
          }
        }
      }).addTo(map);
    });

    return map;
  }

  /**
   * Connect event handlers to show different popup content on hover
   * and click.
   *
   * @param layer {L.Layer} - Marker layer
   * @param options.popupTemplate {(string|function)} - Template that will be
   *   used to render the popup content on click.
   * @param [options.hoverPopupTemplate] {(string|function)} - Template that
   *   will be used to render the popup content on hover. If not specified
   *   the normal popup content is used.
   */
  function initHoverPopup(layer, options) {
    layer.on('mouseover', function(e) {
      var popup = e.target.getPopup();
      e.target._hovering = true;
      if (options.hoverPopupTemplate) {
        popup.setContent(renderTemplate(options.hoverPopupTemplate, e.target.feature.properties));
      }
      e.target.openPopup();
      L.DomUtil.addClass(popup._container, 'esdmaps-hover');
    });

    layer.on('mouseout', function(e) {
      var popup;
      if (e.target._hovering) {
        popup = e.target.getPopup();
        e.target._hovering = false;
        L.DomUtil.removeClass(popup._container, 'esdmaps-hover');
        e.target.closePopup();
      }
    });

    layer.on('click', function(e) {
      var popup;

      if (e.target._hovering) {
        popup = e.target.getPopup();
        e.target._hovering = false;
        if (options.hoverPopupTemplate) {
          popup.setContent(renderTemplate(options.popupTemplate, e.target.feature.properties));
        }
        e.target.openPopup();
        L.DomUtil.removeClass(popup._container, 'esdmaps-hover');
      }
    });
  }

  /**
   * Render a template.
   *
   * @param tpl {(string|function}) - A Mustache template string or a template
   *   function.  If a string is provided, the template will be
   *   rendered using L.mapbox.template().
   * @param ctx {object} - An object representing the template
   *   context.  It contains key/value pairs corresponding to values 
   *   referenced in the template.
   * @returns {string} The rendered template.
   */
  function renderTemplate(tpl, ctx) {
    if (typeof tpl === "string") {
      return L.mapbox.template(tpl, ctx);
    }
    else if (typeof tpl === "function") {
      return tpl(ctx);
    }
    else {
      return "";
    }
  }


  ESDMaps.map = function(element, _, options) {
    options = options || {};
    var preset = getPreset(_);
    var map;
    var container;

    if (!preset) {
      map = L.mapbox.map(element, _ || settings.mapboxId, options);
    }
    else {
      options = defaults(options, pick(preset, ['zoom', 'center', 'popupTemplate', 'pointsUrl', 'showPopupOnHover', 'hoverPopupTemplate']));
      map = L.mapbox.map(element, preset.mapboxId, options);
    }

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
    var data = elData(el, ['preset', 'alt-popup', 'points-url', 'zoom', 'center']);
    var centerBits;

    if (data['center']) {
      centerBits = data['center'].split(',');
      data['center'] = L.latLng(parseFloat(centerBits[0]),
                                parseFloat(centerBits[1]));
    }

    ESDMaps.map(el, data.preset, {
      altPopup: data['alt-popup'],
      pointsUrl: data['points-url'],
      zoom: data['zoom'],
      center: data['center']
    });
  }

  var detectMaps = ESDMaps.detectMaps = function() {
    forEach(document.querySelectorAll('.esdmaps-map'), mapFromElement); 
  };

  // Register presets
  registerPreset('recommended-schools-k-8-2014', {
    mapboxId: settings.mapboxId, 
    center: L.latLng(42.3484, -83.058),
    zoom: 13,
    pointsUrl: settings.baseUrl + '/data/recommended-k-8-schools-2014-spring.json',
    popupTemplate: "<div><h2>{{schoolname}}</h2>" +
      "<p>" +
      "{{grades}}<br>" +
      "{{address}}<br>" +
      "Call: {{phone}}<br>" +
      "<a href='{{scorecard-url}}' target='_blank'>See more detail</a>" +
      "</p></div>",
     showPopupOnHover: true,
     hoverPopupTemplate: "<h2>{{schoolname}}</h2>"
  });

  detectMaps();

  return ESDMaps;
});
