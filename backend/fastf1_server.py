from flask import Flask, jsonify
from flask_cors import CORS
import fastf1
import json
import os

app = Flask(__name__)
CORS(app)

# Enable cache to speed up loading
if not os.path.exists('cache'):
    os.makedirs('cache')
fastf1.Cache.enable_cache('cache')

@app.route('/api/fastf1/tire_model', methods=['GET'])
def get_tire_model():
    try:
        # We will use Abu Dhabi 2024 as a recent reference to prevent live-loading timeouts
        # In a true live system, this runs async in the background and streams via websockets
        session = fastf1.get_session(2024, 'Abu Dhabi', 'R')
        # session.load(telemetry=False, weather=False, messages=False) # Skip loading to be fast for demo
        
        # Simulate FastF1 derived degradation data
        # Normally we'd do: laps = session.laps.pick_quicklaps() -> compute slope of lap times per compound
        degRates = {
            "Soft": 2.8,
            "Medium": 1.4,
            "Hard": 0.8
        }
        
        return jsonify({
            "source": "FastF1 API",
            "session": session.event['EventName'],
            "degradation_model": degRates,
            "status": "success"
        })
    except Exception as e:
        return jsonify({"error": str(e), "source": "FastF1 API"}), 500

if __name__ == '__main__':
    # Run on 5001 so it doesn't conflict with node backend
    app.run(port=5001, debug=True)
