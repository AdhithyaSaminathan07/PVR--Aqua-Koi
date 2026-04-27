const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const dns = require('dns');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

// Fix for ENOTFOUND querySrv issues on some networks
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet()); // Set security HTTP headers
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(hpp()); // Prevent HTTP parameter pollution

// Rate limiting
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5000, // Very high for development
  message: 'Too many requests from this IP, please try again after 1 minute'
});

app.use('/api', limiter);

// Standard Middleware
app.use(cors());
app.use(express.json());

// Routes
// Routes
app.use('/api/auth', require('./routes/Auth/authRoutes'));
app.use('/api/users', require('./routes/Boss/userRoutes'));
app.use('/api/boss', require('./routes/Boss/bossRoutes'));
app.use('/api/customers', require('./routes/Aqua/customerRoutes'));
app.use('/api/products', require('./routes/Aqua/productRoutes'));
app.use('/api/orders', require('./routes/Aqua/orderRoutes'));
app.use('/api/tasks', require('./routes/Staff/taskRoutes'));
app.use('/api/complaints', require('./routes/Aqua/complaintRoutes'));
app.use('/api/services', require('./routes/Aqua/serviceRoutes'));
app.use('/api/employees', require('./routes/Boss/employeeRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));
app.use('/api/system-roles', require('./routes/Boss/roleRoutes'));
app.use('/api/departments', require('./routes/Boss/departmentRoutes'));
app.use('/api/settings', require('./routes/settingsRoutes'));


// Koi Centre Routes
const { protect, authorize } = require('./middleware/authMiddleware');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const KOI_ROLES = ['BOSS', 'MANAGER', 'admin', 'KOI_MANAGER', 'STAFF', 'BRANCH_MANAGER'];

app.use('/api/koi/enquiries', protect, authorize(...KOI_ROLES), require('./routes/Koi/koiEnquiryRoutes'));
app.use('/api/koi/orders', protect, authorize(...KOI_ROLES), require('./routes/Koi/koiOrderRoutes'));
app.use('/api/koi/invoices', protect, authorize(...KOI_ROLES), require('./routes/Koi/koiInvoiceRoutes'));
app.use('/api/koi/payments', protect, authorize(...KOI_ROLES), require('./routes/Koi/koiPaymentRoutes'));
app.use('/api/koi/inventory', protect, authorize(...KOI_ROLES), require('./routes/Koi/koiInventoryRoutes'));
app.use('/api/koi/customers', protect, authorize(...KOI_ROLES), require('./routes/Koi/koiCustomerRoutes'));
app.use('/api/koi/suppliers', protect, authorize(...KOI_ROLES), require('./routes/Koi/supplierRoutes'));

// Error Handling
app.use(notFound);
app.use(errorHandler);


// Database Connection
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/pvr_aqua';

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(async () => {
    console.log('MongoDB connected successfully');

    // Cleanup problematic index if it exists
    try {
      const collection = mongoose.connection.db.collection('settings');
      const indexes = await collection.indexes();
      if (indexes.some(idx => idx.name === 'subdomain_1')) {
        await collection.dropIndex('subdomain_1');
        console.log('Successfully dropped problematic subdomain_1 index');
      }
    } catch (indexErr) {
      console.log('Index cleanup note (safe to ignore):', indexErr.message);
    }

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });
