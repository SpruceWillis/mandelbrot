/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

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
	  this.addDrawListener();
	  var that = this;
	  this.timeout = setInterval(function(){
	    if (that.maxIterations < 50){
	      that.draw(that.maxIterations);
	      that.maxIterations++;
	    } else {
	      clearInterval(that.timeout);
	    }
	  }, 100);

	};

	GameView.prototype.addDrawListener = function () {
	  var that = this;
	  document.getElementById("draw").addEventListener("click", function(){
	    var value = document.getElementById("amountInput").value;
	    // debugger;
	    that.draw(parseInt(value));
	  })
	};

	GameView.prototype.draw = function(maxIterations){
	  var data = this.mandelbrot.draw(maxIterations, this.context);
	  var canvas = this.context.canvas;
	  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
	  this.context.putImageData(data, 0,0);
	};

	module.exports = GameView;


/***/ },
/* 2 */
/***/ function(module, exports) {

	var Mandelbrot = function(width, height){
	  // scale each pixel from x in [-2.5, 1]
	  // y in [-1, 1]
	  var xScale = 3.5/width;
	  var xOffset = -2.5;
	  var yScale = -2/height;
	  var yOffset = 1;
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
	  this.frequency = {};
	};

	Mandelbrot.prototype.generate = function (maxIterations) {
	  var iterCount = [];
	  for (var i = 0; i < this.yCoords.length; i++) {
	    var row = [];
	    for (var j = 0; j < this.xCoords.length; j++){
	      row.push(this.iterCount(this.xCoords[j],this.yCoords[i], maxIterations));
	    }
	    iterCount.push(row);
	  }
	  return iterCount;
	};

	Mandelbrot.prototype.iterCount = function (x0, y0, maxIterations) {
	  //optimization: check if within main sections
	  if (maxIterations > 3){
	    var y2 = y0 * y0;
	    var q = (x0 - .25)*(x0 - .25) + y2;
	    if (q * (q + x0 - .25) < y2/4 || (x0 + 1) * (x0+1) + y2 < (1/16)){
	      return maxIterations;
	    }
	  }

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
	  if (!this.frequency[iteration]){
	    this.frequency[iteration] = 1;
	  } else {
	    this.frequency[iteration] += 1;
	  }
	  return iteration;
	};


	Mandelbrot.prototype.draw = function (maxIterations, context) {
	  var iterations = this.generate(maxIterations);
	  var width = context.canvas.width;
	  var height = context.canvas.height;
	  return this.colorize(iterations, context,{});
	};

	Mandelbrot.prototype.colorize = function(iterations, context, options){
	  if (options["color"] === "color"){
	    var colorFunc = this.colors;
	  } else {
	    colorFunc = this.greyscale;
	  }
	  var keys = Object.keys(this.frequency).map(function(el){
	    return parseInt(el);
	  });
	  var max = Math.max.apply(null, keys);
	  var min = Math.min.apply(null, keys);
	  console.log([max, min]);
	  var imgData = context.createImageData(context.canvas.width, context.canvas.height);
	  var data = imgData.data;
	  //normalize colors
	  var coord = 0;
	  // iterate over the results and map the color to the appropriate pixel
	  for (var i = 0, rowLength = iterations.length; i < rowLength; i++) {
	    for (var j = 0, colLength = iterations[j].length; j < colLength; j++){
	      // var coord = 4 * (i * rowLength + j);
	      // debugger;
	      var colors = colorFunc(max, min, iterations[i][j]);
	      data[coord] = colors[0];
	      data[coord + 1] = colors[1];
	      data[coord + 2] = colors[2];
	      data[coord + 3] = colors[3];
	      coord += 4;
	    }
	  }
	  this.frequency = {};
	  return imgData;
	}

	Mandelbrot.prototype.greyscale = function (max, min, value) {
	  var alpha = 255; // opaque
	  if (max === min){
	    return [255,255,255, alpha];
	  } else {
	    var rgbVal = 255 * (1- (value)/(max - min));
	    return [rgbVal, rgbVal, rgbVal, alpha];
	  }
	  // var scale = 255/(max - min);
	  // var offset = -min * scale;
	  // var rgbVal = (scale * value) + offset;
	};

	Mandelbrot.prototype.colors = function (max, min, value) {
	  var colors = [
	    [22,30,247],
	    [247,22,30],
	    [30,247,22] ];
	  var half = (max - min)/2;

	};



	window.Mandelbrot = Mandelbrot;

	module.exports = Mandelbrot;


/***/ }
/******/ ]);