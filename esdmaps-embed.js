(function(window) {
  var MAPBOX_JS = '//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.js';
  var MAPBOX_CSS = '//api.tiles.mapbox.com/mapbox.js/v1.6.2/mapbox.css';
  var ESDMAPS_JS = thisURL().replace('esdmaps-embed', 'esdmaps');

  function getRemote(url, el, attr, callback) {
    var done = false;
    var proto = window.location.protocol === 'file:' ? 'http:' : '';
    el[attr] = proto + url;
    // Attach handlers for all browsers
    el.onload = el.onreadystatechange = function() {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        done = true;
        
        if (callback) {
          callback();
        }
        
        el.onload = el.onreadystatechange = null;
      }
    };

    document.getElementsByTagName('head')[0].appendChild(el);
  }

  function getScript(url, callback) {
    var script = document.createElement('script'); 
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
    el.rel = 'stylesheet';
    getRemote(url, el, 'href', callback);
  }

  function getESDMapsScript() {
    if (typeof ESDMaps == 'undefined') {
      getScript(ESDMAPS_JS);
    }
  }

  /**
   * Get the url of this script 
   */
  function thisURL() {
    var scripts = document.getElementsByTagName('script');
    
    for (var i = 0; i < scripts.length; i++) {
      s = scripts[i];

      if (s.src && s.src.match(/esdmaps-embed\.js$/)) {
        return s.src;
      }
    }

    return null;
  }

  if (!hasStylesheet(MAPBOX_CSS)) {
    getStylesheet(MAPBOX_CSS);
  }

  if (typeof L == 'undefined' || typeof L.mapbox == 'undefined') {
    getScript(MAPBOX_JS, getESDMapsScript); 
  }
  else {
    getESDMapsScript();
  }
})(window, document);
