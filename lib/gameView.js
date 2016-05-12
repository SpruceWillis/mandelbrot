var Mandelbrot  = require('./mandelbrot');

var GameView = function(context){
  this.context = context;
  this.mandelbrot = mandelbrot = new Mandelbrot(this.context.canvas.width,
    this.context.canvas.height);
  this.maxIterations = 1;
}

GameView.prototype.start = function(){
  var that = this;
  this.timeout = setInterval(function(){
    if (that.maxIterations < 35){
      that.draw(that.maxIterations, {color: "greyscale", smooth: false});
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
    options["color"] = document.getElementById("color").value;
    options["smooth"] = document.getElementById("smooth").checked;
    clearInterval(that.timeout);
    that.draw(value, options);
  })
};

GameView.prototype.addCanvasListener = function () {
  document.getElementById("root").addEventListener("click", function(e){
    var x = e.clientX;
    var y = e.clientY;
    console.log(x);
    console.log(y);
  });
};

GameView.prototype.draw = function(maxIterations, options){
  var data = this.mandelbrot.draw(maxIterations, this.context, options);
  var canvas = this.context.canvas;
  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
  this.context.putImageData(data, 0,0);
};

module.exports = GameView;
