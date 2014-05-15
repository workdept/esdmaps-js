(function(window) {
  MAPBOX_JS = '//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.js';
  MAPBOX_CSS = '//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.css';
  ESDMAPS_JS = '';

  function getRemote(url, el, attr, callback) {
    var done = false;
    var proto = window.location.protocol === 'file:' ? 'http:' : '';
    el[attr] = proto + url;
    // Attach handlers for all browsers
    el.onload = script.onreadystatechange = function() {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
        
        callback();
        
        el.onload = script.onreadystatechange = null;
      }
    };

    document.getElementsByTagName('head')[0].appendChild(el);
  }

  function getScript(url, callback) {
    var script = root.document.createElement('script'); 
    getRemote(url, script, 'src', callback);
  }

  function hasStylesheet(url) {
    var links = document.getElementsByTagName('link');
    for (var i = 0; i < links.length; i++) {
      href = links[i].getAttribute('href');
      if (href.indexOf(url) > -1) {
        return true;
      }
    }
    return false;
  }

  function getStylesheet(url, callback) {
    var el = document.createElement('link');
    getRemote(url, el, 'href', callback);
  }

  if (typeof L == 'undefined' || typeof L.mapbox == 'undefined') {
    getScript(MAPBOX_JS);
  }

  if (!hasStylesheet(MAPBOX_CSS)) {
    getStylesheet(MAPBOX_CSS);
  }

  if (typeof ESDMaps == 'undefined') {
    getScript(ESDMAPS_JS);
  }
})(window, document);
