import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  loginAdmin: (data) => api.post('/login/admin', data),
  loginReceptionist: (data) => api.post('/login/receptionist', data),
  loginPatient: (data) => api.post('/login/patient', data), // expects { idOrName: "value" } based on python code
};

export const appointmentsAPI = {
  getAll: () => api.get('/appointments'),
  getToday: () => api.get('/appointments/today'),
  create: (data) => api.post('/appointments', data),
  reschedule: (id, data) => api.put(`/appointments/${id}/reschedule`, data), // data = { date, time }
  getSlots: (date) => api.get(`/appointments/${date}/slots`), // should return { available: [] }
};

export const feedbackAPI = {
  getAll: () => api.get('/feedback'),
  submit: (data) => api.post('/feedback', data), // data = { patient_ref, message }
};

export default api;
