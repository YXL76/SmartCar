// pages/map/map.js
var app = getApp();

Page({

  data: {
    longitude: 116.288860,
    latitude: 40.157410,
    scale: 16,
    imageWidth: 0,
    imageHeight: 0,
    markers: [{
      alpha: 0.8,
      id: 0,
      iconPath: "../../img/map-marker-8x.png",
      longitude: 116.288860,
      latitude: 40.157410,
      width: 25,
      height: 25
    }],
  },

  onLoad: function () {
    this.setData({
      imageHeight: app.data.imageHeight,
      imageWidth: app.data.imageWidth,
    })
  },
})