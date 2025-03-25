from flask import Flask, render_template, request, jsonify, session
from datetime import datetime
import uuid
import pickle
import os

app = Flask(__name__)
app.secret_key = '1234'  # Change this for production

# File paths
CHAT_FILE = 'chat_data.pkl'

# Initialize chat storage
def load_chat():
    try:
        if os.path.exists(CHAT_FILE):
            with open(CHAT_FILE, 'rb') as f:
                messages = pickle.load(f)
                # Ensure all messages have IDs
                for msg in messages:
                    if 'id' not in msg:
                        msg['id'] = str(uuid.uuid4())
                return messages
    except Exception as e:
        print(f"Error loading chat: {e}")
    return []

def save_chat(messages):
    try:
        with open(CHAT_FILE, 'wb') as f:
            pickle.dump(messages, f)
    except Exception as e:
        print(f"Error saving chat: {e}")

# Load existing messages
chat_messages = load_chat()

# Streams data
streams = {
    'stream1': {
        'url': 'https://cdn.crichdplays.ru/embed2.php?id=starsp',
        'quality': 'SD',
        'name': 'Willow HD'
    },
    'stream2': {
        'url': 'https://cdn.crichdplays.ru/embed2.php?id=starsp3',
        'quality': 'SD',
        'name': 'Star Sports 1 Hindi'
    },
    'stream3': {
        'url': 'https://cdn.crichdplays.ru/embed2.php?id=spch61',
        'quality': 'SD',
        'name': 'Sky Sports 1 NZ'
    },
    'stream4': {
        'url': 'https://cdn.crichdplays.ru/embed2.php?id=willowextra',
        'quality': 'SD',
        'name': 'Willow 2'
    },
    'stream5': {
        'url': 'https://thedaddy.to/embed/stream-346.php',
        'quality': 'HD',
        'name': 'Willow Cricket'
    },
    'stream6': {
        'url': 'https://thedaddy.to/embed/stream-598.php',
        'quality': 'HD',
        'name': 'Willow Cricket 2'
    },
    'stream7': {
        'url': 'https://thedaddy.to/embed/stream-588.php',
        'quality': 'HD',
        'name': 'Sky Sport 1 NZ'
    },
    'stream8': {
        'url': 'https://thedaddy.to/embed/stream-65.php',
        'quality': 'HD',
        'name': 'SKY Sports Cricket'
    },
    'stream9': {
        'url': 'https://thedaddy.to/embed/stream-369.php',
        'quality': 'HD',
        'name': 'FOX Cricket'
    },
    'stream10': {
        'url': 'https://thedaddy.to/embed/stream-370.php',
        'quality': 'HD',
        'name': 'Astro Cricket'
    },
    'stream11': {
        'url': 'https://www.vidembed.re/stream/e2ae3364-7303-4e24-bc57-2c030f10a38',
        'quality': 'SD',
        'name': 'Sky Sports 1'
    },
    'stream12': {
        'url': 'https://www.vidembed.re/stream/190948cc-9dc1-4c4d-a8cf-f1a0a6346dbc',
        'quality': 'SD',
        'name': 'Sky Sports 2'
    },
    'stream13': {
        'url': 'https://thedaddy.to/embed/stream-368.php',
        'quality': 'SD',
        'name': 'Super Sports Cricket'
    }
}

# Viewer tracking
viewers = {
    'total': 0,
    'current': 0,
    'sessions': set()
}

@app.before_request
def track_viewers():
    if 'user_id' not in session:
        session['user_id'] = str(uuid.uuid4())
        viewers['total'] += 1
    viewers['sessions'].add(session['user_id'])
    viewers['current'] = len(viewers['sessions'])

@app.route('/')
def home():
    return render_template('index.html',
                         streams=streams,
                         active_stream=None,
                         active_stream_id=None,
                         viewers=viewers['current'])

@app.route('/stream/<stream_id>')
def stream(stream_id):
    stream_data = streams.get(stream_id)
    if not stream_data:
        return "Stream not found", 404
    return render_template('index.html',
                         streams=streams,
                         active_stream=stream_data['url'],
                         active_stream_id=stream_id,
                         viewers=viewers['current'])

@app.route('/viewers')
def get_viewers():
    return jsonify({
        'current': viewers['current'],
        'total': viewers['total']
    })

@app.route('/chat/send', methods=['POST'])
def send_message():
    if 'message_id' not in session:
        session['message_id'] = str(uuid.uuid4())
    
    username = request.form.get('username', 'Anonymous').strip()
    message = request.form.get('message', '').strip()
    
    if message:
        timestamp = datetime.now().strftime('%H:%M:%S')
        new_message = {
            'id': str(uuid.uuid4()),
            'session_id': session['message_id'],
            'username': username,
            'message': message,
            'timestamp': timestamp
        }
        chat_messages.append(new_message)
        save_chat(chat_messages)
        
        # Keep only the last 200 messages
        if len(chat_messages) > 200:
            removed = chat_messages.pop(0)
            save_chat(chat_messages)
    
    return jsonify({'status': 'success'})
from flask import request, make_response
import requests

@app.route('/proxy/<path:url>')
def proxy(url):
    # Whitelist only your streaming domains
    allowed_domains = ['cdn.crichdplays.ru', 'thedaddy.to', 'vidembed.re']
    if not any(domain in url for domain in allowed_domains):
        return "Invalid domain", 403
    
    resp = requests.get(url, headers={
        'Referer': 'https://your-render-url.onrender.com/',
        'User-Agent': 'Mozilla/5.0'
    })
    response = make_response(resp.content)
    response.headers['Content-Type'] = resp.headers['Content-Type']
    return response
@app.route('/chat/get')
def get_messages():
    current_session_id = session.get('message_id', '')
    return jsonify({
        'messages': [msg for msg in chat_messages if msg.get('session_id') != current_session_id],
        'session_id': current_session_id
    })

def clean_old_sessions():
    # Clean up old viewer sessions periodically
    pass

if __name__ == '__main__':
    app.run(host='0.0.0.0', debug=True, port=6969)