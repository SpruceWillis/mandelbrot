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
  //using a larger value on the upper bound gives better resolution of early details
  //but completely wrecks lower iteration numbers
  //
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
  return this.colorize(iterations, context,{color: "color"});
};

Mandelbrot.prototype.colorize = function(iterations, context, options){
  if (options["color"] === "color"){
    var colorFunc = this.colors.bind(this);
  } else {
    colorFunc = this.greyscale.bind(this);
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

Mandelbrot.prototype.interpolate = function (arr1, arr2, percent) {
  if (arr1.length != arr2.length){
    return [];
  }
  return arr1.map(function(el, ind){
    return el + percent * (arr2[ind] - el);
  })

};

Mandelbrot.prototype.colors = function (max, min, value) {
  alpha = 255;
  var colors = [
    [247,22,30],
    [22,30,247],
    [30,247,22] ];
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
  // debugger;
  var results = this.interpolate(arr1, arr2, value/difference);
  results.push(alpha);
  return results;
};





window.Mandelbrot = Mandelbrot;

module.exports = Mandelbrot;
