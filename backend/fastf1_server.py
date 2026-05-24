"""
F1 PitWall — Live Timing Server v2
Subclasses FastF1's SignalRClient to intercept real-time data
from wss://livetiming.formula1.com/signalrcore (FREE, no auth required).
Exposes clean REST endpoints on port 5001.
"""

from flask import Flask, jsonify
from flask_cors import CORS
from fastf1.livetiming.client import SignalRClient
import threading
import time
import logging
import json
import io
from datetime import datetime

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s [%(levelname)s] %(message)s',
    datefmt='%H:%M:%S'
)

app = Flask(__name__)
CORS(app)

# ─────────────────────────────────────────────
# In-memory state
# ─────────────────────────────────────────────
state = {
    'connected': False,
    'session': {},
    'drivers': {},
    'timing': {},
    'tires': {},
    'stints': {},
    'weather': {},
    'track_status': 'AllClear',
    'race_control': [],
    'lap_count': {'current': 0, 'total': 0},
    'last_updated': None,
}
state_lock = threading.Lock()

TRACK_STATUS_MAP = {
    '1': 'AllClear', '2': 'Yellow', '3': 'SCDeployed',
    '4': 'SCReturning', '5': 'Red', '6': 'VSC', '7': 'VSCEnding',
}

TEAM_COLORS = {
    'Mercedes': '#00D2BE', 'Red Bull Racing': '#3671C6',
    'Ferrari': '#E8002D', 'McLaren': '#FF8000',
    'Alpine': '#FF87BC', 'Aston Martin': '#229971',
    'Williams': '#64C4FF', 'RB': '#6692FF',
    'Kick Sauber': '#52E252', 'Haas F1 Team': '#B6BABD',
}

# ─────────────────────────────────────────────
# Null file object — avoids disk writes
# ─────────────────────────────────────────────
class NullFile:
    def write(self, *args): pass
    def flush(self): pass
    def close(self): pass


# ─────────────────────────────────────────────
# Parsers
# ─────────────────────────────────────────────

def parse_timing_data(data):
    lines = data.get('Lines', {}) if isinstance(data, dict) else {}
    for drv, info in lines.items():
        if not isinstance(info, dict): continue
        t = state['timing'].setdefault(drv, {})
        if 'GapToLeader' in info: t['gap'] = info['GapToLeader']
        if 'IntervalToPositionAhead' in info:
            iv = info['IntervalToPositionAhead']
            t['interval'] = iv.get('Value', '') if isinstance(iv, dict) else str(iv)
        if 'NumberOfLaps' in info: t['lap'] = info['NumberOfLaps']
        if 'Position' in info: t['position'] = info['Position']
        if 'InPit' in info: t['in_pit'] = info['InPit']
        if 'PitOut' in info: t['pit_out'] = info['PitOut']
        if 'NumberOfPitStops' in info: t['pit_stops'] = info['NumberOfPitStops']
        if 'LastLapTime' in info:
            llt = info['LastLapTime']
            t['last_lap'] = llt.get('Value', '') if isinstance(llt, dict) else str(llt)
            t['last_lap_pb'] = llt.get('PersonalFastest', False) if isinstance(llt, dict) else False
        if 'BestLapTime' in info:
            blt = info['BestLapTime']
            t['best_lap'] = blt.get('Value', '') if isinstance(blt, dict) else str(blt)
        if 'Sectors' in info:
            sectors = info['Sectors']
            if isinstance(sectors, dict):
                for idx, sec in sectors.items():
                    if isinstance(sec, dict): t[f's{int(idx)+1}'] = sec.get('Value', '')
            elif isinstance(sectors, list):
                for i, sec in enumerate(sectors):
                    if isinstance(sec, dict): t[f's{i+1}'] = sec.get('Value', '')
        if 'Speeds' in info:
            st = info['Speeds'].get('ST', {}) if isinstance(info.get('Speeds'), dict) else {}
            if isinstance(st, dict): t['speed_trap'] = st.get('Value', '')


