// Test database connection
const sequelize = require('./src/config/database');

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection successful!');
    
    // Test a simple query
    const result = await sequelize.query('SELECT COUNT(*) FROM property_declarations');
    console.log(`📊 Property declarations count: ${result[0][0].count}`);
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
  } finally {
    await sequelize.close();
  }
}

testDatabaseConnection();