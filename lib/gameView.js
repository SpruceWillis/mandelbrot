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
  this.addListeners();
};

GameView.prototype.addListeners = function () {
  this.addCanvasListener();
  this.addIterationListeners();
  this.addColorListener();
  this.addZoomListeners();
  this.addSmoothingListener();
};

GameView.prototype.startDraw = function () {
  var value = parseInt(document.getElementById("amountInput").value);
  var options = {};
  options["color"] = parseInt(document.getElementById("color").value);
  options["smooth"] = document.getElementById("chk-smooth").checked;
  clearInterval(this.timeout);
  this.draw(value, options);
};


GameView.prototype.draw = function(maxIterations, options){
  var data = this.mandelbrot.draw(maxIterations, this.context, options);
  var canvas = this.context.canvas;
  this.context.clearRect(0,0,this.context.canvas.width, this.context.canvas.height);
  this.context.putImageData(data, 0,0);
};

GameView.prototype.zoomDraw = function (x,y) {
  var width = Math.ceil(this.context.canvas.width/2);
  var height = Math.ceil(this.context.canvas.height/2);
  var zoomLevel = (parseInt(document.getElementById('zoomInput').value) + 100)/100;
  // if (zoomLevel <= 1) return;
  this.mandelbrot.zoom(this.context, zoomLevel);
  this.startDraw();
};

GameView.prototype.addZoomListeners = function () {
  var that = this;
  var range = document.getElementById("zoomRange");
  var input = document.getElementById('zoomInput')
  range.addEventListener("input", function(e){
    debugger;
    input.value = e.target.value;
    that.setButtonStatus();
    that.zoomDraw();
  });
  input.addEventListener("input", function(e){
    debugger;
    range.value = e.target.value;
    that.setButtonStatus();
    that.zoomDraw();
  });
  document.getElementById("zoomPlus").addEventListener("click", function(e){
    debugger;
    input.value = Math.min(parseInt(input.max), parseInt(input.value) + parseInt(input.step));
    range.value = input.value;
    that.setButtonStatus();
    that.zoomDraw();
  });
  document.getElementById("zoomMinus").addEventListener("click", function(e){
    debugger;
    input.value = Math.max(parseInt(input.min), parseInt(input.value) - parseInt(input.step));
    range.value = input.value;
    that.setButtonStatus();
    that.zoomDraw();
  });

};

GameView.prototype.setButtonStatus = function () {
  var input = document.getElementById("zoomInput");
  var plusButton = document.getElementById('zoomPlus');
  var minusButton = document.getElementById('zoomMinus');
  if (!plusButton.disabled && parseInt(input.value) >= parseInt(input.max)){
    plusButton.disabled = true
  } else if (!minusButton.disabled && parseInt(input.value) <= parseInt(input.min)) {
    minusButton.disabled = true
  } else {
    plusButton.disabled = false;
    minusButton.disabled = false;
  }
};

GameView.prototype.addColorListener = function () {
  var that = this;
  document.getElementById('color').addEventListener("change", function(e){
    var data = that.mandelbrot.colorize(that.context, parseInt(e.target.value));
    var canvas = that.context.canvas;
    that.context.clearRect(0,0,that.context.canvas.width, that.context.canvas.height);
    that.context.putImageData(data, 0,0);
  });
};

GameView.prototype.addSmoothingListener = function(){
  var that = this;
  var p = document.getElementById('smooth');
  p.addEventListener('click', function(){
    var smooth = document.getElementById('chk-smooth');
    smooth.checked = !smooth.checked;
    that.startDraw();
  });
};

GameView.prototype.addCanvasListener = function () {
  var that = this;
  document.getElementById("root").addEventListener("click", function(e){
    var zoomLevel = (parseInt(document.getElementById('zoomInput').value) + 100)/100;
    var x = e.offsetX;
    var y = e.offsetY;
    that.mandelbrot.recenter(x,y, that.context, zoomLevel);
    that.startDraw();
  });
};



GameView.prototype.addIterationListeners = function(){
  var that = this;
  document.getElementById("amountRange").addEventListener("change", function(e){
    that.startDraw();
  });
  document.getElementById("amountInput").addEventListener("change", function(){
    that.startDraw();
  })
};


module.exports = GameView;
