var Colors = require('./colors');

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
