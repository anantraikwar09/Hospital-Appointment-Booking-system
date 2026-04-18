import mysql.connector
from datetime import datetime

db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="09102006",
    database="intelhackathon"
)
cursor = db.cursor()

def check_availability(requested_time):
    cursor.execute("SELECT * FROM appointments WHERE app_time = %s", (requested_time,))
    return cursor.fetchone() is None

def show_available_slots(date_str):
    print(f"\n--- Checking availability for {date_str} ---")
    standard_slots = ["09:00", "10:00", "11:00", "12:00", "14:00", "15:00", "16:00", "17:00"]
    cursor.execute("SELECT app_time FROM appointments WHERE DATE(app_time) = %s", (date_str,))
    booked = [row[0].strftime('%H:%M') for row in cursor.fetchall()]
    available = [slot for slot in standard_slots if slot not in booked]
    print("Available Slots (24hr):", available if available else "None (Fully Booked)")
    return available

def add_appointment_flow():
    print("\n--- New Appointment Registration ---")
    name = input("Enter Patient Name: ")
    age = input("Enter Patient Age: ")
    reason = input("Reason for Visit: ")
    date_str = input("Enter date (YYYY-MM-DD): ")
    available = show_available_slots(date_str)
    time_str = input("Enter preferred time from available list (HH:MM): ")
    requested_time = f"{date_str} {time_str}:00"
    
    if check_availability(requested_time):
        sql = "INSERT INTO appointments (name, age, reason, app_time) VALUES (%s, %s, %s, %s)"
        values = (name, age, reason, requested_time)
        cursor.execute(sql, values)   
        db.commit()
        new_id = cursor.lastrowid
        print(f"Success! Appointment booked. Patient ID is: {new_id}")
    else:
        print("Error: That slot was just taken. Please try again.")

def admin_panel():
    while True:
        print("\n--- ADMIN MENU ---")
        print("1. Add Appointment")
        print("2. View All Appointments")
        print("3. View Feedback")
        print("4. Logout")
        choice = input("Select Option: ")

        if choice == '1':
            add_appointment_flow()
        elif choice == '2':
            cursor.execute("SELECT * FROM appointments")
            rows = cursor.fetchall()
            for row in rows:
                temp_list = list(row)
                temp_list[4] = row[4].strftime('%Y-%m-%d %H:%M')
                print(tuple(temp_list))
        elif choice == '3': 
            print("\n--- PATIENT FEEDBACK ---")
            cursor.execute("SELECT patient_ref, message FROM feedback")
            rows = cursor.fetchall()
    
            if not rows:
                print("No feedback available.")
            else:
                for row in rows:
                    p_info = row[0].split(", ")
                    p_id = p_info[0]
                    p_name = p_info[1]
                    p_msg = row[1]
                    final_tuple = (int(p_id), p_name, p_msg)
                    print(final_tuple)
        elif choice == '4':
            break

def reception_panel():
    while True:
        print("\n--- RECEPTIONIST MENU ---")
        print("1. Add New Appointment")
        print("2. Reschedule Appointment")
        print("3. View Today's Schedule")
        print("4. Logout")
        choice = input("Select Option: ")

        if choice == '1':
            add_appointment_flow()
        elif choice == '2':
            print("\n--- Reschedule Appointment ---")
            target = input("Enter Patient ID or Name: ")
            query_find = "SELECT * FROM appointments WHERE CAST(patient_id AS CHAR) = %s OR name = %s"
            cursor.execute(query_find, (target, target))
            record = cursor.fetchone()
            if record:
                print(f"Current Appointment: {record[1]} at {record[4].strftime('%Y-%m-%d %H:%M')}")
                date_str = input("Enter NEW date (YYYY-MM-DD): ")
                show_available_slots(date_str)
                time_str = input("Enter NEW time (HH:MM): ")
                requested_time = f"{date_str} {time_str}:00"
                if check_availability(requested_time):
                    sql_update = "UPDATE appointments SET app_time = %s WHERE CAST(patient_id AS CHAR) = %s OR name = %s"
                    cursor.execute(sql_update, (requested_time, target, target))
                    db.commit()
                    print("Successfully rescheduled!")
                else:
                    print("Error: That slot is booked.")
            else:
                print("Patient not found.")
        elif choice == '3':
            today = datetime.now().strftime('%Y-%m-%d')
            cursor.execute("SELECT * FROM appointments WHERE DATE(app_time) = %s", (today,))
            data = cursor.fetchall()
            for r in data:
                print((r[0], r[1], r[2], r[3], r[4].strftime('%Y-%m-%d %H:%M')))
        elif choice == '4':
            break

def patient_panel():
    print("\n--- PATIENT LOGIN ---")
    target = input("Enter your Patient ID or Name: ").strip()
    
    cursor.execute("SELECT * FROM appointments WHERE CAST(patient_id AS CHAR) = %s OR name = %s", (target, target))
    patient = cursor.fetchone()
    
    if patient:
        p_id = patient[0]
        p_name = patient[1]
        print(f"\nWelcome back, {p_name}!")
        
        while True:
            print("\n1. View Details\n2. Give Feedback\n3. Logout")
            choice = input("Select Option: ")
            
            if choice == '1':
                print((patient[0], patient[1], patient[2], patient[3], patient[4].strftime('%Y-%m-%d %H:%M')))
            
            elif choice == '2':
                msg = input("Enter your feedback: ")
                ref_info = f"{p_id}, {p_name}" 
                query = "INSERT INTO feedback (patient_ref, message) VALUES (%s, %s)"
                cursor.execute(query, (ref_info, msg))
                db.commit()
                print("Feedback recorded successfully!")
            
            elif choice == '3':
                break
    else:
        print("\n[!] Error: Patient not found.")

def main_menu():
    while True:
        print("\n--- HOSPITAL MANAGEMENT SYSTEM ---")
        print("1. Admin\n2. Receptionist\n3. Patient\n4. Exit")
        choice = input("Select User Type: ")
        if choice == '1':
            user = input("Username: ")
            pw = input("Password: ")
            cursor.execute("SELECT * FROM admins WHERE username=%s AND password=%s", (user, pw))
            if cursor.fetchone(): 
                print("logged in successfully as Admin.")
                admin_panel()
            else: print("Invalid Admin Credentials")
        elif choice == '2':
            user = input("Username: ")
            pw = input("Password: ")
            cursor.execute("SELECT * FROM receptionists WHERE username=%s AND password=%s", (user, pw))
            if cursor.fetchone(): 
                print("logged in successfully as Receptionist.")
                reception_panel()
            else: print("Invalid Receptionist Credentials")
        elif choice == '3':
            patient_panel()
        elif choice == '4':
            print("Goodbye!")
            break

if __name__ == "__main__":
    main_menu()
    print("Closing database connection...")
    cursor.close()  
    db.close()  
    