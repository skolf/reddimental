// harvester.js 1.0.0
//
// a simple jsonp harvesting engine
(function(global, factory) {

  // define using AMD if possible
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'exports'], function($, exports) {
      factory(exports, global, $);
    });
  // define for CommonJS
  } else if (typeof exports !== 'undefined') {
    var $ = require('jquery');
    factory(exports, global, $);
  // define as a browser global
  } else {
    global.harvester = factory({}, global, global.$);
  }

})(this, function(harvester, global, $) {

  harvester.version = '1.0.0';
  harvester.defaults = {
    url:   "http://reddit.com/.json",
    rate:  30,
    limit: 100,
    load:  null
  };

  // run
  harvester.run = function(options) {
    if(!running) {
      harvester.o = $.extend({}, harvester.defaults, options);
      running = true;
      _harvest();
    }
  };

  // stop
  harvester.stop = function() {
    running = false;
    timer && clearTimeout(timer) && (timer=null);
  };

  // for periodic polling
  var running = false,
      timer   = null,

  // load posts from the source
  _harvest = function() {
    $.getJSON(_composeUrl(), _handleResults);
  },

  // return the target url with serialized query parameters
  _composeUrl = function() {
    return harvester.o.url + '?' + ['jsonp=?', 'limit='+harvester.o.limit].join('&');
  },

  // process results from the response
  _handleResults = function(r) {
    harvester.o.load && harvester.o.load.call(this, r && r.data && r.data.children || []);
    running && harvester.o.rate && (timer=setTimeout(_harvest, harvester.o.rate*1000));
  };

  return harvester;
});