def parse_timing_app_data(data):
    lines = data.get('Lines', {}) if isinstance(data, dict) else {}
    for drv, info in lines.items():
        if not isinstance(info, dict): continue
        stints = info.get('Stints', {})
        if not stints: continue
        
        parsed_stints = []
        if isinstance(stints, dict):
            for k in sorted(stints.keys(), key=lambda x: int(x) if str(x).isdigit() else 0):
                st = stints[k]
                if isinstance(st, dict):
                    parsed_stints.append(st)
        elif isinstance(stints, list):
            parsed_stints = [s for s in stints if isinstance(s, dict)]
            
        if not parsed_stints: continue
        
        driver_stints = []
        current_lap = 1
        for idx, stint in enumerate(parsed_stints):
            laps = stint.get('TotalLaps', 0)
            driver_stints.append({
                'compound': (stint.get('Compound') or '?').upper(),
                'new': stint.get('New', 'true') in [True, 'true', 'True'],
                'laps_on_tire': laps,
                'stint_number': idx + 1,
                'lap_start': current_lap,
                'lap_end': current_lap + laps - 1 if laps > 0 else None,
            })
            current_lap += laps
            
        state['stints'][drv] = driver_stints
        if driver_stints:
            state['tires'][drv] = driver_stints[-1]



def parse_driver_list(data):
    if not isinstance(data, dict): return
    for drv, info in data.items():
        if not isinstance(info, dict): continue
        team = info.get('TeamName', '')
        color = TEAM_COLORS.get(team, f"#{info.get('TeamColour', 'ef4444')}")
        state['drivers'][drv] = {
            'number': drv,
            'acronym': info.get('Tla', f'#{drv}'),
            'full_name': f"{info.get('FirstName', '')} {info.get('LastName', '')}".strip(),
            'team_name': team,
            'team_color': color,
            'country': info.get('CountryCode', ''),
            'headshot': info.get('HeadshotUrl', ''),
            'racing_number': info.get('RacingNumber', drv),
        }


def parse_session_info(data):
    if not isinstance(data, dict): return
    meeting = data.get('Meeting', {})
    state['session'].update({
        'name': data.get('Name', ''),
        'type': data.get('Type', ''),
        'circuit': meeting.get('Circuit', {}).get('ShortName', ''),
        'country': meeting.get('Country', {}).get('Name', ''),
        'gp_name': meeting.get('Name', ''),
    })


def parse_weather(data):
    if not isinstance(data, dict): return
    state['weather'] = {
        'air_temp': data.get('AirTemp', ''),
        'track_temp': data.get('TrackTemp', ''),
        'humidity': data.get('Humidity', ''),
        'wind_speed': data.get('WindSpeed', ''),
        'wind_direction': data.get('WindDirection', ''),
        'rainfall': data.get('Rainfall', False),
    }


def parse_race_control(data):
    if not isinstance(data, dict): return
    messages = data.get('Messages', {})
    msgs = list(messages.values()) if isinstance(messages, dict) else messages
    for m in (msgs or []):
        if isinstance(m, dict):
            entry = {
                'time': m.get('Utc', ''),
                'category': m.get('Category', ''),
                'message': m.get('Message', ''),
                'flag': m.get('Flag', ''),
            }
            if entry not in state['race_control']:
                state['race_control'].append(entry)
    state['race_control'] = state['race_control'][-20:]


def dispatch(topic, raw_data):
    """Parse raw_data (JSON string or dict) and route to the right parser."""
    try:
        data = json.loads(raw_data) if isinstance(raw_data, str) else raw_data
    except Exception as e:
        logging.warning(f'[dispatch] json parse error: {e}')
        return

    try:
        with state_lock:
            if topic == 'TimingData':
                parse_timing_data(data)
            elif topic == 'TimingAppData':
                parse_timing_app_data(data)
            elif topic == 'DriverList':
                parse_driver_list(data)
            elif topic == 'TrackStatus':
                status = data.get('Status', '1') if isinstance(data, dict) else '1'
                state['track_status'] = TRACK_STATUS_MAP.get(str(status), 'AllClear')
            elif topic == 'SessionInfo':
                parse_session_info(data)
            elif topic == 'LapCount':
                if isinstance(data, dict):
                    state['lap_count'] = {
                        'current': data.get('CurrentLap', 0),
                        'total': data.get('TotalLaps', 0),
                    }
            elif topic == 'WeatherData':
                parse_weather(data)
            elif topic == 'RaceControlMessages':
                parse_race_control(data)

            state['connected'] = True
            state['last_updated'] = datetime.now().isoformat()
            logging.debug(f'Successfully dispatched topic: {topic}')
    except Exception as e:
        logging.exception(f'Error processing topic {topic}: {e}')



