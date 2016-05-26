var Colors = require('./colors');

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
