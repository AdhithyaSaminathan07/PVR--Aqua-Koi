import axios from 'axios';

// API Service Layer - Refreshed to resolve HMR conflicts
const api = axios.create({
    baseURL: '/api',
});

// Add a request interceptor to include the auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor for Pagination flattening
api.interceptors.response.use(
    (response) => {
        const data = response.data;
        if (data && typeof data === 'object' && !Array.isArray(data)) {
            // Only flatten if we see pagination metadata, indicating a list response
            const hasPagination = 'total' in data || 'pages' in data || 'page' in data;
            if (hasPagination) {
                const listKey = Object.keys(data).find(key => Array.isArray(data[key]));
                if (listKey) {
                    const flattenedData = data[listKey];
                    Object.defineProperty(flattenedData, '_pagination', {
                        value: data,
                        enumerable: false
                    });
                    return { ...response, data: flattenedData };
                }
            }
        }
        return response;
    },
    (error) => Promise.reject(error)
);

// Auth
export const login = (credentials) => api.post('/auth/login', credentials);

// Customers
export const getCustomers = () => api.get('/customers');
export const createCustomer = (data) => api.post('/customers', data);
export const updateCustomer = (id, data) => api.patch(`/customers/${id}`, data);
export const deleteCustomer = (id) => api.delete(`/customers/${id}`);

// Products / Stock
export const getProducts = () => api.get('/products');
export const createProduct = (data) => api.post('/products', data);
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateStock = (id, data) => api.patch(`/products/${id}/stock`, data);

// Complaints
export const getComplaints = () => api.get('/complaints');
export const createComplaint = (data) => api.post('/complaints', data);
export const updateComplaint = (id, data) => api.put(`/complaints/${id}`, data);
export const deleteComplaint = (id) => api.delete(`/complaints/${id}`);
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
export const getAssignedTasks = () => api.get('/tasks/assigned');
export const createTask = (data) => api.post('/tasks', data);
export const updateTaskStatus = (id, status) => api.patch(`/tasks/${id}/status`, { status });

// Services
export const getServices = () => api.get('/services');
export const createService = (data) => api.post('/services', data);
export const getNearbyServices = (lat, lng) => api.get(`/services/nearby?lat=${lat}&lng=${lng}`);
export const updateLifecycle = (id, data) => api.patch(`/services/${id}/lifecycle`, data);
export const getServiceReminders = () => api.get('/services/reminders');
export const addServiceLog = (id, data) => api.post(`/services/${id}/log`, data);


// Employees
export const getEmployees = () => api.get('/employees');
export const createEmployee = (data) => api.post('/employees', data);
export const updateEmployee = (id, data) => api.put(`/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/employees/${id}`);

// Koi Centre Services
export const getKoiEnquiries = () => api.get('/koi/enquiries');
export const createKoiEnquiry = (data) => api.post('/koi/enquiries', data);
export const updateKoiEnquiryStatus = (id, status) => api.patch(`/koi/enquiries/${id}/status`, { status });
export const deleteKoiEnquiry = (id) => api.delete(`/koi/enquiries/${id}`);

export const getKoiOrders = () => api.get('/koi/orders');
export const createKoiOrder = (data) => api.post('/koi/orders', data);
export const updateKoiOrder = (id, data) => api.put(`/koi/orders/${id}`, data);
export const deleteKoiOrder = (id) => api.delete(`/koi/orders/${id}`);
export const updateKoiOrderStatus = (id, data) => api.patch(`/koi/orders/${id}/status`, data);

export const getKoiInvoices = () => api.get('/koi/invoices');
export const createKoiInvoice = (data) => api.post('/koi/invoices', data);
export const getKoiInvoiceById = (id) => api.get(`/koi/invoices/${id}`);

export const getKoiPayments = () => api.get('/koi/payments');
export const createKoiPayment = (data) => api.post('/koi/payments', data);
export const getPendingKoiPayments = () => api.get('/koi/payments/pending');

export const getKoiStock = () => api.get('/koi/inventory');
export const createKoiFoodItem = (data) => api.post('/koi/inventory/items', data);
export const updateKoiFoodItem = (id, data) => api.put(`/koi/inventory/items/${id}`, data);
export const deleteKoiFoodItem = (id) => api.delete(`/koi/inventory/items/${id}`);
export const purchaseKoiStock = (data) => api.post('/koi/inventory/purchase', data);
export const reduceKoiStock = (data) => api.post('/koi/inventory/reduce', data);
export const setKoiStock = (data) => api.post('/koi/inventory/set-stock', data);
export const getLowKoiStock = () => api.get('/koi/inventory/low-stock');
export const getKoiTransactionHistory = (itemId) => api.get(`/koi/inventory/history/${itemId}`);
export const getKoiInventoryAnalytics = () => api.get('/koi/inventory/analytics');

// Suppliers
export const getSuppliers = () => api.get('/koi/suppliers');
export const createSupplier = (data) => api.post('/koi/suppliers', data);
export const updateSupplier = (id, data) => api.patch(`/koi/suppliers/${id}`, data);
export const deleteSupplier = (id) => api.delete(`/koi/suppliers/${id}`);

export const getKoiCustomers = () => api.get('/koi/customers');
export const createKoiCustomer = (data) => api.post('/koi/customers', data);
export const getKoiCustomerById = (id) => api.get(`/koi/customers/${id}`);
export const updateKoiCustomer = (id, data) => api.patch(`/koi/customers/${id}`, data);
export const deleteKoiCustomer = (id) => api.delete(`/koi/customers/${id}`);

// User Management (Boss Only)
export const getUsers = () => api.get('/users');
export const createUser = (data) => api.post('/users', data);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/users/${id}`);

export const getBossStats = () => api.get('/boss/stats');
export const getBossAuditLogs = () => api.get('/boss/audit-logs');

export default api;
