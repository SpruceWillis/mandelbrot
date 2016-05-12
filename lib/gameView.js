var Mandelbrot  = require('./mandelbrot');

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
  this.addDrawListener();
  this.addCanvasListener();
};

GameView.prototype.startDraw = function () {
  var value = parseInt(document.getElementById("amountInput").value);
  var options = {};
  options["color"] = parseInt(document.getElementById("color").value);
  options["smooth"] = document.getElementById("smooth").checked;
  clearInterval(this.timeout);
  this.draw(value, options);
};

GameView.prototype.addDrawListener = function () {
  // var that = this;
  document.getElementById("draw").addEventListener("click",this.startDraw.bind(this));
};

GameView.prototype.addCanvasListener = function () {
  var that = this;
  document.getElementById("root").addEventListener("click", function(e){
    var x = e.offsetX;
    var y = e.offsetY;
    var zoomLevel = parseInt(document.getElementById('zoomInput').value)/100;
    that.mandelbrot.zoom(x,y, that.context, zoomLevel);
    that.startDraw();
  });
};

GameView.prototype.draw = function(maxIterations, options){
  var data = this.mandelbrot.draw(maxIterations, this.context, options);
  var canvas = this.context.canvas;
  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
  this.context.putImageData(data, 0,0);
};

module.exports = GameView;
