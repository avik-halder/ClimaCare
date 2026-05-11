# ClimaCare - Explainable IoT-ML Microclimate Forecasting System

ClimaCare is an IoT-based weather monitoring and machine learning system for real-time microclimate forecasting. It uses ESP32 sensor data, machine learning models, and Explainable AI to predict rainfall, temperature, and humidity with interpretable explanations.

---

## Features

- Real-time weather data monitoring
- ESP32-based IoT sensor integration
- User registration and login system
- JWT-based authentication
- Weather data storage using SQLite
- Rainfall prediction
- Temperature prediction
- Humidity prediction
- SHAP-based Explainable AI
- FastAPI backend
- React frontend dashboard
- Real-time prediction visualization

---

## Tech Stack

### Backend

- Python
- FastAPI
- SQLModel
- SQLite
- JWT Authentication
- bcrypt
- Scikit-learn
- XGBoost
- Joblib
- SHAP
- Pandas
- NumPy

### Frontend

- React
- JavaScript
- Tailwind CSS
- Axios
- Chart Visualization

### IoT Hardware

- ESP32
- DHT21 Temperature and Humidity Sensor
- Rain Sensor
- LDR Sensor

---

## Machine Learning Models

The system uses trained machine learning models for:

- Rainfall classification
- Next-day temperature prediction
- Next-day humidity prediction

The main deployed models include:

- XGBoost Classifier
- XGBoost Regressor
- Random Forest-based models

---

## Explainable AI

SHAP is used to explain model predictions by showing the impact of different weather features such as:

- Rainfall
- Humidity
- Temperature
- Sunshine hours
- Lag features
- Rolling average features
- Seasonal features

---

## Project Structure

```bash
Weather Monitoring System/
│
├── backend/
│   ├── xai.py
│   ├── best_model.pkl
│   ├── temp_predictor.pkl
│   ├── humidity_predictor.pkl
│   ├── shap_meta.joblib
│   ├── database.db
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── README.md
```

---

## Backend Setup

```bash
cd backend
python -m venv env
env\Scripts\activate
pip install -r requirements.txt
```

---

## Run Backend

```bash
python -m fastapi dev xai.py
```

Backend will run at:

```bash
http://127.0.0.1:8000
```

API documentation:

```bash
http://127.0.0.1:8000/docs
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm start
```

Frontend will run at:

```bash
http://localhost:3000
```

---

## API Endpoints

### Authentication

```bash
POST /register
POST /token
```

### Sensor Data

```bash
POST /send-data/
GET /data/user
GET /data/user/latest
```

### Prediction and Explanation

```bash
POST /predict-explain
```

---

## Example Prediction Output

The prediction API returns:

- Rain tomorrow probability
- Rain tomorrow prediction
- Tomorrow temperature
- Tomorrow humidity
- SHAP feature contribution explanations

---

## Research Purpose

This project aims to provide a low-cost, explainable, and real-time microclimate forecasting system for agriculture, environmental monitoring, and smart weather decision support.

---

## License

This project is licensed under the MIT License.