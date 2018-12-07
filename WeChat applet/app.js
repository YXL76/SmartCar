//app.js
App({
  data: {
    imageWidth: 0,          //屏幕宽度
    temperature: {},        //温度数组
    light: {},              //光强数组
    humidity: {},           //湿度数组
    islog: false,           //登录标记
    phonenumber: '',        //手机号
    uesrname: '',           //用户名
  },

  onLaunch: function () {
    this.data.imageWidth = wx.getSystemInfoSync().windowWidth;      //获取屏幕宽度
  },
})