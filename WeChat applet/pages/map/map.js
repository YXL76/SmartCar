// pages/map/map.js
var app = getApp();                   //获取全局变量

Page({

  data: {
    longitude: 116.288860,            //中心经度
    latitude: 40.157410,              //中心纬度
    scale: 16,                        //缩放级别
    imageWidth: 0,                    //页面宽度
    imageHeight: 0,                   //页面高度
    markers: [{
      alpha: 0.8,                     //透明的
      id: 0,
      iconPath: "../../img/map-marker-8x.png",
      longitude: 116.288860,          //经度
      latitude: 40.157410,            //纬度
      width: 25,
      height: 25
    }],
  },

  onLoad: function () {
    this.getPosition();
    this.setData({
      imageHeight: app.data.imageHeight,      //获取页面高度
      imageWidth: app.data.imageWidth,        //获取页面宽度
    })
  },

  //放大
  plusZoom: function () {
    this.setData({
      scale: this.data.scale + 1,
    });
  },

  //缩小
  minusZoom: function () {
    this.setData({
      scale: this.data.scale - 1,
    });
  },

  //获取位置
  getPosition: function () {
    var that = this;
    //获取经度
    const requestTask = wx.request({
      url: 'https://api.heclouds.com/devices/505730608/datastreams/Longitude',
      header: {
        'content-type': 'application/json',
        'api-key': 'gDYSWsNvy6=P=FBYxqf4yCQY8eI='
      },
      success: function (res) {
        that.data.longitude = res.data.data.current_value;
        that.data.markers[0].longitude = res.data.data.current_value;
      },
    });
    //获取纬度
    const requestTask2 = wx.request({
      url: 'https://api.heclouds.com/devices/505730608/datastreams/Latitude',
      header: {
        'content-type': 'application/json',
        'api-key': 'gDYSWsNvy6=P=FBYxqf4yCQY8eI='
      },
      success: function (res) {
        that.data.latitude = res.data.data.current_value,
          that.data.markers[0].latitude = res.data.data.current_value,
          //重新渲染页面
          that.setData({
            latitude: that.data.latitude,
            longitude: that.data.longitude,
            markers: that.data.markers,
          })
      },
    })
  },
})