#include <DHT.h>

// Pin Configurations
#define DHT_PIN 4       
#define DHT_TYPE DHT11  
#define MQ_6_ANALOG_PIN 34  
#define RAIN_SENSOR_PIN 32  

// Initialize DHT sensor
DHT dht(DHT_PIN, DHT_TYPE);

int user_id = 1;

void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  
  // Initialize DHT sensor
  dht.begin();
  
  // Configure sensor pins
  pinMode(MQ_6_ANALOG_PIN, INPUT);
  pinMode(MQ_6_DIGITAL_PIN, INPUT);
  pinMode(RAIN_SENSOR_PIN, INPUT);

  // Seed the random number generator with a unique value
  randomSeed(analogRead(0));

  // Print startup message
  Serial.println("Multi-Sensor Monitoring System");
  Serial.println("-------------------------------");
}

void loop() {
  // Read temperature and humidity from DHT22
  float temperature = dht.readTemperature();  // Celsius
  float humidity = dht.readHumidity();
  
  // Read gas sensor values
  int analogGasValue = analogRead(MQ_6_ANALOG_PIN);
  int digitalGasValue = digitalRead(MQ_6_DIGITAL_PIN);
  
  // Read Rain Sensor
  int rainSensorValue = analogRead(RAIN_SENSOR_PIN);
  int rainDigital = digitalRead(RAIN_SENSOR_PIN);
  
  // Generate a random pressure value between 1000 and 1025
  float pressure = getRandomPressure();
  int ldr = getRandomLDRValue();

  // Check if DHT readings are valid
  if (isnan(temperature) || isnan(humidity)) {
    Serial.println("Failed to read from DHT sensor!");
  } else {
    // Print DHT22 readings
    Serial.print("Temperature: ");
    Serial.print(temperature);
    Serial.println(" °C");
    Serial.print("Humidity: ");
    Serial.print(humidity);
    Serial.println(" %");
  }
  
  // Print MQ-6 gas sensor readings
  Serial.print("Gas Value: ");
  Serial.println(analogGasValue);

  // Print gas detection status
  if (analogGasValue < 1700) {
    Serial.println("WARNING: Gas Detected!");
  }

  // Print random pressure value
  Serial.print("Pressure: ");
  Serial.print(pressure);
  Serial.println(" hPa");

  // Print Rain Sensor Reading
  Serial.print("Rain Sensor Value: ");
  Serial.println(rainSensorValue);

  // Interpret Rain Sensor Reading
  if (rainSensorValue < 2000) {
    Serial.println("Heavy Rain Detected!");
  } else if (rainSensorValue < 3090) {
    Serial.println("Moderate Rain");
  } else {
    Serial.println("No Rain");
  }

  // LDR Sensor Simulation
  if(ldr == 0){
    Serial.println("Night or Dark");
  }
  else{
    Serial.println("Day or Bright");
  }

  // Separator between readings
  Serial.println("-------------------------------");

  // Wait for 2 seconds between readings
  delay(2000);
}

// Function to generate random pressure value
float getRandomPressure() {
  return random(1000, 1026);  // Generates a random integer between 1000 and 1025
}

int ldrValues[] = {0, 0, 0, 0, 1, 1, 1, 1, 1, 1};

int getRandomLDRValue() {
  int randomIndex = random(0, 10);  // Generate a random index between 0 and 9 (array length is 10)
  return ldrValues[randomIndex];  // Return the value at that index (either 0 or 1)
}