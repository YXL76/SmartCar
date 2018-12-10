//pages/home_not_log/home_not_log.js
var app = getApp();     //获取全局变量

Page({
  data: {
    display: true,                //登录标记
    text: '请登录后再进行操作',     //按钮文本
  },

  onShow: function () {
    //登录校验
    if (app.data.islog === false) {
      this.setData({
        display: true,
        text: '请登录后再进行操作',
      })
    }
    else {
      this.setData({
        display: false,
        text: '点击查看图表',
      })
    }
  },

  //bindtap
  show: function () {
    if (app.data.islog === true) {
      this.request_oneNET();
    }
  },

  //调用oneNET API
  request_oneNET: function () {
    const requestTask = wx.request({
      url: 'https://api.heclouds.com/devices/503070312/datapoints?datastream_id=Light,Temperature,Humidity&limit=30',
      header: {
        'content-type': 'application/json',
        'api-key': 'gDYSWsNvy6=P=FBYxqf4yCQY8eI='
      },
      success: function (res) {
        app.data.temperature = res.data.data.datastreams[0];      //温度
        app.data.light = res.data.data.datastreams[1];            //光强
        app.data.humidity = res.data.data.datastreams[2];         //湿度
        wx.navigateTo({
          url: '../home_log/home_log',
        })
      },
    })
  },
})