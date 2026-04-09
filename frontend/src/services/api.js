import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);

// Customers
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);

// Products / Stock
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateStock = (id, data) => api.patch(`/products/${id}/stock`, data);

// Complaints
export const getComplaints = () => api.get('/complaints');
export const createComplaint = (data) => api.post('/complaints', data);
export const updateComplaintStatus = (id, status) => api.patch(`/complaints/${id}/status`, { status });

// Orders / Enquiries
export const getEnquiries = () => api.get('/orders/enquiries');
export const createEnquiry = (data) => api.post('/orders/enquiries', data);
export const getOrders = () => api.get('/orders');
export const createOrder = (data) => api.post('/orders', data);
export const updatePayment = (id, amount) => api.patch(`/orders/${id}/payment`, { amount });
export const updateOrderStatus = (id, status) => api.patch(`/orders/${id}/status`, { status });

// Tasks
export const getTasks = () => api.get('/tasks');
export const createTask = (data) => api.post('/tasks', data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });

// Services
export const getServices = () => api.get('/services');
export const createService = (data) => api.post('/services', data);
export const getNearbyServices = (lat, lng) => api.get(`/services/nearby?lat=${lat}&lng=${lng}`);
export const updateLifecycle = (id, data) => api.patch(`/services/${id}/lifecycle`, data);


// Employees
export const getEmployees = () => api.get('/employees');
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

export default api;