# ─────────────────────────────────────────────
# FastF1 SignalRClient subclass
# ─────────────────────────────────────────────

class LiveTimingInterceptor(SignalRClient):
    """
    Subclasses FastF1's SignalRClient.
    Overrides _on_message to route data to our state store
    instead of writing to a file.
    Uses no_auth=True for free access to public timing data.
    """

    def __init__(self):
        # Pass a dummy filename — we'll override file writes
        super().__init__(filename='_live_timing_null.txt',
                         filemode='w',
                         no_auth=True,
                         timeout=0)  # timeout=0 = never exit

    def _run(self):
        """Override to inject NullFile so no actual file is written."""
        self._output_file = NullFile()

        import requests as req
        # Pre-negotiate for AWSALBCORS cookie (required by F1 CDN)
        try:
            r = req.options(self._negotiate_url, headers=self.headers, timeout=10)
            if 'AWSALBCORS' in r.cookies:
                self.headers.update({'Cookie': f"AWSALBCORS={r.cookies['AWSALBCORS']}"})
                logging.info('✅ Got AWSALBCORS cookie')
        except Exception as e:
            logging.warning(f'Pre-negotiate failed (may still work): {e}')

        from signalrcore.hub_connection_builder import HubConnectionBuilder
        options = {
            'verify_ssl': True,
            'headers': self.headers,
            # no access_token_factory = anonymous/no-auth connection
        }

        self._connection = (
            HubConnectionBuilder()
            .with_url(self._connection_url, options=options)
            .build()
        )

        self._connection.on_open(self._on_connect)
        self._connection.on_close(self._on_close)
        self._connection.on('feed', self._on_message)

        self._connection.start()

        while not self._is_connected:
            time.sleep(0.1)

        self._connection.send('Subscribe', [self.topics],
                              on_invocation=self._on_message)
        logging.info(f'📡 Subscribed to {len(self.topics)} topics')

    def _on_message(self, msg):
        """Intercept messages — parse and route to state store."""
        try:
            self._t_last_message = time.time()

            if isinstance(msg, list) and len(msg) >= 2:
                # Feed format: [topic_str, json_data_str_or_dict, timestamp_str]
                topic = msg[0]
                raw_data = msg[1]
                if isinstance(topic, str) and topic:
                    dispatch(topic, raw_data)

            elif hasattr(msg, 'result') and msg.result:
                # CompletionMessage from initial Subscribe — full current state snapshot
                if isinstance(msg.result, dict):
                    for topic, val in msg.result.items():
                        dispatch(topic, val)

        except Exception as e:
            logging.warning(f'_on_message error: {e}')


# ─────────────────────────────────────────────
# Build unified position list & Grid Fallback
# ─────────────────────────────────────────────

