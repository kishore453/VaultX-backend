require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');
const { configureCloudinary } = require('./src/config/cloudinary');

// Initialise Cloudinary (no-op + warning if credentials are missing)
configureCloudinary();

const PORT = process.env.PORT || 5000;

// Connect to MongoDB then start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 VaultX API running on http://localhost:${PORT}`);
    console.log(`📋 Health check: http://localhost:${PORT}/api/health\n`);
  });
}).catch((err) => {
  console.error('❌ Failed to connect to MongoDB:', err.message);
  process.exit(1);
});
