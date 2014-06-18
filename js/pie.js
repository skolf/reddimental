// pie.js 1.0.0
//
// a simple pie chart using d3.
(function(global, factory) {

  // define using AMD if possible
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'd3', 'exports'], function($, d3, exports) {
      factory(exports, global, $, d3);
    });
  // define for CommonJS
  } else if (typeof exports !== 'undefined') {
    var $  = require('jquery'),
        d3 = require('d3');
    factory(exports, global, $, d3);
  // define as a browser global
  } else {
    global.pie = factory({}, global, global.$, global.d3);
  }

})(this, function(pie, global, $, d3) {

  // save the element for reference and initialize
  function Pie(el, options) {
    this.o  = $.extend({}, pie.defaults, options);
    this.el = el;
    this.init();
    return this;
  };

  // convenience accessor
  pie         = Pie.prototype;
  pie.version = '1.0.0';
  pie.defaults = {
    groups: [],
    colors: [],
    values: [],
    width:  null,
    height: null,
    innerRadius: .85,
    padding:     10,
    label: '',
    aspect: .75
  };

  // setup d3 components
  pie.init = function() {
    this.setDimensions();

    this.color = d3.scale
                   .ordinal()
                   .domain(this.o.groups)
                   .range(this.o.colors);

    this.svg = d3.select(this.el)
                 .append("svg")
                 .attr("width",  this.width)
                 .attr("height", this.height);

    this.container = this.svg.append("g")
                             .attr("transform", "translate(" + this.width / 2 + "," + this.height / 2 + ")");

    this.chart = d3.layout
                   .pie()
                   .value(function(d) { return d; })
                   .sort(null);

    this.arc = this.makeArc();

    this.renderArcs();

    this.label = d3.select(this.el)
                   .append("div")
                   .attr("class", "wdg-label-center");
    this.renderLabel();

    this.resizeTimer = null;
    $(window).on('resize', this.resizeQueuer());
  };

  // set the widget dimensions based on the element
  pie.setDimensions = function() {
    this.width  = this.o.width  || $(this.el).width();
    this.height = this.o.height || this.width*this.o.aspect;
    this.radius = Math.min(this.width, this.height) / 2;
  };

  // create a new arc layout
  pie.makeArc = function() {
    return d3.svg.arc()
                 .outerRadius(this.radius - this.o.padding)
                 .innerRadius(this.radius * this.o.innerRadius);
  };

  // returns a function that debounces resizing with a delay
  pie.resizeQueuer = function() {
    var that = this;
    return function() {
      that.resizeTimer = that.resizeTimer || setTimeout(that.resizer(), 20);
    }
  };

  // returns a function that recalculates dimensions and redraws
  pie.resizer = function() {
    var that = this;
    return function() {
      that.resizeTimer = null;
      that.setDimensions();
      that.svg.attr("width", that.width);
      that.svg.attr("height", that.height);
      that.container.attr("transform", "translate(" + that.width / 2 + "," + that.height / 2 + ")");
      that.update({arc: that.makeArc()});
      that.renderLabel();
    }
  };

  // update data
  pie.update = function(data) {
    if(data.values || data.arc) {
      this.arc      = data.arc    || this.arc;
      this.o.values = data.values || this.o.values;
      this.renderArcs();
    }
    if(data.label) {
      this.o.label = data.label;
      this.renderLabel();
    }
  };

  // draw the chart's arcs
  pie.renderArcs = function() {
    var color = this.color,
        arc   = this.arc,
        arcs  = this.container.selectAll("path").data(this.chart(this.o.values || []));

    arcs.enter()
        .append("path")
        .attr("fill", function(d, i) { return color(i); })
        .attr("d", arc)
        .each(function(d) { this._current = d; });

    arcs.transition()
        .duration(750)
        .attrTween("d", function(d) {
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function(t) {
            return arc(interpolate(t));
          }
        });
  };

  // render the center label, output multiple lines if an array is provided
  pie.renderLabel = function() {
    var l = this.o.label.join ? this.o.label.join('</div><div>') : this.o.label,
        t = null;
    this.label.html('<div>'+l+'</div>');

    t = this.height/2 - parseInt(this.label.style('height'))/2;
    this.label.style('top', t+'px');
  };

  // export as a jQuery plugin
  $.fn.pie = function(options) {
    return this.each(function() {
      $(this).data('pie') || $(this).data('pie', new Pie(this, options));
    });
  };
  $.pie = pie;

  return pie;
});
