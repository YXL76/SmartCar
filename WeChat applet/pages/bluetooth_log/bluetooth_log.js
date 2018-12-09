// pages/bluetooth_log/bluetooth_log.js
var app = getApp();                   //获取全局变量

Page({

  data: {
    state: false,
    imageWidth: 0,              //页面宽度
    grids: [0, 1, 2, 3, 4, 5, 6, 7, 8]
  },

  onLoad: function () {
    this.setData({
      imageWidth: app.data.imageWidth,
    })
  },
  
  changeState: function () {
    this.setData({
      state: !this.data.state,
    });
  },
})