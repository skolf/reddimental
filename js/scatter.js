// scatter.js 1.0.0
//
// a simple scatter chart using d3.
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
    global.scatter = factory({}, global, global.$, global.d3);
  }

})(this, function(scatter, global, $, d3) {

  // save the element for reference and initialize
  function Scatter(el, options) {
    this.o  = $.extend({}, scatter.defaults, options);
    this.el = el;
    this.init();
    return this;
  };

  // convenience accessor
  scatter         = Scatter.prototype;
  scatter.version = '1.0.0';
  scatter.defaults = {
    values: [],
    width:  null,
    height: null,
    margin: {
    	top:    20,
    	right:  20,
    	bottom: 30,
    	left:   55
    },
    aspect: .75,
    yAxisTicks: 3
  };

  // setup d3 components
  scatter.init = function() {
  	this.setDimensions();
  	
    this.svg = d3.select(this.el)
                 .append("svg")
								 .attr("width",  this.width + this.o.margin.right + this.o.margin.left)
								 .attr("height", this.height + this.o.margin.top + this.o.margin.bottom)
								 .attr("class", "scatter");

		this.container = this.svg.append("g")
                             .attr("transform", "translate(" + this.o.margin.left + "," + this.o.margin.top + ")");

		this.xAxis = this.container.append("g")
															 .attr("class", "x axis");

		this.xAxisLabel = this.xAxis.append("text")
																.attr("class", "label")
																.attr("x", this.width)
																.attr("y", -6)
																.style("text-anchor", "end")
																.text("Sentiment");
															 
		this.yAxis = this.container.append("g")
															 .attr("class", "y axis");
		
	  this.yAxisLabel = this.yAxis.append("text")
																.attr("class", "label")
																.attr("transform", "rotate(-90)")
																.attr("y", 6)
																.attr("dy", ".71em")
																.style("text-anchor", "end")
																.text("Points");
															 
		this.renderAxes();	
		
	  this.resizeTimer = null;
	  $(window).on('resize', this.resizeQueuer());
  };

  // set the widget dimensions based on the element
  scatter.setDimensions = function() {
  	this.width  = (this.o.width  || $(this.el).width()) - this.o.margin.left - this.o.margin.right;
    this.height = (this.o.height || this.width*this.o.aspect) - this.o.margin.top - this.o.margin.bottom;
    this.x      = d3.scale.linear().domain([-5, 5]).range([0, this.width]);
		this.y      = d3.scale.linear().domain([0, this.maxY || 0]).range([this.height, 0]);
  };

  // returns a function that debounces resizing with a delay
  scatter.resizeQueuer = function() {
  	var that = this;
  	return function() {
  	  that.resizeTimer = that.resizeTimer || setTimeout(that.resizer(), 20);
  	}
  };

  // returns a function that recalculates dimensions and redraws
  scatter.resizer = function() {
  	var that = this,
  			x    = this.x,
  			y    = this.y;
  	return function() {
			that.resizeTimer = null;
			that.setDimensions();
			that.svg.attr("width",  that.width + that.o.margin.right + that.o.margin.left);
		  that.svg.attr("height", that.height + that.o.margin.top + that.o.margin.bottom);
		  that.renderAxes();
			that.container.selectAll(".dot")
										.attr("cx", function(d) { return x(d.sentiment); })
										.attr("cy", function(d) { return y(d.score); })
		}
  };

  // update data
  scatter.update = function(data) {
  	this.o.values = data.values || this.o.values;
  	this.maxY     = d3.max(this.o.values, function(d) { return d.score; });
  	this.setDimensions();
  	this.renderAxes();
    this.renderDots();
  };
  
  // render both axes
  scatter.renderAxes = function() {
  	var xA = d3.svg.axis()
									 .scale(this.x)
									 .orient("bottom")
									 .ticks(3)
									 .tickValues([-3,0,3])
									 .tickFormat(function(t) {
										 if(t<0)
											 return 'negative';
										 if(t>0)
											 return 'positive';
										 return 'neutral';
									 }),
				yA = d3.svg.axis()
									 .scale(this.y)
									 .orient("left")
									 .ticks(this.o.yAxisTicks)
									 .tickFormat(function(t) { return t.toAbbr(1); });
	  
	  this.xAxis.attr("transform", "translate(0," + this.height + ")")
							.call(xA);

		this.xAxisLabel.attr("x", this.width);
							
		this.yAxis.call(yA);
  };
  
  // draw the chart's dots
  scatter.renderDots = function() {
  	var x     = this.x,
  	    y     = this.y,
  			dots  = this.container.selectAll(".dot").data(this.o.values),
  			color = function(d) {
				  if(d.sentiment>0)
						return 'rgba(0,160,0,0.8)';
					if(d.sentiment<0)
						return 'rgba(160,0,0,0.8)';
					return 'rgba(46, 112, 173, 0.8)';
				};
									
		dots.enter()
				.append("circle")
				.attr("class", "dot")
				.attr("r", 3.5)
				.attr("cx", function(d) { return x(d.sentiment); })
				.attr("cy", function(d) { return y(d.score); })
				.style("fill", color)
				.each(function(d) { 
					this._cX = d.sentiment;
					this._cY = d.score;
				});
				
		dots.transition()
				.duration(750)
				.style("fill", color)
				.attrTween("cx", function(d) {
				  var interpolate = d3.interpolate(this._cX, d.sentiment);
					this._cX = interpolate(0);
					return function(t) { return x(interpolate(t)); }
				})
				.attrTween("cy", function(d) {
				  var interpolate = d3.interpolate(this._cY, d.score);
					this._cY = interpolate(0);
					return function(t) { return y(interpolate(t)); }
				});
  };

  // export as a jQuery plugin
  $.fn.scatter = function(options) {
    return this.each(function() {
      $(this).data('scatter') || $(this).data('scatter', new Scatter(this, options));
    });
  };
  $.scatter = scatter;

  return scatter;
});
