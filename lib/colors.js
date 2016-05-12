var Colors = {
  greyscale: function (max, min, value) {
    var alpha = 255; // opaque
    if (max === min){
      return [255,255,255, alpha];
    } else {
      var rgbVal = 255 * (1- (value)/(max - min));
      return [rgbVal, rgbVal, rgbVal, alpha];
    }
  },

  invertGrey: function(max, min, value){
    var alpha = 255;
    if (max === min){
      return [0, 0, 0, alpha];
    } else {
      var rgbVal = 255 * (value)/(max - min);
      return [rgbVal, rgbVal, rgbVal, alpha];
    }
  },

  interpolate: function (arr1, arr2, percent) {
    if (arr1.length != arr2.length){
      return [];
    }
    return arr1.map(function(el, ind){
      return el + percent * (arr2[ind] - el);
    })

  },



  colors: [ // -1 greyscale, -2 inverted greyscale
    [ [247,22,30], //0 - blue
      [22,30,247],
      [30,247,22] ],
    [ [247,22,30], //1 - green
      [30,247,22],
      [22,30,247] ]

  ],

  color: function (max, min, value, colorSet) {
    switch (colorSet) {
      case -2:
        return this.invertGrey(max, min, value);
        break;
      case -1:
        return this.greyscale(max, min, value);
        break;
      default:
        colors = this.colors[colorSet];
        if (colors === undefined){
          return this.greyscale(max, min, value);
        }
    }
    alpha = 255;
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
    var results = this.interpolate(arr1, arr2, value/difference);
    results.push(alpha);
    return results;
  }
}

module.exports = Colors;
