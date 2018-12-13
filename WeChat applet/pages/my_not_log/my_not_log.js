// pages/my_not_log/my_not_log.js
var app = getApp();                         //获取全局变量
var sliderWidth = 96;                       //用于计算中间位置
var plugin = requirePlugin("smsvercode");   //引入短信验证码插件

Page({
  data: {
    tabs: ["登录", "注册"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0,
    username: '',                 //注册用户名
    checkcode: '',                //注册验证码
    password1: '',                //注册密码1
    password2: '',                //注册密码2
    phonenumber: '',              //注册手机号
    phn: '',                      //登录手机号
    paw: '',                      //登录密码
    sto_password: [],             //密码缓存
    sto_username: [],             //用户名缓存
    sto_phonenumber: [],          //手机号缓存
    ak: '',                       //短信校验码插件ak
  },

  onLoad: function () {
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
    //读取手机号缓存
    wx.getStorage({
      key: 'phonenumber',
      success: function (res) {
        that.setData({
          sto_phonenumber: res.data,
        })
      },
    });
    //读取密码缓存
    wx.getStorage({
      key: 'password',
      success: function (res) {
        that.setData({
          sto_password: res.data,
        })
      },
    });
    //读取用户名缓存
    wx.getStorage({
      key: 'username',
      success: function (res) {
        that.setData({
          sto_username: res.data,
        })
      },
    });
  },

  //读取登录手机号
  logphonenumber: function (e) {
    this.setData({
      phn: e.detail.value
    })
  },

  //读取登录密码
  logpassword: function (e) {
    this.setData({
      paw: e.detail.value
    })
  },

  //读取注册手机号
  bindphonenumber: function (e) {
    this.setData({
      phonenumber: e.detail.value
    })
  },

  //读取注册用户名
  bindusername: function (e) {
    this.setData({
      username: e.detail.value
    })
  },

  //读取验证码
  bindcheckcode: function (e) {
    this.setData({
      checkcode: e.detail.value
    })
  },

  //读取注册密码1
  bindpassword1: function (e) {
    this.setData({
      password1: e.detail.value
    })
  },

  //读取注册密码2
  bindpassword2: function (e) {
    this.setData({
      password2: e.detail.value
    })
  },

  //检验手机号
  checkphonenumber: function () {
    let rul = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (rul.test(this.data.phonenumber)) {
      this.getcode();
    } else {
      wx.showToast({
        title: '手机号不正确',
        image: '../../img/x-8x.png'
      })
    }
  },

  //获取短信验证码
  getcode: function (e) {
    plugin.getvercodevip(this.data.ak, this.data.phonenumber, function (res) {
      if (res.errno == "0") {
        wx.showToast({
          title: '发送成功',
          icon: '../../img/check-8x.png'
        })
      }
      else {
        wx.showToast({
          title: '发送失败',
          image: '../../img/x-8x.png'
        })
      }
    });
  },

  //注册校验
  checkregist: function () {
    //用户名校验
    if (this.data.username.length < 3) {
      wx.showToast({
        title: '户名需大于2位',
        image: '../../img/x-8x.png'
      })
    } else {
      //验证码校验
      if (this.formSubmit()) {
        wx.showToast({
          title: '验证码错误',
          image: '../../img/x-8x.png'
        })
      }
      else {
        //密码格式校验
        if (this.data.password1.length < 8) {
          wx.showToast({
            title: '密码需大于7位',
            image: '../../img/x-8x.png'
          })
        }
        else {
          //密码匹配校验
          if (this.data.password1 === this.data.password2) {
            this.data.sto_username.push(this.data.username);
            this.data.sto_password.push(this.data.password1);
            this.data.sto_phonenumber.push(this.data.phonenumber);
            //用户名缓存更新
            wx.setStorage({
              key: "username",
              data: this.data.sto_username
            });
            //密码缓存更新
            wx.setStorage({
              key: "password",
              data: this.data.sto_password
            });
            //手机号缓存更新
            wx.setStorage({
              key: "phonenumber",
              data: this.data.sto_phonenumber
            });
            wx.showToast({
              title: '注册成功',
              image: '../../img/check-8x.png'
            })
          }
          else {
            wx.showToast({
              title: '密码不一致',
              image: '../../img/x-8x.png'
            })
          }
        }
      }
    }
  },

  //登录校验
  checklogin: function () {
    for (let i = 0; i < this.data.sto_phonenumber.length; ++i) {
      //用户名密码校验
      if (this.data.sto_phonenumber[i] === this.data.phn && this.data.sto_password[i] === this.data.paw) {
        app.data.islog = true;                                    //更改登录标记
        app.data.username = this.data.sto_username[i];            //保存用户名
        app.data.phonenumber = this.data.sto_phonenumber[i];      //保存手机号
        wx.showToast({
          title: '登录成功',
          image: '../../img/check-8x.png'
        });
        wx.navigateBack({
          delta: 1
        })
        return;
      }
    }
    wx.showToast({
      title: '登录失败',
      image: '../../img/x-8x.png'
    })
  },

  //校验短信校验码
  formSubmit: function (e) {
    plugin.checkvercode(this.data.phonenumber, this.data.checkcode, function (res) {
      if (res.errno == "0") {
        return true;
      }
      else {
        return false;
      }
    });
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  }
});