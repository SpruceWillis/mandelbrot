/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var GameView = __webpack_require__(1);
	
	document.addEventListener("DOMContentLoaded", function(){
	  var canvas = document.getElementById("root");
	  var context = canvas.getContext("2d");
	  var view = new GameView(context);
	  view.start();
	})


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var Mandelbrot  = __webpack_require__(2);
	
	var GameView = function(context){
	  this.context = context;
	  this.mandelbrot = mandelbrot = new Mandelbrot(this.context.canvas.width,
	    this.context.canvas.height);
	  this.maxIterations = 1;
	}
	
	GameView.prototype.start = function(){
	  var that = this;
	  var defaultColor = -1; //greyscale
	  this.timeout = setInterval(function(){
	    if (that.maxIterations < 10){
	      that.draw(that.maxIterations, {color: defaultColor, smooth: false});
	      that.maxIterations++;
	    } else {
	      clearInterval(that.timeout);
	    }
	  }, 100);
	  this.addDrawListener();
	  this.addCanvasListener();
	};
	
	GameView.prototype.addDrawListener = function () {
	  var that = this;
	  document.getElementById("draw").addEventListener("click", function(){
	    var value = parseInt(document.getElementById("amountInput").value);
	    var options = {};
	    options["color"] = parseInt(document.getElementById("color").value);
	    options["smooth"] = document.getElementById("smooth").checked;
	    clearInterval(that.timeout);
	    that.draw(value, options);
	  })
	};
	
	GameView.prototype.addCanvasListener = function () {
	  var that = this;
	  document.getElementById("root").addEventListener("click", function(e){
	    var x = e.clientX;
	    var y = e.clientY;
	    that.mandelbrot.zoom(x,y, that.context);
	  });
	};
	
	GameView.prototype.draw = function(maxIterations, options){
	  var data = this.mandelbrot.draw(maxIterations, this.context, options);
	  var canvas = this.context.canvas;
	  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
	  this.context.putImageData(data, 0,0);
	};
	
	module.exports = GameView;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Colors = __webpack_require__(3);
	
	var Mandelbrot = function(width, height, xMin, xMax, yMin, yMax){
	  this.setup(width, height, xMin, xMax, yMin, yMax)
	  this.zoomed = false;
	};
	
	Mandelbrot.prototype.setup = function (width, height, xMin, xMax, yMin, yMax) {
	  xMin = xMin || -2.5;
	  xMax = xMax || 1;
	  yMin = yMin || -1;
	  yMax = yMax || 1;
	  var xScale = (xMax - xMin)/width;
	  var xOffset = xMin;
	  var yScale = (yMin - yMax)/height;
	  var yOffset = yMax;
	  this.xCoords = [];
	  this.yCoords = [];
	  for (var i = 0; i < width; i++) {
	    var x = (xScale * i) + xOffset;
	    this.xCoords.push(x);
	  }
	  for (var j = 0; j < height; j++) {
	    var y = yScale * j + yOffset;
	    this.yCoords.push(y);
	  }
	};
	
	Mandelbrot.prototype.generate = function (maxIterations, option) {
	  var iterCount = [];
	  for (var i = 0; i < this.yCoords.length; i++) {
	    var row = [];
	    for (var j = 0; j < this.xCoords.length; j++){
	      var iter = this.iterCount(this.xCoords[j],this.yCoords[i], maxIterations, option);
	      row.push(iter);
	      this.min = Math.min(this.min, iter);
	    }
	    iterCount.push(row);
	  }
	  return iterCount;
	};
	
	Mandelbrot.prototype.iterCount = function (x0, y0, maxIterations, smooth) {
	  //optimization: check if within main sections
	  if (maxIterations > 5){
	    var y2 = y0 * y0;
	    var q = (x0 - .25)*(x0 - .25) + y2;
	    if (q * (q + x0 - .25) < y2/4 || (x0 + 1) * (x0+1) + y2 < (1/16)){
	      return maxIterations;
	    }
	  }
	  //using a larger value on the upper bound gives better resolution of early details
	  //but completely wrecks lower iteration numbers
	
	  var UPPERBOUND = Math.pow(2,8);
	  var xTemp = x = y = 0;
	  var iteration = 0;
	  while (iteration < maxIterations && x*x + y*y < UPPERBOUND){
	    iteration += 1;
	    xTemp = x*x - y*y + x0;
	    yTemp = 2*x*y + y0;
	    if (xTemp === x && yTemp === y) break;
	    x = xTemp;
	    y = yTemp;
	  }
	
	  if (smooth && iteration < maxIterations){
	    var log = Math.log10(x*x + y*y) /2;
	    var nu = Math.log10(log / Math.log10(2)) / Math.log10(2);
	    iteration = iteration + 1 - nu;
	  }
	
	  return iteration;
	};
	
	
	Mandelbrot.prototype.draw = function (maxIterations, context, options) {
	  this.max = maxIterations;
	  this.min = maxIterations;
	  if (options["smooth"] === undefined){
	    options["smooth"] = true;
	  }
	  if (options["color"] === undefined){
	    options["color"] = -1;
	  }
	  var iterations = this.generate(maxIterations, options["smooth"]);
	  return this.colorize(iterations, context, options["color"]);
	};
	
	Mandelbrot.prototype.colorize = function(iterations, context, colorOption){
	  var imgData = context.createImageData(context.canvas.width, context.canvas.height);
	  var data = imgData.data;
	  //normalize colors
	  var coord = 0;
	  // iterate over the results and map the color to the appropriate pixel
	  for (var i = 0, rowLength = iterations.length; i < rowLength; i++) {
	    for (var j = 0, colLength = iterations[j].length; j < colLength; j++){
	      var colors = Colors.color(this.max, this.min, iterations[i][j], colorOption);
	      data[coord] = colors[0];
	      data[coord + 1] = colors[1];
	      data[coord + 2] = colors[2];
	      data[coord + 3] = colors[3];
	      coord += 4;
	    }
	  }
	  return imgData;
	}
	
	
	
	Mandelbrot.prototype.zoom = function (x,y, context) {
	  var width = context.canvas.width;
	  var height = context.canvas.height;
	  if (this.zoomed){
	    //reset bounding box to original coordinates
	    var resetCoords = [-2.5, 1, -1, 1];
	    this.setup(width, height, resetCoords[0], resetCoords[1], resetCoords[2], resetCoords[3]);
	    this.zoomed = false;
	  } else {
	    //calculate new viewing window based on x and y
	    //first get coordinates based on canvas
	    //attempt to maintain aspect ratio
	    // if (x < widt)
	    var xcMin = Math.max(x - 100, 0);
	    var xcMax = Math.min(x + 200, width - 1);
	    var ycMin = Math.max(y - 100, 0);
	    var ycMax = Math.min(y + 100, height -1);
	    console.log([xcMin, xcMax, ycMin, ycMax]);
	    console.log("xdiff: " + (xcMax - xcMin));
	    console.log("ydiff: " + (ycMax - ycMin));
	  }
	};
	
	
	
	window.Mandelbrot = Mandelbrot;
	
	module.exports = Mandelbrot;


