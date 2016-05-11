var Mandelbrot  = require('./mandelbrot');

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
    if (that.maxIterations < 20){
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
    that.draw(parseInt(value ));
  })
};

GameView.prototype.draw = function(maxIterations){
  var data = this.mandelbrot.draw(maxIterations, this.context);
  var canvas = this.context.canvas;
  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
  this.context.putImageData(data, 0,0);
};

module.exports = GameView;
