
var Game = function(){


};

Game.prototype.update = function (context) {
  var imgData = context.getImageData(0,0, canvas.width, canvas.height);
  var mandelbrot = new Mandelbrot(canvas.width, canvas.height);
};



module.exports = Game;
