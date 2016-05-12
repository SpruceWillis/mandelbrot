var GameView = require('./gameView');

document.addEventListener("DOMContentLoaded", function(){
  var canvas = document.getElementById("root");
  var context = canvas.getContext("2d");
  var view = new GameView(context);
  view.start();
})
