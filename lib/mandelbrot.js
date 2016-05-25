var Colors = require('./colors');

var DEFAULTCOORDS = [-2.5, 1, -1, 1];
var DEFAULTCENTER = [0.25, 0];

var Mandelbrot = function(width, height, xMin, xMax, yMin, yMax){
  this.setup(width, height, xMin, xMax, yMin, yMax)
  this.zoomed = false;
  this.center = DEFAULTCENTER;
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

Mandelbrot.prototype.rescale = function (zoom, clickLocation, absolute, originalCoords) {
  if (zoom == 1) return originalCoords;
  var location = clickLocation/absolute;
  var reciprocal = 1/zoom;
  var min, max;
  var oMin = originalCoords[0];
  var oMax = originalCoords[1];
  var oDiff = oMax - oMin;
  if (location < reciprocal/2){
    min = oMin;
    max = min + (oDiff * reciprocal)
  } else if (location > (1 - reciprocal/2)){
    min = oMax - oDiff * reciprocal;
    max = oMax;
  } else {
    min = oMin + oDiff * (location - reciprocal/2);
    max = oMin + oDiff * (location + reciprocal/2);
  }
  return [min, max];
};

Mandelbrot.prototype.zoom = function (x ,y , context ,zoom) {
  var canvas = context.canvas;
  var width = canvas.width;
  var height = canvas.height;
  var originalXCoords = [-2.5,1];
  var originalYCoords = [-1,1];
  if (this.zoomed){
    //reset bounding box to original coordinates
    this.setup(width, height, originalXCoords[0], originalXCoords[1], originalYCoords[0], originalYCoords[1]);
    canvas.className = "canvas-default";
    this.zoomed = false;
  } else {
    canvas.className = "canvas-zoomed";
    this.zoomed = true;
    //calculate new viewing window based on x and y
    var xCoords = this.rescale(zoom, x, width, originalXCoords);
    var yCoords = this.rescale(zoom, height - y, height, originalYCoords);
    this.setup(width, height, xCoords[0], xCoords[1], yCoords[0], yCoords[1]);
  }
};



window.Mandelbrot = Mandelbrot;

module.exports = Mandelbrot;
