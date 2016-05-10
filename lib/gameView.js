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
    if (that.maxIterations < 100){
      that.draw(that.maxIterations);
      that.maxIterations++;
    } else {
      clearInterval(that.timeout);
    }
  }, 100);

};

GameView.prototype.draw = function(maxIterations){
  var data = this.mandelbrot.draw(maxIterations, this.context);
  var canvas = this.context.canvas;
  this.context.putImageData(data, 0,0);
};

module.exports = GameView;
