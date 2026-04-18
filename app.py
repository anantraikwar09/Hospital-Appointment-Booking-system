from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from datetime import datetime

app = Flask(__name__)
# Enable CORS for all routes (allows the React frontend on port 5173 to access this server)
CORS(app)

# --- Database Connection Helper --- #
def get_db_connection():
    return mysql.connector.connect(
        host="localhost",
        user="root",
        password="your_password_here", # IMPORTANT: Set your DB password here
        database="intelhackathon"
    )

# --- Authentication Endpoints --- #

@app.route('/login/admin', methods=['POST'])
def login_admin():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM admins WHERE username=%s AND password=%s", (username, password))
    admin = cursor.fetchone()
    
    cursor.close()
    db.close()
    
    if admin:
        return jsonify({"message": "Success", "id": admin.get('id', 1), "name": admin['username']}), 200
    else:
        return jsonify({"error": "Invalid Admin Credentials"}), 401

@app.route('/login/receptionist', methods=['POST'])
def login_receptionist():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM receptionists WHERE username=%s AND password=%s", (username, password))
    recep = cursor.fetchone()
    
    cursor.close()
    db.close()
    
    if recep:
        return jsonify({"message": "Success", "id": recep.get('id', 1), "name": recep['username']}), 200
    else:
        return jsonify({"error": "Invalid Receptionist Credentials"}), 401

@app.route('/login/patient', methods=['POST'])
def login_patient():
    data = request.get_json()
    target = data.get('idOrName')
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    # Check by both patient_id (cast to string) OR by exact name
    cursor.execute("SELECT * FROM appointments WHERE CAST(patient_id AS CHAR) = %s OR name = %s LIMIT 1", (target, target))
    patient = cursor.fetchone()
    
    cursor.close()
    db.close()
    
    if patient:
        return jsonify({"message": "Success", "id": patient['patient_id'], "name": patient['name']}), 200
    else:
        return jsonify({"error": "Patient not found"}), 401

# --- Appointments Endpoints --- #

@app.route('/appointments', methods=['GET', 'POST'])
def manage_appointments():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute("SELECT * FROM appointments ORDER BY app_time ASC")
        rows = cursor.fetchall()
        
        # Format datetime objects for JSON serialization
        for row in rows:
            if row.get('app_time'):
                row['time'] = row['app_time'].strftime('%Y-%m-%d %H:%M')
                # Also rename patient_id to id for consistency with frontend
                row['id'] = row.pop('patient_id')
        
        cursor.close()
        db.close()
        return jsonify(rows), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        name = data.get('name')
        age = data.get('age')
        reason = data.get('reason')
        # Frontend provides "time" spanning exactly the full standard format e.g., "09:00" or combined "YYYY-MM-DD HH:MM"
        # From frontend AdminDashboard:  { date, time: "09:00" } sent as `time: selectedSlot`? 
        # Actually our frontend does: `appointmentsAPI.create({ ...formData, time: selectedSlot });`
        # wait, `formData` has `name, age, reason, date`.
        date_str = data.get('date')
        time_str = data.get('time')
        
        # If the frontend passes separate date & time fields
        if date_str and time_str and len(time_str) <= 5: 
            requested_time = f"{date_str} {time_str}:00"
        else:
            requested_time = data.get('time') # Fallback if frontend sends exactly datetime format
        
        # Validation checks
        if not (name and age and reason and requested_time):
            return jsonify({"error": "Missing required fields"}), 400
            
        # Check availability
        cursor.execute("SELECT * FROM appointments WHERE app_time = %s", (requested_time,))
        if cursor.fetchone():
            cursor.close()
            db.close()
            return jsonify({"error": "That slot is already booked."}), 409
            
        sql = "INSERT INTO appointments (name, age, reason, app_time) VALUES (%s, %s, %s, %s)"
        cursor.execute(sql, (name, age, reason, requested_time))
        db.commit()
        new_id = cursor.lastrowid
        
        cursor.close()
        db.close()
        return jsonify({"message": "Appointment created", "id": new_id}), 201

@app.route('/appointments/today', methods=['GET'])
def get_today_appointments():
    today = datetime.now().strftime('%Y-%m-%d')
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    cursor.execute("SELECT * FROM appointments WHERE DATE(app_time) = %s ORDER BY app_time ASC", (today,))
    rows = cursor.fetchall()
    
    for row in rows:
        if row.get('app_time'):
            row['time'] = row['app_time'].strftime('%Y-%m-%d %H:%M')
            row['id'] = row.pop('patient_id')
            
    cursor.close()
    db.close()
    return jsonify(rows), 200

@app.route('/appointments/<date_str>/slots', methods=['GET'])
def get_booked_slots(date_str):
    db = get_db_connection()
    cursor = db.cursor()
    cursor.execute("SELECT app_time FROM appointments WHERE DATE(app_time) = %s", (date_str,))
    rows = cursor.fetchall()
    
    booked = [row[0].strftime('%H:%M') for row in rows if row[0]]
    
    cursor.close()
    db.close()
    
    return jsonify({"booked": booked}), 200

@app.route('/appointments/<target_id>/reschedule', methods=['PUT'])
def reschedule_appointment(target_id):
    data = request.get_json()
    new_date = data.get('date')
    new_time = data.get('time')
    requested_time = f"{new_date} {new_time}:00"
    
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    # Check if the new time is booked
    cursor.execute("SELECT * FROM appointments WHERE app_time = %s", (requested_time,))
    if cursor.fetchone():
        cursor.close()
        db.close()
        return jsonify({"error": "Slot already taken"}), 409
        
    # Check if patient exists
    cursor.execute("SELECT * FROM appointments WHERE patient_id = %s", (target_id,))
    if not cursor.fetchone():
        cursor.close()
        db.close()
        return jsonify({"error": "Appointment not found"}), 404
        
    # Update time
    sql_update = "UPDATE appointments SET app_time = %s WHERE patient_id = %s"
    cursor.execute(sql_update, (requested_time, target_id))
    db.commit()
    
    cursor.close()
    db.close()
    return jsonify({"message": "Successfully rescheduled"}), 200

# --- Feedback Endpoints --- #

@app.route('/feedback', methods=['GET', 'POST'])
def handle_feedback():
    db = get_db_connection()
    cursor = db.cursor(dictionary=True)
    
    if request.method == 'GET':
        cursor.execute("SELECT patient_ref AS ref, message FROM feedback")
        rows = cursor.fetchall()
        cursor.close()
        db.close()
        return jsonify(rows), 200
        
    elif request.method == 'POST':
        data = request.get_json()
        patient_ref = data.get('patient_ref')
        message = data.get('message')
        
        if not (patient_ref and message):
            return jsonify({"error": "Missing data"}), 400
            
        sql = "INSERT INTO feedback (patient_ref, message) VALUES (%s, %s)"
        cursor.execute(sql, (patient_ref, message))
        db.commit()
        
        cursor.close()
        db.close()
        return jsonify({"message": "Feedback recorded successfully"}), 201

if __name__ == '__main__':
    print("Starting Flask Web Server on strictly port 5000...")
    app.run(debug=True, host='0.0.0.0', port=5000)
