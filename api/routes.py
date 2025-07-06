from flask import Flask, request, jsonify, make_response
import jwt
import datetime

app = Flask(__name__)
SECRET_KEY = 'your-secret-key'

# Fake user database
USERS = {
    "test@example.com": "password123"
}

@app.route('/login', methods=['POST', 'OPTIONS'])
def login():
    try:
        if request.method == 'OPTIONS':
            print("OPTIONS request received")
            response = make_response('', 200)
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

        print("POST request received")

        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        print(f"Login attempt: {email}, {password}")

        if USERS.get(email) == password:
            token = jwt.encode({
                'email': email,
                'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=1)
            }, SECRET_KEY, algorithm='HS256')

            response = jsonify({'token': token})
            response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response

        response = jsonify({'error': 'Invalid credentials'})
        response.headers['Access-Control-Allow-Origin'] = 'http://localhost:5173'
        response.headers['Access-Control-Allow-Credentials'] = 'true'
        return response, 401

    except Exception as e:
        print("ERROR:", str(e))
        return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    app.run(port=5050, debug=True)
