#define STOP 0
#define FORWARD 1
#define BACKWARD 2
#define TURNLEFT 3
#define TURNRIGHT 4

const int wave_input_pin = A0;                  //超声波输入
const int wave_output_pin = A1;                 //超声波输出
const int motor_pin[4] = {A2, A3, A4, A5};      //电机引脚
const int infrared_pin[4] = {8, 9, 10, 11};     //红外循迹引脚
const int stop[4] = {LOW, LOW, LOW, LOW};       //停止状态
const int forward[4] = {LOW, HIGH, HIGH, LOW};  //前进状态
const int backward[4] = {HIGH, LOW, LOW, HIGH}; //后退状态
const int turnleft[4] = {LOW, LOW, HIGH, LOW};  //左转状态
const int turnright[4] = {LOW, HIGH, LOW, LOW}; //右转状态

bool bluetoothstate;
int left_count, right_count;
//float left_speed, right_speeed;
unsigned long new_time,
    old_time;
int now, distance, infrared_read[4];

void setup()
{
    Serial.begin(9600);
    for (int i = 0; i < 4; ++i)
        pinMode(motor_pin[i], OUTPUT);
    for (int i = 0; i < 4; ++i)
        pinMode(infrared_pin[i], INPUT);
    pinMode(wave_input_pin, INPUT);
    pinMode(wave_output_pin, OUTPUT);
    //attachInterrupt(1, left_callback, FALLING);
    //attachInterrupt(0, right_callback, FALLING);
}

void loop()
{
    if (Serial.available() > 0)
    {
        now = Serial.read();
        Serial.println(now);
        if (now == 6)
            bluetoothstate = !bluetoothstate; //蓝牙循迹状态转换
    }
    if (bluetoothstate) //蓝牙遥控模式
    {
        motor_run(now);
    }
    else //红外循迹模式
    {
        distance = get_distance();
        if (distance <= 30)
            motor_run(STOP); //前方有障碍
        else
            infrared_tracking();
    }
}

//速度计算
/*void speed_calculation()
{
    new_time = millis();
    if (abs(new_time - old_time) >= 1000)
    {
        detachInterrupt(0);
        detachInterrupt(1);
        left_speed = (float)left_count * 60 / 20;
        right_speeed = (float)right_count * 60 / 20;
        Serial.print("left:");
        Serial.print(left_speed);
        Serial.print(" right:");
        Serial.println(right_speeed);
        left_count = right_count = 0;
        old_time = millis();
        attachInterrupt(0, right_callback, FALLING);
        attachInterrupt(1, left_callback, FALLING);
    }
}*/

//inline void left_callback() { ++left_count; }

//inline void right_callback() { ++right_count; }

//电机驱动
void motor_run(int state)
{
    switch (state)
    {
    case STOP:
        for (int i = 0; i < 4; ++i)
            digitalWrite(motor_pin[i], stop[i]);
        break;
    case FORWARD:
        for (int i = 0; i < 4; ++i)
            digitalWrite(motor_pin[i], forward[i]);
        break;
    case BACKWARD:
        for (int i = 0; i < 4; ++i)
            digitalWrite(motor_pin[i], backward[i]);
        break;
    case TURNLEFT:
        for (int i = 0; i < 4; ++i)
            digitalWrite(motor_pin[i], turnleft[i]);
        break;
    case TURNRIGHT:
        for (int i = 0; i < 4; ++i)
            digitalWrite(motor_pin[i], turnright[i]);
        break;
    default:
        for (int i = 0; i < 4; ++i)
            digitalWrite(motor_pin[i], stop[i]);
        break;
    }
}

//超声波获取距离
int get_distance()
{
    digitalWrite(wave_output_pin, LOW);
    delayMicroseconds(2);
    digitalWrite(wave_output_pin, HIGH); //发射信号
    delayMicroseconds(10);
    digitalWrite(wave_output_pin, LOW);
    int ret = pulseIn(wave_input_pin, HIGH) / 58; //距离换算为米
    return ret;
}

//红外循迹
void infrared_tracking()
{
    for (int i = 0; i < 4; ++i)
        infrared_read[i] = digitalRead(infrared_pin[i]);
    int left = infrared_read[0] + infrared_read[1];
    int right = infrared_read[2] + infrared_read[3];
    if (left == right)
        motor_run(FORWARD);
    else if (left > right)
        motor_run(TURNLEFT);
    else
        motor_run(TURNRIGHT);
}
