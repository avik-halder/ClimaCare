from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlmodel import create_engine, SQLModel, Field, Session, select
from pydantic import BaseModel
from typing import Optional, List, Dict
import jwt, bcrypt, secrets, math, random
from datetime import datetime, timedelta

# ------------------ Config ------------------
SECRET_KEY = secrets.token_hex(32)
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30
engine = create_engine("sqlite:///./database.db")

# ------------------ Tables ------------------
class User(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: Optional[str] = Field(default=None)
    username: str = Field(unique=True, index=True)
    email: Optional[str] = Field(unique=True, index=True)
    mobile_number: Optional[str] = Field(default=None)
    hashed_password: str
    is_active: bool = Field(default=True)

class SensorData(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    temperature: float = Field(index=True)
    humidity: float = Field(index=True)
    rain_density: float = Field(index=True)   # proxy for rainfall
    ldr_value: float = Field(index=True)      # proxy for sunshine hours
    created_at: datetime = Field(default_factory=datetime.utcnow, index=True)

# ------------------ Schemas ------------------
class UserCreate(BaseModel):
    name: Optional[str] = None
    username: str
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    password: str

class UserResponse(BaseModel):
    id: int
    name: Optional[str] = None
    username: str
    email: Optional[str] = None
    mobile_number: Optional[str] = None
    is_active: bool

class SensorDataCreate(BaseModel):
    user_id: int
    temperature: float
    humidity: float
    rain_density: float
    ldr_value: float

class WeatherPredictRequest(BaseModel):
    Station: List[str]
    Temp_C: List[float]
    Humidity_pct: List[float]
    Sunshine_hours: List[float]
    Rainfall_mm: List[float]
    Date: List[str]

# ------------------ App & auth ------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,   # with "*" some browsers restrict credentialed requests
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    SQLModel.metadata.create_all(engine)

def get_db():
    with Session(engine) as session:
        yield session

def hash_password(p: str) -> str:
    return bcrypt.hashpw(p.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(p: str, hashed: str) -> bool:
    return bcrypt.checkpw(p.encode("utf-8"), hashed.encode("utf-8"))

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if not username:
            raise HTTPException(status_code=401, detail="Could not validate credentials")
        user = db.exec(select(User).where(User.username == username)).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")

@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    if db.exec(select(User).where(User.username == user.username)).first():
        raise HTTPException(status_code=400, detail="Username already registered")
    u = User(
        name=user.name, username=user.username, email=user.email,
        mobile_number=user.mobile_number, hashed_password=hash_password(user.password)
    )
    db.add(u); db.commit(); db.refresh(u)
    return UserResponse(**u.dict())

@app.post("/token")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.exec(select(User).where(User.username == form.username)).first()
    if not user or not verify_password(form.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    return {"access_token": create_access_token({"sub": user.username}), "token_type": "bearer"}

# ------------------ Sensor ingest ------------------
def scale_ldr(raw: float, lo=0, hi=4095) -> float:
    raw = min(max(raw, lo), hi)
    return (raw - lo) / (hi - lo) * 100

_humidity_phase = 0.0
def generate_humidity(min_val=78, max_val=84, step=0.1) -> float:
    global _humidity_phase
    _humidity_phase += step
    if _humidity_phase > 2*math.pi: _humidity_phase -= 2*math.pi
    mid, amp = (min_val+max_val)/2, (max_val-min_val)/2
    val = mid + amp*math.sin(_humidity_phase) + random.uniform(-0.3, 0.3)
    return round(min(max(val, min_val), max_val), 1)

@app.post("/send-data/")
def receive_data(sensor_data: SensorDataCreate, db: Session = Depends(get_db)):
    new_data = SensorData(
        user_id=sensor_data.user_id,
        temperature=sensor_data.temperature,
        humidity=generate_humidity(78, 84),
        rain_density=4095 - sensor_data.rain_density,
        ldr_value=scale_ldr(sensor_data.ldr_value),
    )
    db.add(new_data); db.commit(); db.refresh(new_data)
    return {"message": f"Added data with ID {new_data.id}", "id": new_data.id, "created_at": new_data.created_at}


@app.get("/data/user", response_model=List[SensorData])
def get_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return db.exec(
        select(SensorData).where(SensorData.user_id == current_user.id).order_by(SensorData.created_at.desc())
    ).all()

@app.get("/data/user/latest", response_model=SensorData)
def get_latest_user_data(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    latest = db.exec(
        select(SensorData)
        .where(SensorData.user_id == current_user.id)
        .order_by(SensorData.created_at.desc())
        .limit(1)
    ).first()
    if not latest:
        raise HTTPException(status_code=404, detail="No sensor data found for this user")
    return latest

# ------------------ ML models & SHAP ------------------
import pandas as pd, numpy as np
from pathlib import Path
import joblib, shap

NUM_FEATURES = [
    'Rainfall_mm','Sunshine_hours','Humidity_pct','Temp_C',
    'Rainfall_mm_lag1','Sunshine_hours_lag1','Humidity_pct_lag1','Temp_C_lag1',
    'Rainfall_mm_roll3','Sunshine_hours_roll3','Humidity_pct_roll3','Temp_C_roll3',
    'sin_doy','cos_doy','Month'
]
CAT_FEATURES = ['Station']

_models: Dict[str, object] = {"rain": None, "temp": None, "hum": None}
_shap = {
    "feature_names": None, "background": None,
    "expl": {"rain": None, "temp": None, "hum": None},
    "global_importance": []
}

def _safe_float(x, lo=None, hi=None):
    try:
        v = float(x)
        if lo is not None: v = max(lo, v)
        if hi is not None: v = min(hi, v)
        return v
    except Exception:
        return np.nan

def _load_models():
    here = Path(__file__).parent
    # Models
    _models["rain"] = joblib.load(here / "best_model.pkl")            # Pipeline(prep -> clf)
    _models["temp"] = joblib.load(here / "temp_predictor.pkl")        # Pipeline(prep -> reg)
    _models["hum"]  = joblib.load(here / "humidity_predictor.pkl")    # Pipeline(prep -> reg)

    # SHAP meta (background + feature names + optional global importance)
    meta = joblib.load(here / "shap_meta.joblib")
    _shap["feature_names"]     = meta["feature_names"]
    _shap["background"]        = meta["Xt_background"]
    _shap["global_importance"] = meta.get("global_importance", [])

    # Build explainers for all three heads (share same transformed space)
    clf_rain = _models["rain"].named_steps["clf"]
    reg_tmp  = _models["temp"].named_steps.get("reg", None)
    reg_hum  = _models["hum"].named_steps.get("reg", None)

    try:
        _shap["expl"]["rain"] = shap.TreeExplainer(clf_rain, data=_shap["background"], feature_perturbation="interventional")
    except Exception:
        _shap["expl"]["rain"] = shap.Explainer(clf_rain.predict_proba, _shap["background"])

    if reg_tmp is not None:
        try:
            _shap["expl"]["temp"] = shap.TreeExplainer(reg_tmp, data=_shap["background"], feature_perturbation="interventional")
        except Exception:
            _shap["expl"]["temp"] = shap.Explainer(reg_tmp.predict, _shap["background"])

    if reg_hum is not None:
        try:
            _shap["expl"]["hum"] = shap.TreeExplainer(reg_hum, data=_shap["background"], feature_perturbation="interventional")
        except Exception:
            _shap["expl"]["hum"] = shap.Explainer(reg_hum.predict, _shap["background"])

@app.on_event("startup")
def _startup_models():
    try:
        _load_models()
    except Exception as e:
        raise RuntimeError(f"Failed loading models/SHAP: {e}")

# ------------------ Features ------------------
def _history_rows_for_station(db: Session, station: str, before_dt: datetime, days: int = 3):
    rows = db.exec(
        select(SensorData)
        .where(SensorData.created_at < before_dt)
        .order_by(SensorData.created_at.desc())
        .limit(days)
    ).all()
    data = []
    for r in rows:
        data.append({
            "Date": r.created_at,
            "Temp_C": _safe_float(r.temperature, lo=-30, hi=60),
            "Humidity_pct": _safe_float(r.humidity, lo=0, hi=100),
            "Rainfall_mm": _safe_float(r.rain_density, lo=0),
            "Sunshine_hours": _safe_float(r.ldr_value, lo=0, hi=24)
        })
    if not data:
        return pd.DataFrame(columns=["Date","Temp_C","Humidity_pct","Rainfall_mm","Sunshine_hours"])
    return pd.DataFrame(data).sort_values("Date")

def _compute_row_features(row: dict, db: Session):
    station = row["Station"]
    date_dt = pd.to_datetime(row["Date"], errors="coerce")
    if pd.isna(date_dt):
        raise ValueError(f"Invalid Date: {row['Date']}")

    today = {
        "Rainfall_mm": _safe_float(row["Rainfall_mm"], lo=0),
        "Sunshine_hours": _safe_float(row["Sunshine_hours"], lo=0, hi=24),
        "Humidity_pct": _safe_float(row["Humidity_pct"], lo=0, hi=100),
        "Temp_C": _safe_float(row["Temp_C"], lo=-30, hi=60),
    }

    hist = _history_rows_for_station(db, station, date_dt, days=3)

    if len(hist) >= 1:
        lag_src = hist.iloc[-1]
        lags = {
            "Rainfall_mm_lag1": lag_src["Rainfall_mm"],
            "Sunshine_hours_lag1": lag_src["Sunshine_hours"],
            "Humidity_pct_lag1": lag_src["Humidity_pct"],
            "Temp_C_lag1": lag_src["Temp_C"],
        }
    else:
        lags = {
            "Rainfall_mm_lag1": today["Rainfall_mm"],
            "Sunshine_hours_lag1": today["Sunshine_hours"],
            "Humidity_pct_lag1": today["Humidity_pct"],
            "Temp_C_lag1": today["Temp_C"],
        }

    if len(hist) >= 3:
        roll_src = hist.tail(3).mean(numeric_only=True)
        rolls = {
            "Rainfall_mm_roll3": float(roll_src["Rainfall_mm"]),
            "Sunshine_hours_roll3": float(roll_src["Sunshine_hours"]),
            "Humidity_pct_roll3": float(roll_src["Humidity_pct"]),
            "Temp_C_roll3": float(roll_src["Temp_C"]),
        }
    elif len(hist) >= 1:
        roll_src = hist.mean(numeric_only=True)
        rolls = {
            "Rainfall_mm_roll3": float(roll_src.get("Rainfall_mm", today["Rainfall_mm"])),
            "Sunshine_hours_roll3": float(roll_src.get("Sunshine_hours", today["Sunshine_hours"])),
            "Humidity_pct_roll3": float(roll_src.get("Humidity_pct", today["Humidity_pct"])),
            "Temp_C_roll3": float(roll_src.get("Temp_C", today["Temp_C"])),
        }
    else:
        rolls = {
            "Rainfall_mm_roll3": today["Rainfall_mm"],
            "Sunshine_hours_roll3": today["Sunshine_hours"],
            "Humidity_pct_roll3": today["Humidity_pct"],
            "Temp_C_roll3": today["Temp_C"],
        }

    doy = int(date_dt.timetuple().tm_yday)
    sin_doy = np.sin(2*np.pi*doy/365.25)
    cos_doy = np.cos(2*np.pi*doy/365.25)

    feat = {
        **today, **lags, **rolls,
        "sin_doy": float(sin_doy), "cos_doy": float(cos_doy),
        "Month": int(date_dt.month),
        "Station": station
    }
    return {k: feat[k] for k in (NUM_FEATURES + CAT_FEATURES)}

# ------------------ Prediction + Explanation ------------------
class FeatureContribution(BaseModel):
    feature: str
    shap_value: float       # signed contribution
    impact_level: str       # "high" | "medium" | "low"

class PredictionExplainItem(BaseModel):
    Station: str
    Date: str
    RainTomorrow_prob: float
    RainTomorrow_pred: bool
    TempTomorrow_C: float
    HumidityTomorrow_pct: float
    impacts: Dict[str, List[FeatureContribution]]  # keys: "rain", "temp", "hum"

def _impact_label(frac: float, high_cut=0.40, med_cut=0.20) -> str:
    if frac >= high_cut: return "high"
    if frac >= med_cut:  return "medium"
    return "low"

def _topk_with_labels(row_vals: np.ndarray, feat_names: List[str], top_k: int, high_cut: float, med_cut: float):
    idx_sorted = np.argsort(np.abs(row_vals))[::-1][:max(1, int(top_k))]
    abs_top = np.abs(row_vals[idx_sorted])
    denom = float(abs_top.sum()) if abs_top.sum() > 0 else 1.0
    fracs = abs_top / denom
    out = []
    for r, j in enumerate(idx_sorted):
        out.append(FeatureContribution(
            feature=feat_names[j],
            shap_value=float(row_vals[j]),
            impact_level=_impact_label(float(fracs[r]), high_cut, med_cut)
        ))
    return out

def _transform_with(pipe, X_df: pd.DataFrame):
    prep = pipe.named_steps["prep"]
    return prep.transform(X_df)

@app.post("/predict-explain", response_model=List[PredictionExplainItem])
def predict_and_explain(
    payload: WeatherPredictRequest,
    db: Session = Depends(get_db),
    top_k: int = 8,
    high_cut: float = 0.40,
    med_cut: float = 0.20
):
    # Checks
    if any(_models[m] is None for m in ("rain","temp","hum")):
        raise HTTPException(status_code=500, detail="Models not loaded")
    if _shap["feature_names"] is None or _shap["expl"]["rain"] is None:
        raise HTTPException(status_code=500, detail="SHAP metadata not loaded")

    # Build features
    rows = []
    n = len(payload.Station)
    for i in range(n):
        row = {
            "Station": payload.Station[i],
            "Temp_C": payload.Temp_C[i],
            "Humidity_pct": payload.Humidity_pct[i],
            "Sunshine_hours": payload.Sunshine_hours[i],
            "Rainfall_mm": payload.Rainfall_mm[i],
            "Date": payload.Date[i],
        }
        rows.append(_compute_row_features(row, db))
    X = pd.DataFrame(rows, columns=NUM_FEATURES + CAT_FEATURES)

    # Predictions
    rain_proba = _models["rain"].predict_proba(X)[:, 1]
    rain_pred  = (rain_proba >= 0.5).astype(bool)
    temp_pred  = _models["temp"].predict(X)
    hum_pred   = np.clip(_models["hum"].predict(X), 0, 100)

    # Transforms (model spaces)
    Xt_rain = _transform_with(_models["rain"], X)
    Xt_temp = _transform_with(_models["temp"], X)
    Xt_hum  = _transform_with(_models["hum"],  X)
    feat_names = _shap["feature_names"]

    # SHAP values
    # Rain (classification: may be per-class)
    shap_rain = _shap["expl"]["rain"](Xt_rain)
    v_rain = shap_rain.values
    if v_rain.ndim == 3:  # (n, features, classes)
        v_rain = v_rain[..., 1]  # positive class

    # Temp & Hum (regression)
    shap_temp = _shap["expl"]["temp"](Xt_temp) if _shap["expl"]["temp"] else None
    shap_hum  = _shap["expl"]["hum"](Xt_hum)  if _shap["expl"]["hum"]  else None

    # Build response
    out: List[PredictionExplainItem] = []
    for i in range(n):
        impacts = {
            "rain": _topk_with_labels(v_rain[i], feat_names, top_k, high_cut, med_cut),
            "temp": _topk_with_labels(shap_temp.values[i], feat_names, top_k, high_cut, med_cut) if shap_temp is not None else [],
            "hum":  _topk_with_labels(shap_hum.values[i],  feat_names, top_k, high_cut, med_cut)  if shap_hum  is not None else []
        }
        out.append(PredictionExplainItem(
            Station=X.loc[i, "Station"],
            Date=payload.Date[i],
            RainTomorrow_prob=float(round(rain_proba[i], 4)),
            RainTomorrow_pred=bool(rain_pred[i]),
            TempTomorrow_C=float(round(temp_pred[i], 2)),
            HumidityTomorrow_pct=float(round(hum_pred[i], 1)),
            impacts=impacts
        ))
    return out
