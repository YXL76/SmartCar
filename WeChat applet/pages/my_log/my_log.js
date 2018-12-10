// pages/my_log/my_log.js
var app = getApp()          //获取全局变量

Page({
  data: {
    hide: true,               //登录标记
    imagesrc: '',             //头像路径
    username: '',             //用户名
  },

  onShow: function () {
    //登录校验
    if (app.data.islog === false) {
      this.setData({
        hide: true,
        imagesrc: '',
        username: '',
      });
    }
    else {
      this.setData({
        hide: false,
        imagesrc: '../../img/user-Avatar.jpg',
        username: app.data.username,
      })
    }
  },

  //bindtap
  jumptolog: function () {
    wx.navigateTo({
      url: '../my_not_log/my_not_log',
    });
  },
})