GRID_FALLBACK = {
    "1": {"acronym": "NOR", "full_name": "Lando Norris", "team_name": "McLaren", "team_color": "#FF8000"},
    "2": {"acronym": "SAR", "full_name": "Logan Sargeant", "team_name": "Williams", "team_color": "#64C4FF"},
    "3": {"acronym": "VER", "full_name": "Max Verstappen", "team_name": "Red Bull Racing", "team_color": "#3671C6"},
    "4": {"acronym": "NOR", "full_name": "Lando Norris", "team_name": "McLaren", "team_color": "#FF8000"},
    "5": {"acronym": "BOR", "full_name": "Gabriel Bortoleto", "team_name": "Audi", "team_color": "#F50537"},
    "6": {"acronym": "HAD", "full_name": "Isack Hadjar", "team_name": "Red Bull Racing", "team_color": "#3671C6"},
    "10": {"acronym": "GAS", "full_name": "Pierre Gasly", "team_name": "Alpine", "team_color": "#FF87BC"},
    "11": {"acronym": "PER", "full_name": "Sergio Perez", "team_name": "Red Bull Racing", "team_color": "#3671C6"},
    "12": {"acronym": "ANT", "full_name": "Kimi Antonelli", "team_name": "Mercedes", "team_color": "#00D2BE"},
    "14": {"acronym": "ALO", "full_name": "Fernando Alonso", "team_name": "Aston Martin", "team_color": "#229971"},
    "16": {"acronym": "LEC", "full_name": "Charles Leclerc", "team_name": "Ferrari", "team_color": "#E8002D"},
    "18": {"acronym": "STR", "full_name": "Lance Stroll", "team_name": "Aston Martin", "team_color": "#229971"},
    "20": {"acronym": "MAG", "full_name": "Kevin Magnussen", "team_name": "Haas F1 Team", "team_color": "#B6BABD"},
    "22": {"acronym": "TSU", "full_name": "Yuki Tsunoda", "team_name": "RB", "team_color": "#6692FF"},
    "23": {"acronym": "ALB", "full_name": "Alexander Albon", "team_name": "Williams", "team_color": "#64C4FF"},
    "24": {"acronym": "ZHO", "full_name": "Zhou Guanyu", "team_name": "Kick Sauber", "team_color": "#52E252"},
    "27": {"acronym": "HUL", "full_name": "Nico Hulkenberg", "team_name": "Audi", "team_color": "#F50537"},
    "30": {"acronym": "LAW", "full_name": "Liam Lawson", "team_name": "Racing Bulls", "team_color": "#6C98FF"},
    "31": {"acronym": "OCO", "full_name": "Esteban Ocon", "team_name": "Alpine", "team_color": "#FF87BC"},
    "38": {"acronym": "BEA", "full_name": "Oliver Bearman", "team_name": "Haas F1 Team", "team_color": "#B6BABD"},
    "41": {"acronym": "LIN", "full_name": "Arvid Lindblad", "team_name": "Racing Bulls", "team_color": "#6C98FF"},
    "43": {"acronym": "COL", "full_name": "Franco Colapinto", "team_name": "Alpine", "team_color": "#FF87BC"},
    "44": {"acronym": "HAM", "full_name": "Lewis Hamilton", "team_name": "Ferrari", "team_color": "#E8002D"},
    "55": {"acronym": "SAI", "full_name": "Carlos Sainz", "team_name": "Williams", "team_color": "#64C4FF"},
    "63": {"acronym": "RUS", "full_name": "George Russell", "team_name": "Mercedes", "team_color": "#00D2BE"},
    "77": {"acronym": "BOT", "full_name": "Valtteri Bottas", "team_name": "Kick Sauber", "team_color": "#52E252"},
    "81": {"acronym": "PIA", "full_name": "Oscar Piastri", "team_name": "McLaren", "team_color": "#FF8000"},
    "87": {"acronym": "BEA", "full_name": "Oliver Bearman", "team_name": "Haas F1 Team", "team_color": "#B6BABD"},
}

def get_driver_details(drv):
    driver = state['drivers'].get(drv)
    if not driver or not driver.get('full_name') or driver.get('acronym', '').startswith('#'):
        fallback = GRID_FALLBACK.get(drv)
        if fallback:
            return {
                'number': drv,
                'acronym': fallback['acronym'],
                'full_name': fallback['full_name'],
                'team_name': fallback['team_name'],
                'team_color': fallback['team_color'],
                'country': '',
                'headshot': '',
                'racing_number': drv
            }
    if not driver:
        return {
            'number': drv,
            'acronym': f'#{drv}',
            'full_name': f'Driver {drv}',
            'team_name': '',
            'team_color': '#ef4444',
            'country': '',
            'headshot': '',
            'racing_number': drv
        }
    return driver

def build_positions():
    positions = []
    with state_lock:
        for drv, timing in state['timing'].items():
            driver = get_driver_details(drv)
            tires = state['tires'].get(drv, {})
            try:
                pos = int(timing.get('position', 99))
            except (ValueError, TypeError):
                pos = 99

            positions.append({
                'driver_number': drv,
                'position': pos,
                'acronym': driver.get('acronym', f'#{drv}'),
                'full_name': driver.get('full_name', f'Driver {drv}'),
                'team_name': driver.get('team_name', ''),
                'team_color': driver.get('team_color', '#ef4444'),
                'gap': timing.get('gap', ''),
                'interval': timing.get('interval', ''),
                'lap': timing.get('lap', 0),
                'last_lap': timing.get('last_lap', ''),
                'best_lap': timing.get('best_lap', ''),
                's1': timing.get('s1', ''),
                's2': timing.get('s2', ''),
                's3': timing.get('s3', ''),
                'speed_trap': timing.get('speed_trap', ''),
                'pit_stops': timing.get('pit_stops', 0),
                'in_pit': timing.get('in_pit', False),
                'pit_out': timing.get('pit_out', False),
                'last_lap_pb': timing.get('last_lap_pb', False),
                'compound': tires.get('compound', '?'),
                'tire_laps': tires.get('laps_on_tire', 0),
                'stint_number': tires.get('stint_number', 1),
                'new_tire': tires.get('new', True),
            })

    positions.sort(key=lambda x: x['position'])
    return positions


