#include "./ESP8266.h"
#include "I2Cdev.h"
#include "SHT2x.h"
#include <Wire.h>
#include <SoftwareSerial.h>

#define INTERVAL_SENSOR 17000	                    //数据读取间隔
#define INTERVAL_NET 17000	                        //数据上传间隔    

const int lux_pin = A0;                                             //光敏传感器引脚
const int buzzer_pin = 6;                                           //蜂鸣器引脚 
const float limit_tem = 25.0, limit_hum = 70.0, limit_lux = 500.0;  //报警峰值

//WIFI连接
#define SSID "YXL"                                  //名称
#define PASSWORD "18054994079"                      //密码

//HTTP连接
#define HOST_NAME "jjfarfapi.heclouds.com"          //url
#define DEVICEID "503070312"                        //设备ID
#define PROJECTID "183593"                          //产品ID
#define HOST_PORT (80)                              //端口
String apiKey = "gDYSWsNvy6=P=FBYxqf4yCQY8eI=";     //API-KEY

float sensor_tem, sensor_hum, sensor_lux;
char sensor_tem_c[10], sensor_hum_c[10], sensor_lux_c[10];

//定义软串口
SoftwareSerial mySerial(2, 3);      
ESP8266 wifi(mySerial);

//时间
unsigned long net_time = millis();
unsigned long sensor_time = millis();

//数据字符串
String postString;
String jsonToSend;

void setup()
{
    ESP8266_initialization();
    Wire.begin();
    pinMode(lux_pin, INPUT);
    pinMode(buzzer_pin, OUTPUT);
}

void loop()
{
    //获取数据
    if (sensor_time > millis())
        sensor_time = millis();
    if (millis() - sensor_time > INTERVAL_SENSOR)
    {
        get_sensor_data();
        sensor_time = millis();
        //异常报警
        if (sensor_tem - limit_tem > 0 || sensor_hum - limit_hum > 0 || sensor_lux - limit_lux > 0)
            tone(buzzer_pin, 600);
        else
            noTone(buzzer_pin);
    }
    //上传数据
    if (net_time > millis())
        net_time = millis();
    if (millis() - net_time > INTERVAL_NET)
    {
        update_sensor_data();
        net_time = millis();
    }
}

//ESP8266初始化
void ESP8266_initialization()
{
    Serial.begin(115200);
    while (!Serial)
        ;
    Serial.print("setup begin\r\n");
    Serial.print("FW Version: ");
    Serial.println(wifi.getVersion().c_str());
    if (wifi.setOprToStation())
        Serial.print("to station ok\r\n");
    else
        Serial.print("to station err\r\n");
    if (wifi.joinAP(SSID, PASSWORD))
    {
        Serial.print("Join AP success\r\n");
        Serial.print("IP: ");
        Serial.println(wifi.getLocalIP().c_str());
    }
    else
        Serial.print("Join AP failure\r\n");
    Serial.print("setup end\r\n");
}

//获取传感器数据
void get_sensor_data()
{
    sensor_tem = SHT2x.GetTemperature();
    sensor_hum = SHT2x.GetHumidity();
    sensor_lux = analogRead(A0);
    delay(1000);
    //将数据转换为字符串
    dtostrf(sensor_tem, 1, 2, sensor_tem_c);
    dtostrf(sensor_hum, 1, 2, sensor_hum_c);
    dtostrf(sensor_lux, 1, 2, sensor_lux_c);
}

//上传数据
void update_sensor_data()
{
    //建立TCP连接
    if (wifi.createTCP(HOST_NAME, HOST_PORT))
    {
        Serial.print("create tcp ok\r\n");

        //整合数据
        jsonToSend = "{\"Temperature\":\"" + String(sensor_tem_c) + "\"";
        jsonToSend += ",\"Humidity\":\"" + String(sensor_hum_c) + "\"";
        jsonToSend += ",\"Light\":\"" + String(sensor_lux_c) + "\"}";

        //POST报文
        postString = "POST /devices/";                  //POST
        postString += DEVICEID;
        postString += "/datapoints?type=3 HTTP/1.1";    //TYPE
        postString += "\r\n";
        postString += "api-key:";                       //API-KEY
        postString += apiKey;
        postString += "\r\n";
        postString += "Host:api.heclouds.com\r\n";      //url
        postString += "Connection:close\r\n";
        postString += "Content-Length:";
        postString += jsonToSend.length();
        postString += "\r\n";
        postString += "\r\n";
        postString += jsonToSend;                       //数据
        postString += "\r\n";
        postString += "\r\n";
        postString += "\r\n";

        const char *postArray = postString.c_str();                     //将string转化为char数组
        Serial.println(postArray);
        wifi.send((const uint8_t *)postArray, strlen(postArray));       //send发送命令
        Serial.println("send success");
        if (wifi.releaseTCP())
            Serial.print("release tcp ok\r\n");
        else
            Serial.print("release tcp err\r\n");
        postArray = nullptr;                                            //清空数组
    }
    else
        Serial.print("create tcp err\r\n");
}
