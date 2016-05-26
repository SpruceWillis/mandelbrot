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
	    if (that.maxIterations < 35){
	      that.draw(that.maxIterations, {color: defaultColor, smooth: false});
	      that.maxIterations++;
	    } else {
	      clearInterval(that.timeout);
	    }
	  }, 100);
	  this.addListeners();
	};
	
	GameView.prototype.addListeners = function () {
	  this.addCanvasListener();
	  this.addIterationListeners();
	  this.addColorListener();
	  this.addZoomListeners();
	  this.addSmoothingListener();
	};
	
	GameView.prototype.startDraw = function () {
	  var value = parseInt(document.getElementById("amountInput").value);
	  var options = {};
	  options["color"] = parseInt(document.getElementById("color").value);
	  options["smooth"] = document.getElementById("chk-smooth").checked;
	  clearInterval(this.timeout);
	  this.draw(value, options);
	};
	
	
	GameView.prototype.draw = function(maxIterations, options){
	  var data = this.mandelbrot.draw(maxIterations, this.context, options);
	  var canvas = this.context.canvas;
	  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
	  this.context.putImageData(data, 0,0);
	};
	
	GameView.prototype.zoomDraw = function (x,y) {
	  var width = Math.ceil(this.context.canvas.width/2);
	  var height = Math.ceil(this.context.canvas.height/2);
	  var zoomLevel = (parseInt(document.getElementById('zoomInput').value) + 100)/100;
	  // if (zoomLevel <= 1) return;
	  this.mandelbrot.zoom(this.context, zoomLevel);
	  this.startDraw();
	};
	
	GameView.prototype.addZoomListeners = function () {
	  var that = this;
	  var range = document.getElementById("zoomRange");
	  var input = document.getElementById('zoomInput')
	  range.addEventListener("input", function(e){
	    debugger;
	    input.value = e.target.value;
	    that.setButtonStatus();
	    that.zoomDraw();
	  });
	  input.addEventListener("input", function(e){
	    debugger;
	    range.value = e.target.value;
	    that.setButtonStatus();
	    that.zoomDraw();
	  });
	  document.getElementById("zoomPlus").addEventListener("click", function(e){
	    debugger;
	    input.value = Math.min(parseInt(input.max), parseInt(input.value) + parseInt(input.step));
	    range.value = input.value;
	    that.setButtonStatus();
	    that.zoomDraw();
	  });
	  document.getElementById("zoomMinus").addEventListener("click", function(e){
	    debugger;
	    input.value = Math.max(parseInt(input.min), parseInt(input.value) - parseInt(input.step));
	    range.value = input.value;
	    that.setButtonStatus();
	    that.zoomDraw();
	  });
	
	};
	
	GameView.prototype.setButtonStatus = function () {
	  var input = document.getElementById("zoomInput");
	  var plusButton = document.getElementById('zoomPlus');
	  var minusButton = document.getElementById('zoomMinus');
	  if (!plusButton.disabled && parseInt(input.value) >= parseInt(input.max)){
	    plusButton.disabled = true
	  } else if (!minusButton.disabled && parseInt(input.value) <= parseInt(input.min)) {
	    minusButton.disabled = true
	  } else {
	    plusButton.disabled = false;
	    minusButton.disabled = false;
	  }
	};
	
	GameView.prototype.addColorListener = function () {
	  var that = this;
	  document.getElementById('color').addEventListener("change", function(e){
	    var data = that.mandelbrot.colorize(that.context, parseInt(e.target.value));
	    var canvas = that.context.canvas;
	    that.context.clearRect(0,0,that.context.canvas.width, that.context.canvas.height);
	    that.context.putImageData(data, 0,0);
	  });
	};
	
	GameView.prototype.addSmoothingListener = function(){
	  var that = this;
	  var p = document.getElementById('smooth');
	  p.addEventListener('click', function(){
	    var smooth = document.getElementById('chk-smooth');
	    smooth.checked = !smooth.checked;
	    that.startDraw();
	  });
	};
	
	GameView.prototype.addCanvasListener = function () {
	  var that = this;
	  document.getElementById("root").addEventListener("click", function(e){
	    var zoomLevel = (parseInt(document.getElementById('zoomInput').value) + 100)/100;
	    var x = e.offsetX;
	    var y = e.offsetY;
	    that.mandelbrot.recenter(x,y, that.context, zoomLevel);
	    that.startDraw();
	  });
	};
	
	
	
	GameView.prototype.addIterationListeners = function(){
	  var that = this;
	  document.getElementById("amountRange").addEventListener("change", function(e){
	    that.startDraw();
	  });
	  document.getElementById("amountInput").addEventListener("change", function(){
	    that.startDraw();
	  })
	};
	
	
	module.exports = GameView;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var Colors = __webpack_require__(3);
	
	var DEFAULTCOORDS = [-2.5, 1, -1, 1];
	var DEFAULTCENTER = [0.25, 0];
	
	var Mandelbrot = function(width, height, xMin, xMax, yMin, yMax){
	  this.setup(width, height, xMin, xMax, yMin, yMax)
	  this.center = DEFAULTCENTER;
	};
	
	Mandelbrot.prototype.setup = function (width, height, xMin, xMax, yMin, yMax) {
	  xMin = xMin || DEFAULTCOORDS[0];
	  xMax = xMax || DEFAULTCOORDS[1];
	  yMin = yMin || DEFAULTCOORDS[2];
	  yMax = yMax || DEFAULTCOORDS[3];
	  var xScale = (xMax - xMin)/(width - 1);
	  var xOffset = xMin;
	  var yScale = (yMin - yMax)/(height - 1);
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
	  this.iterations = [[]];
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
	  this.iterations = iterCount;
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
	  this.generate(maxIterations, options["smooth"]);
	  return this.colorize(context, options["color"]);
	};
	
	Mandelbrot.prototype.colorize = function(context, colorOption){
	  var imgData = context.createImageData(context.canvas.width, context.canvas.height);
	  var data = imgData.data;
	  //normalize colors
	  var coord = 0;
	  // iterate over the results and map the color to the appropriate pixel
	  for (var i = 0, rowLength = this.iterations.length; i < rowLength; i++) {
	    for (var j = 0, colLength = this.iterations[j].length; j < colLength; j++){
	      var colors = Colors.color(this.max, this.min, this.iterations[i][j], colorOption);
	      data[coord] = colors[0];
	      data[coord + 1] = colors[1];
	      data[coord + 2] = colors[2];
	      data[coord + 3] = colors[3];
	      coord += 4;
	    }
	  }
	  return imgData;
	}
	
	Mandelbrot.prototype.rescale = function (zoom, coordCenter, absolute, originalCoords) {
	  var coordDiff = (originalCoords[1] - originalCoords[0])/zoom;
	  var coordMin = coordCenter - coordDiff/2;
	  var coordMax = coordCenter + coordDiff/2;
	  return [coordMin, coordMax];
	};
	
	Mandelbrot.prototype.zoom = function (context ,zoom) {
	  var canvas = context.canvas;
	  var width = canvas.width;
	  var height = canvas.height;
	  var originalXCoords = DEFAULTCOORDS.slice(0,2);
	  var originalYCoords = DEFAULTCOORDS.slice(2,4).reverse();
	  // if (this.zoomed){
	  //   //reset bounding box to original coordinates
	  //   this.setup(width, height, originalXCoords[0], originalXCoords[1], originalYCoords[0], originalYCoords[1]);
	  //   canvas.className = "canvas-default";
	  //   this.zoomed = false;
	  // } else {
	  //   canvas.className = "canvas-zoomed";
	  //   this.zoomed = true;
	    //calculate new viewing window based on x and y
	    var xCoords = this.rescale(zoom, this.center[0], width, originalXCoords);
	    var yCoords = this.rescale(zoom, this.center[1], height, originalYCoords);
	    this.setup(width, height, xCoords[0], xCoords[1], yCoords[0], yCoords[1]);
	  // }
	};
	
	Mandelbrot.prototype.recenter = function(px, py, context, zoom){
	  //px, py are the coordinates of the pixel clicked
	  this.center = [this.xCoords[px], this.yCoords[py]];
	  this.zoom(context, zoom);
	}
	
	
	
	
	
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