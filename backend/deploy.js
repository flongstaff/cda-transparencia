#!/usr/bin/env node
/**
 * Deployment script for Carmen de Areco Transparency API
 * Uses environment variables and secrets for secure deployment
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class Deployer {
  constructor() {
    this.env = process.env;
    this.requiredEnvVars = [
      'CLOUDFLARE_ACCOUNT_ID',
      'CLOUDFLARE_ZONE_ID',
      'CLOUDFLARE_API_TOKEN'
    ];
  }

  /**
   * Check if all required environment variables are set
   */
  checkEnvironment() {
    console.log('🔍 Checking environment variables...');

    const missing = this.requiredEnvVars.filter(varName => !this.env[varName]);

    if (missing.length > 0) {
      console.error('❌ Missing required environment variables:');
      missing.forEach(varName => console.error(`   - ${varName}`));
      console.error('\n📝 Please set these environment variables:');
      console.error('   export CLOUDFLARE_ACCOUNT_ID="your-account-id"');
      console.error('   export CLOUDFLARE_ZONE_ID="your-zone-id"');
      console.error('   export CLOUDFLARE_API_TOKEN="your-api-token"');
      return false;
    }

    console.log('✅ All required environment variables are set');
    return true;
  }

  /**
   * Update wrangler.toml with current environment values
   */
  updateWranglerConfig() {
    console.log('📝 Updating wrangler.toml configuration...');

    try {
      let wranglerContent = fs.readFileSync('wrangler.toml', 'utf8');

      // Update zone ID
      wranglerContent = wranglerContent.replace(
        /zone_id = "your-zone-id"/g,
        `zone_id = "${this.env.CLOUDFLARE_ZONE_ID}"`
      );

      // Update KV namespace ID if provided
      if (this.env.CLOUDFLARE_KV_NAMESPACE_ID) {
        wranglerContent = wranglerContent.replace(
          /id = "your-kv-namespace-id"/g,
          `id = "${this.env.CLOUDFLARE_KV_NAMESPACE_ID}"`
        );
        wranglerContent = wranglerContent.replace(
          /preview_id = "your-preview-kv-namespace-id"/g,
          `preview_id = "${this.env.CLOUDFLARE_KV_NAMESPACE_ID}"`
        );
      }

      fs.writeFileSync('wrangler.toml', wranglerContent);
      console.log('✅ wrangler.toml updated with environment values');
      return true;

    } catch (error) {
      console.error('❌ Failed to update wrangler.toml:', error.message);
      return false;
    }
  }

  /**
   * Login to Cloudflare (if needed)
   */
  async login() {
    console.log('🔑 Checking Cloudflare authentication...');

    try {
      // Check if already logged in
      execSync('npx wrangler whoami', { stdio: 'pipe' });
      console.log('✅ Already authenticated with Cloudflare');
      return true;
    } catch (error) {
      console.log('🔑 Authenticating with Cloudflare...');

      try {
        // Use API token for authentication
        execSync(`npx wrangler auth login --api-token ${this.env.CLOUDFLARE_API_TOKEN}`, {
          stdio: 'inherit'
        });
        console.log('✅ Successfully authenticated with Cloudflare');
        return true;
      } catch (loginError) {
        console.error('❌ Failed to authenticate with Cloudflare:', loginError.message);
        return false;
      }
    }
  }

  /**
   * Deploy to Cloudflare Workers
   */
  async deploy() {
    console.log('🚀 Deploying to Cloudflare Workers...');

    try {
      // Deploy with environment variables
      const deployCmd = [
        'npx wrangler deploy',
        '--env production',
        `--compatibility-date ${new Date().toISOString().split('T')[0]}`,
        '--name cda-transparency-api-prod'
      ].join(' ');

      execSync(deployCmd, { stdio: 'inherit' });

      console.log('✅ Successfully deployed to Cloudflare Workers!');
      console.log('\n🌐 API endpoints available at:');
      console.log('   https://api.cda-transparencia.org/health');
      console.log('   https://api.cda-transparencia.org/api/external/all-external-data');
      console.log('   https://api.cda-transparencia.org/api/external/carmen-de-areco');
      console.log('   https://api.cda-transparencia.org/api/external/buenos-aires');
      console.log('   https://api.cda-transparencia.org/api/external/national');

      return true;

    } catch (error) {
      console.error('❌ Deployment failed:', error.message);
      return false;
    }
  }

  /**
   * Test the deployed API
   */
  async testDeployment() {
    console.log('🧪 Testing deployed API...');

    try {
      const response = await fetch('https://api.cda-transparencia.org/health');
      const data = await response.json();

      if (data.status === 'ok') {
        console.log('✅ API is responding correctly');
        console.log(`📊 Service: ${data.service}`);
        console.log(`📅 Version: ${data.version}`);
        return true;
      } else {
        console.error('❌ API health check failed');
        return false;
      }
    } catch (error) {
      console.error('❌ Failed to test API:', error.message);
      console.log('ℹ️  This might be normal if DNS is still propagating');
      return false;
    }
  }

  /**
   * Main deployment process
   */
  async run() {
    console.log('🚀 Starting Carmen de Areco Transparency API deployment...\n');

    // Step 1: Check environment
    if (!this.checkEnvironment()) {
      process.exit(1);
    }

    // Step 2: Update configuration
    if (!this.updateWranglerConfig()) {
      process.exit(1);
    }

    // Step 3: Authenticate
    if (!await this.login()) {
      process.exit(1);
    }

    // Step 4: Deploy
    if (!await this.deploy()) {
      process.exit(1);
    }

    // Step 5: Test (optional)
    await this.testDeployment();

    console.log('\n🎉 Deployment completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Update frontend API configuration to use the new endpoints');
    console.log('   2. Test data integration in the frontend');
    console.log('   3. Monitor API performance and errors');
  }
}

// Run deployment if called directly
if (require.main === module) {
  const deployer = new Deployer();
  deployer.run().catch(error => {
    console.error('❌ Deployment failed:', error);
    process.exit(1);
  });
}

module.exports = Deployer;
