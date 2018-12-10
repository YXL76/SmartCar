//pages/home_log/home_log.js
var wxCharts = require('../../utils/wxcharts-min.js');  //引入图标插件
var app = getApp();                                     //获取全局变量

Page({
  //创建数据
  convert: function () {
    var categories = [];
    var humidity = [];
    var light = [];
    var tempe = [];

    var length = app.data.light.datapoints.length
    for (var i = 0; i < length; i++) {
      categories.push(app.data.humidity.datapoints[i].at.slice(11, 19));
      humidity.push(app.data.humidity.datapoints[i].value);
      light.push(app.data.light.datapoints[i].value);
      tempe.push(app.data.temperature.datapoints[i].value);
    }

    return {
      categories: categories,
      humidity: humidity,
      light: light,
      tempe: tempe
    }
  },

  //绘制图表
  onLoad: function (options) {
    var windowWidth = app.data.imageWidth;
    var myData = this.convert();
    //湿度图表
    var lineChart_hum = new wxCharts({
      canvasId: 'humidity',
      type: 'line',
      categories: myData.categories,
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: '湿度',
        data: myData.humidity,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      yAxis: {
        title: '湿度 (%)',
        format: function (val) {
          return val.toFixed(2) + '%';
        },
        min: 55
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
    //光强图表
    var lineChart_light = new wxCharts({
      canvasId: 'light',
      type: 'line',
      categories: myData.categories,
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: '光照强度',
        data: myData.light,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      yAxis: {
        title: '光照强度 (lux)',
        format: function (val) {
          return val.toFixed(2) + 'lux';
        },
        min: 190
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
    //温度图表
    var lineChart_tempe = new wxCharts({
      canvasId: 'tempe',
      type: 'line',
      categories: myData.categories,
      animation: true,
      background: '#f5f5f5',
      series: [{
        name: '温度',
        data: myData.tempe,
        format: function (val, name) {
          return val.toFixed(2);
        }
      }],
      xAxis: {
        disableGrid: false
      },
      yAxis: {
        title: '温度 (℃)',
        format: function (val) {
          return val.toFixed(2) + '℃';
        },
        min: 24
      },
      width: windowWidth,
      height: 200,
      dataLabel: false,
      dataPointShape: true,
      extra: {
        lineStyle: 'curve'
      }
    });
  },
})