# Hospital Appointment System

A full-stack web application designed to streamline hospital appointment scheduling. It features role-based access for Administrators, Receptionists, and Patients, facilitating easy management of medical bookings. 

## Technologies Used
- **Frontend:** React, Vite, Tailwind CSS, React Router DOM
- **Backend:** Python, Flask, MySQL Connector
- **Database:** MySQL

## Features
- **Admin Dashboard:** View all hospital metrics, manage appointments, and oversee the system.
- **Receptionist Dashboard:** Manage patient bookings, reschedule appointments, and handle patient feedback.
- **Patient Portal:** Book, view, and manage personal medical appointments.

## Prerequisites
Before running this project, ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/) (for the frontend)
- [Python 3.x](https://www.python.org/) (for the backend)
- [MySQL Server](https://dev.mysql.com/downloads/mysql/)

## Setup and Installation

### 1. Database Configuration
1. Open your MySQL command line or a tool like MySQL Workbench.
2. Create a new database named `intelhackathon`:
   ```sql
   CREATE DATABASE intelhackathon;
   ```
3. Use the provided Python script or manual SQL queries to create the necessary tables (`admins`, `receptionists`, `appointments`, `feedback`).
4. **Important:** Update the database connection credentials in `app.py`:
   ```python
   def get_db_connection():
       return mysql.connector.connect(
           host="localhost",
           user="your_mysql_username", # Change this
           password="your_mysql_password", # Change this
           database="intelhackathon"
       )
   ```

### 2. Backend Setup (Flask API)
1. Open a terminal and navigate to the project root directory.
2. (Optional but recommended) Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/Scripts/activate # On Windows
   ```
3. Install the required Python packages:
   ```bash
   pip install flask flask-cors mysql-connector-python
   ```
4. Start the backend server:
   ```bash
   python app.py
   ```
   The Flask server will start running on `http://127.0.0.1:5000`.

### 3. Frontend Setup (React & Vite)
1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. The application will be accessible in your browser (usually at `http://localhost:5173`).

## Important Note Before Uploading to GitHub
Make sure that your database passwords or sensitive configuration details in `app.py` are either removed or set to dummy values before committing to a public repository!
