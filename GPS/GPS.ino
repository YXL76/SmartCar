//代码的GPS部分来自淘宝卖家
#include "./ESP8266.h"
#include <SoftwareSerial.h>

#define INTERVAL_SENSOR 17000 //数据读取间隔
#define INTERVAL_NET 17000	//数据上传间隔

//WIFI连接
#define SSID "YXL"			   //名称
#define PASSWORD "18054994079" //密码

//HTTP连接
#define HOST_NAME "jjfarfapi.heclouds.com"		//url
#define DEVICEID "505730608"					//设备ID
#define PROJECTID "183593"						//产品ID
#define HOST_PORT (80)							//端口
String apiKey = "gDYSWsNvy6=P=FBYxqf4yCQY8eI="; //API-KEY

//定义软串口
SoftwareSerial mySerial(2, 3);
ESP8266 wifi(mySerial);

//时间
unsigned long net_time = millis();
unsigned long sensor_time = millis();

//数据字符串
String postString;
String jsonToSend;

//此处为了兼容其他的多串口Arduino板子
#define GpsSerial Serial
#define DebugSerial Serial

struct
{
	char GPS_Buffer[80];
	bool isGetData;		//是否获取到GPS数据
	bool isParseData;   //是否解析完成
	char UTCTime[11];   //UTC时间
	char latitude[11];  //纬度
	char longitude[12]; //经度
	bool isUsefull;		//定位信息是否有效
} Save_Data;

const unsigned int gpsRxBufferLength = 600;
char gpsRxBuffer[gpsRxBufferLength];
unsigned int ii = 0;

void setup()
{
	ESP8266_initialization();
	GpsSerial.begin(9600);
	DebugSerial.begin(9600);

	Save_Data.isGetData = false;
	Save_Data.isParseData = false;
	Save_Data.isUsefull = false;
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

//获取数据
void get_sensor_data()
{
	gpsRead();		  //获取GPS数据
	parseGpsBuffer(); //解析GPS数据
	printGpsBuffer(); //输出解析后的数据
	delay(1000);
}

//上传数据
void update_sensor_data()
{
	//建立TCP连接
	if (wifi.createTCP(HOST_NAME, HOST_PORT))
	{
		Serial.print("create tcp ok\r\n");

		//整合数据
		jsonToSend = "{\"Latitude\":\"" + String(Save_Data.latitude) + "\"";
		jsonToSend += ",\"Longitude\":\"" + String(Save_Data.longitude) + "\"}";

		//POST报文
		postString = "POST /devices/"; //POST
		postString += DEVICEID;
		postString += "/datapoints?type=3 HTTP/1.1"; //TYPE
		postString += "\r\n";
		postString += "api-key:"; //API-KEY
		postString += apiKey;
		postString += "\r\n";
		postString += "Host:api.heclouds.com\r\n"; //url
		postString += "Connection:close\r\n";
		postString += "Content-Length:";
		postString += jsonToSend.length();
		postString += "\r\n";
		postString += "\r\n";
		postString += jsonToSend; //数据
		postString += "\r\n";
		postString += "\r\n";
		postString += "\r\n";

		const char *postArray = postString.c_str(); //将string转化为char数组
		Serial.println(postArray);
		wifi.send((const uint8_t *)postArray, strlen(postArray)); //send发送命令
		Serial.println("send success");
		if (wifi.releaseTCP())
			Serial.print("release tcp ok\r\n");
		else
			Serial.print("release tcp err\r\n");
		postArray = nullptr; //清空数组
	}
	else
		Serial.print("create tcp err\r\n");
}

void printGpsBuffer()
{
	if (Save_Data.isParseData)
	{
		Save_Data.isParseData = false;
		if (Save_Data.isUsefull)
		{
			Save_Data.isUsefull = false;
			//纬度
			DebugSerial.println(Save_Data.latitude);
			//经度
			DebugSerial.println(Save_Data.longitude);
		}
	}
}

void parseGpsBuffer()
{
	char *subString;
	char *subStringNext;
	if (Save_Data.isGetData)
	{
		Save_Data.isGetData = false;
		for (int i = 0; i <= 6; i++)
		{
			if (i == 0)
			{
				if ((subString = strstr(Save_Data.GPS_Buffer, ",")) == NULL)
					;
			}
			else
			{
				subString++;
				if ((subStringNext = strstr(subString, ",")) != NULL)
				{
					char usefullBuffer[2];
					switch (i)
					{
					case 1:
						memcpy(Save_Data.UTCTime, subString, subStringNext - subString);
						break; //获取UTC时间
					case 2:
						memcpy(usefullBuffer, subString, subStringNext - subString);
						break; //获取UTC时间
					case 3:
						memcpy(Save_Data.latitude, subString, subStringNext - subString);
						break; //获取纬度信息
					case 5:
						memcpy(Save_Data.longitude, subString, subStringNext - subString);
						break; //获取纬度信息
					default:
						break;
					}
					subString = subStringNext;
					Save_Data.isParseData = true;
					if (usefullBuffer[0] == 'A')
						Save_Data.isUsefull = true;
					else if (usefullBuffer[0] == 'V')
						Save_Data.isUsefull = false;
				}
			}
		}
	}
}

void gpsRead()
{
	while (GpsSerial.available())
	{
		gpsRxBuffer[ii++] = GpsSerial.read();
		if (ii == gpsRxBufferLength)
			clrGpsRxBuffer();
	}

	char *GPS_BufferHead;
	char *GPS_BufferTail;
	if ((GPS_BufferHead = strstr(gpsRxBuffer, "$GPRMC,")) != NULL || (GPS_BufferHead = strstr(gpsRxBuffer, "$GNRMC,")) != NULL)
	{
		if (((GPS_BufferTail = strstr(GPS_BufferHead, "\r\n")) != NULL) && (GPS_BufferTail > GPS_BufferHead))
		{
			memcpy(Save_Data.GPS_Buffer, GPS_BufferHead, GPS_BufferTail - GPS_BufferHead);
			Save_Data.isGetData = true;
			clrGpsRxBuffer();
		}
	}
}

void clrGpsRxBuffer(void)
{
	memset(gpsRxBuffer, 0, gpsRxBufferLength); //清空
	ii = 0;
}