# ─────────────────────────────────────────────
# Background SignalR thread
# ─────────────────────────────────────────────

def start_live_timing():
    while True:
        try:
            logging.info('🔌 Connecting to F1 Live Timing (no auth)...')
            client = LiveTimingInterceptor()
            client.start()  # blocks until disconnect or timeout
        except KeyboardInterrupt:
            break
        except Exception as e:
            logging.error(f'Live timing error: {e}')

        logging.info('⏳ Reconnecting in 15s...')
        with state_lock:
            state['connected'] = False
        time.sleep(15)


# ─────────────────────────────────────────────
# Flask REST Endpoints
# ─────────────────────────────────────────────

@app.route('/api/live/status')
def live_status():
    with state_lock:
        return jsonify({
            'connected': state['connected'],
            'last_updated': state['last_updated'],
            'session': state['session'],
            'track_status': state['track_status'],
            'lap_count': state['lap_count'],
            'driver_count': len(state['drivers']),
            'weather': state['weather'],
        })


@app.route('/api/live/positions')
def live_positions():
    return jsonify(build_positions())


@app.route('/api/live/timing')
def live_timing_endpoint():
    return jsonify({
        'positions': build_positions(),
        'track_status': state['track_status'],
        'session': state['session'],
        'lap_count': state['lap_count'],
        'weather': state['weather'],
        'race_control': state['race_control'][-5:],
        'connected': state['connected'],
        'last_updated': state['last_updated'],
    })


@app.route('/api/live/tires')
def live_tires():
    with state_lock:
        result = {}
        for drv, tire in state['tires'].items():
            driver = get_driver_details(drv)
            result[drv] = {
                **tire,
                'acronym': driver.get('acronym', f'#{drv}'),
                'team_color': driver.get('team_color', '#ef4444'),
            }
    return jsonify(result)


@app.route('/api/live/stints')
def live_stints():
    with state_lock:
        flat_stints = []
        for drv, stints_list in state.get('stints', {}).items():
            driver = get_driver_details(drv)
            for stint in stints_list:
                flat_stints.append({
                    'driver_number': drv,
                    'acronym': driver.get('acronym', f'#{drv}'),
                    'team_color': driver.get('team_color', '#ef4444'),
                    **stint
                })
    return jsonify(flat_stints)



@app.route('/api/live/weather')
def live_weather():
    with state_lock:
        return jsonify(state['weather'])


@app.route('/api/live/race-control')
def race_control():
    with state_lock:
        return jsonify(state['race_control'])


@app.route('/api/live/drivers')
def live_drivers_endpoint():
    with state_lock:
        res = {}
        for drv in state['timing'].keys():
            res[drv] = get_driver_details(drv)
        for drv in state['drivers'].keys():
            if drv not in res:
                res[drv] = get_driver_details(drv)
        return jsonify(res)


@app.route('/api/fastf1/tire_model')
def get_tire_model():
    return jsonify({
        'source': 'FastF1 / F1 Live Timing SignalR',
        'degradation_model': {'Soft': 2.8, 'Medium': 1.4, 'Hard': 0.8},
        'status': 'success',
    })


@app.route('/api/health')
def health():
    return jsonify({
        'status': 'OK',
        'service': 'F1 Live Timing (FastF1 SignalR)',
        'port': 5001,
        'connected': state['connected'],
    })


# ─────────────────────────────────────────────
# Main
# ─────────────────────────────────────────────

if __name__ == '__main__':
    logging.info('🏎️  F1 PitWall — Live Timing Server v2')
    logging.info('📡 Source: wss://livetiming.formula1.com/signalrcore (free)')

    thread = threading.Thread(target=start_live_timing, daemon=True)
    thread.start()

    logging.info('🚀 REST API → http://localhost:5001')
    app.run(port=5001, debug=False, threaded=True, use_reloader=False)
