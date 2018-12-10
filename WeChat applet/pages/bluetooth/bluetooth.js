// pages/bluetooth/bluetooth.js
var sliderWidth = 96;                 //用于计算中间位置
var app = getApp();                   //获取全局变量
var serviceId = "0000ffe0-0000-1000-8000-00805f9b34fb";
var characteristicId = "0000ffe1-0000-1000-8000-00805f9b34fb";

Page({
  data: {
    state: false,               //蓝牙操控状态
    hide: false,                //登录标记
    imageWidth: 0,              //页面宽度
    isbluetoothready: false,    //蓝牙初始化
    searchingstatus: false,     //搜索状态
    list: [],                   //设备列表
    receive_data: '0',          //蓝牙串口消息
    tabs: ["选项一", "选项二"],
    activeIndex: 0,
    sliderOffset: 0,
    sliderLeft: 0
  },

  onLoad: function () {
    this.setData({
      imageWidth: app.data.imageWidth,
    });
    var that = this;
    wx.getSystemInfo({
      success: function (res) {
        that.setData({
          sliderLeft: (res.windowWidth / that.data.tabs.length - sliderWidth) / 2,
          sliderOffset: res.windowWidth / that.data.tabs.length * that.data.activeIndex
        });
      }
    });
  },

  tabClick: function (e) {
    this.setData({
      sliderOffset: e.currentTarget.offsetLeft,
      activeIndex: e.currentTarget.id
    });
  },

  onShow: function () {
    //登录校验
    if (app.data.islog === false) {
      this.setData({
        hide: false,
      })
    } else {
      this.setData({
        hide: true,
      })
    }
  },

  //改变蓝牙控制状态
  changeState: function () {
    this.setData({
      state: !this.data.state,
    });
    this.send(6);
  },

  //停止
  stop: function () {
    this.send(0);
  },

  //前进
  forward: function () {
    this.send(1);
  },

  //后退
  backward: function () {
    this.send(2);
  },

  //左转
  turnleft: function () {
    this.send(3);
  },

  //右转
  turnright: function () {
    this.send(4);
  },

  open_BLE: function () {
    var that = this;
    that.setData({
      isbluetoothready: !that.data.isbluetoothready,
    })

    if (that.data.isbluetoothready) {
      //开启蓝牙模块并初始化
      wx.openBluetoothAdapter({
        success: function (res) {
          wx.showModal({
            title: '提示',
            content: '蓝牙开启成功',
          })
        },
        fail: function (res) {
          wx.showModal({
            title: '提示',
            content: '请检查手机蓝牙是否打开',
          })
        }
      })
      //开启蓝牙模块并初始化

      //检查蓝牙模块是否初始化成功
      wx.getBluetoothAdapterState({
        success: function (res) {
          if (!res.available) {
            wx.showToast({
              title: '初始化失败',
              icon: 'loading',
              duration: 2000
            })
          } else {
            wx.showToast({
              title: '初始化成功',
              icon: 'success',
              duration: 2000
            })
          }
        }
      })
      //检查蓝牙模块是否初始化成功
    } else {
      wx.closeBLEConnection({
        deviceId: that.data.connectedDeviceId,
        complete: function (res) {
          that.setData({
            deviceconnected: false,
            connectedDeviceId: '',
          })
          wx.showToast({
            title: '连接断开',
            icon: 'success',
            duration: 2000
          })
        }
      })
      setTimeout(function () {
        that.setData({
          list: []
        })
        //释放蓝牙适配器
        wx.closeBluetoothAdapter({
          success: function (res) {
            that.setData({
              isbluetoothready: false,
              deviceconnected: false,
              devices: [],
              searchingstatus: false,
              receivedata: ''
            })
            wx.showToast({
              title: '适配器释放',
              icon: 'success',
              duration: 2000
            })
          },
        })
        //释放蓝牙适配器
      }, 1000)
    }
  },

  search_BLE: function () {
    var that = this;
    if (!that.data.searchingstatus) {
      var that = this;
      //开始搜索附近蓝牙设备
      wx.startBluetoothDevicesDiscovery({
        success: function (res) {
          wx.showToast({
            title: '开始搜索',
            icon: 'loading',
            duration: 2000
          })
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
      //开始搜索附近蓝牙设备
    } else {
      //停止搜索附近蓝牙设备
      wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
          wx.showToast({
            title: '停止搜索',
            icon: 'success',
            duration: 2000
          })
          that.setData({
            searchingstatus: !that.data.searchingstatus
          })
        }
      })
      //停止搜索附近蓝牙设备
      setTimeout(function () {
        //获取发现的蓝牙设备
        wx.getBluetoothDevices({
          success: function (res) {
            that.setData({
              list: res.devices
            })
          }
        })
        //获取发现的蓝牙设备
      }, 1000)
    }
  },

  connectTO: function (e) {
    var that = this
    wx.showLoading({
      title: '连接设备中...',
    })
    wx.createBLEConnection({
      deviceId: e.currentTarget.id,
      success: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '连接成功',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          deviceconnected: true,
          connectedDeviceId: e.currentTarget.id
        })
        // 启用 notify 功能
        wx.notifyBLECharacteristicValueChanged({
          state: true,
          deviceId: that.data.connectedDeviceId,
          serviceId: serviceId,
          characteristicId: characteristicId,
          success: function (res) {

          }
        })
        // 启用 notify 功能
        // ArrayBuffer转为16进制数
        function ab2hex(buffer) {
          var hexArr = Array.prototype.map.call(
            new Uint8Array(buffer),
            function (bit) {
              return ('00' + bit.toString(16)).slice(-2)
            }
          )
          return hexArr.join('');
        }
        // 16进制数转ASCLL码
        function hexCharCodeToStr(hexCharCodeStr) {
          var trimedStr = hexCharCodeStr.trim();
          var rawStr = trimedStr.substr(0, 2).toLowerCase() === "0x" ? trimedStr.substr(2) : trimedStr;
          var len = rawStr.length;
          var curCharCode;
          var resultStr = [];
          for (var i = 0; i < len; i = i + 2) {
            curCharCode = parseInt(rawStr.substr(i, 2), 16);
            resultStr.push(String.fromCharCode(curCharCode));
          }
          return resultStr.join("");
        }
        //监听回调，接收数据
        wx.onBLECharacteristicValueChange(function (characteristic) {
          var hex = ab2hex(characteristic.value);
          that.setData({
            receive_data: hexCharCodeToStr(hex),
          })
        })
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: '连接失败',
          icon: 'success',
          duration: 1000
        })
        that.setData({
          connected: false
        })
      }
    })
    wx.stopBluetoothDevicesDiscovery({
      success: function (res) {
      }
    })
  },

  send: function (e) {
    var that = this;
    let buffer = new ArrayBuffer(1);
    let dataView = new DataView(buffer);
    dataView.setUint8(0, Number(e));

    wx.writeBLECharacteristicValue({
      deviceId: that.data.connectedDeviceId,
      serviceId: serviceId,
      characteristicId: characteristicId,
      value: buffer,
      success: function (res) {
      }
    })
  },
})