/***/ },
/* 3 */
/***/ function(module, exports) {

	var Colors = {
	  greyscale: function (max, min, value) {
	    var alpha = 255; // opaque
	    if (max === min){
	      return [255,255,255, alpha];
	    } else {
	      var rgbVal = 255 * (1- (value)/(max - min));
	      return [rgbVal, rgbVal, rgbVal, alpha];
	    }
	  },
	
	  invertGrey: function(max, min, value){
	    var alpha = 255;
	    if (max === min){
	      return [0, 0, 0, alpha];
	    } else {
	      var rgbVal = 255 * (value)/(max - min);
	      return [rgbVal, rgbVal, rgbVal, alpha];
	    }
	  },
	
	  interpolate: function (arr1, arr2, percent) {
	    if (arr1.length != arr2.length){
	      return [];
	    }
	    return arr1.map(function(el, ind){
	      return el + percent * (arr2[ind] - el);
	    })
	
	  },
	
	
	
	  colors: [ // -1 greyscale, -2 inverted greyscale
	    [ [247,22,30], //0 - blue
	      [22,30,247],
	      [30,247,22] ],
	    [ [247,22,30], //1 - green
	      [30,247,22],
	      [22,30,247] ]
	
	  ],
	
	  color: function (max, min, value, colorSet) {
	    switch (colorSet) {
	      case -2:
	        return this.invertGrey(max, min, value);
	        break;
	      case -1:
	        return this.greyscale(max, min, value);
	        break;
	      default:
	        colors = this.colors[colorSet];
	        if (colors === undefined){
	          return this.greyscale(max, min, value);
	        }
	    }
	    alpha = 255;
	    if (max === min){
	      colors[0].push(alpha);
	      return colors[0];
	    }
	    var difference = (max - min);
	    //interpolate color based on which half of the color it falls under
	    if (value >= difference/2){
	      var arr1 = colors[0];
	      var arr2 = colors[1];
	    } else {
	      var arr1 = colors[1];
	      var arr2 = colors[2];
	    }
	    var results = this.interpolate(arr1, arr2, value/difference);
	    results.push(alpha);
	    return results;
	  }
	}
	
	module.exports = Colors;


/***/ }
/******/ ]);
//# sourceMappingURL=bundle.js.map