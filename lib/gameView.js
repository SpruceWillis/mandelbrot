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
