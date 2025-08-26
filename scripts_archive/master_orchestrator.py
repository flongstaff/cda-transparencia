#!/usr/bin/env python3
"""
🎯 Carmen de Areco Master Orchestrator
================================================================================
Complete transparency investigation system orchestrator
Ties together all components: data processing, database, API, frontend, and deployment

Usage:
    python3 master_orchestrator.py --mode setup     # Initial setup
    python3 master_orchestrator.py --mode data      # Process and load all data
    python3 master_orchestrator.py --mode serve     # Start all services
    python3 master_orchestrator.py --mode deploy    # Prepare for deployment
    python3 master_orchestrator.py --mode full      # Complete end-to-end process
"""

import os
import sys
import json
import subprocess
import asyncio
import argparse
from pathlib import Path
from datetime import datetime
import logging
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('master_orchestrator.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class MasterOrchestrator:
    """Master orchestrator for the complete transparency system"""
    
    def __init__(self):
        self.base_path = Path(__file__).parent
        self.frontend_path = self.base_path / "frontend"
        self.backend_path = self.base_path / "backend" 
        self.scripts_path = self.base_path / "scripts"
        self.data_path = self.base_path / "data"
        
        self.services = {
            'database': {'status': 'stopped', 'pid': None},
            'backend': {'status': 'stopped', 'pid': None},
            'frontend': {'status': 'stopped', 'pid': None}
        }
    
    def log_phase(self, phase: str, description: str = ""):
        """Log a major phase with formatting"""
        logger.info("=" * 80)
        logger.info(f"🎯 PHASE: {phase}")
        if description:
            logger.info(f"📝 {description}")
        logger.info("=" * 80)
    
    def run_command(self, command: str, cwd: Path = None, background: bool = False) -> subprocess.Popen:
        """Run a command with proper error handling"""
        logger.info(f"🔧 Running: {command}")
        try:
            if background:
                process = subprocess.Popen(
                    command.split(),
                    cwd=cwd or self.base_path,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True
                )
                return process
            else:
                result = subprocess.run(
                    command.split(),
                    cwd=cwd or self.base_path,
                    capture_output=True,
                    text=True,
                    check=True
                )
                if result.stdout:
                    logger.info(f"✅ Output: {result.stdout.strip()}")
                return result
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Command failed: {e}")
            if e.stderr:
                logger.error(f"Error output: {e.stderr}")
            raise
    
    def check_dependencies(self) -> bool:
        """Check if all required dependencies are available"""
        self.log_phase("DEPENDENCY CHECK", "Verifying all required tools and packages")
        
        dependencies = [
            ('node', '--version'),
            ('npm', '--version'),
            ('python3', '--version'),
            ('docker', '--version'),
        ]
        
        missing = []
        for cmd, version_flag in dependencies:
            try:
                result = subprocess.run([cmd, version_flag], capture_output=True, text=True)
                if result.returncode == 0:
                    version = result.stdout.strip()
                    logger.info(f"✅ {cmd}: {version}")
                else:
                    missing.append(cmd)
            except FileNotFoundError:
                missing.append(cmd)
        
        if missing:
            logger.error(f"❌ Missing dependencies: {', '.join(missing)}")
            return False
        
        # Check Python packages
        python_packages = ['pandas', 'requests', 'beautifulsoup4', 'pdfplumber']
        for package in python_packages:
            try:
                subprocess.run([sys.executable, '-c', f'import {package}'], check=True, capture_output=True)
                logger.info(f"✅ Python package: {package}")
            except subprocess.CalledProcessError:
                logger.warning(f"⚠️ Missing Python package: {package}")
        
        return True
    
    def setup_database(self) -> bool:
        """Setup PostgreSQL database"""
        self.log_phase("DATABASE SETUP", "Configuring PostgreSQL database")
        
        try:
            # Check if Docker container exists
            result = subprocess.run(['docker', 'ps', '-a', '--filter', 'name=transparency_portal', '--format', '{{.Names}}'], 
                                  capture_output=True, text=True)
            
            if 'transparency_portal' not in result.stdout:
                logger.info("🐳 Creating PostgreSQL Docker container...")
                self.run_command(
                    'docker run --name transparency_portal -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=transparency_portal -p 5432:5432 -d postgres:13'
                )
                time.sleep(10)  # Wait for container to start
            
            # Start container if stopped
            self.run_command('docker start transparency_portal')
            logger.info("✅ Database container running")
            
            # Wait for database to be ready
            logger.info("⏳ Waiting for database to be ready...")
            time.sleep(5)
            
            self.services['database']['status'] = 'running'
            return True
            
        except Exception as e:
            logger.error(f"❌ Database setup failed: {e}")
            return False
    
    def process_all_data(self) -> bool:
        """Process all data using our scripts"""
        self.log_phase("DATA PROCESSING", "Processing all source files and loading into database")
        
        try:
            # Run data preservation
            logger.info("🗄️ Running data preservation...")
            self.run_command(f'python3 {self.scripts_path}/data_preservation.py')
            
            # Populate database
            logger.info("💾 Populating database...")
            env = os.environ.copy()
            env.update({
                'DB_HOST': 'localhost',
                'DB_PORT': '5432',
                'DB_NAME': 'transparency_portal',
                'DB_USER': 'postgres',
                'DB_PASSWORD': 'postgres'
            })
            
            # Run populate script with environment variables
            process = subprocess.run(
                [sys.executable, '-c', '''
import os
import sys
sys.path.append("/Users/flong/Developer/cda-transparencia/backend/src")
os.environ["DB_HOST"] = "localhost"
os.environ["DB_PORT"] = "5432"
os.environ["DB_NAME"] = "transparency_portal"
os.environ["DB_USER"] = "postgres"
os.environ["DB_PASSWORD"] = "postgres"
exec(open("backend/src/populate-db.js").read().replace("const", "# const").replace("require", "# require"))
                '''],
                cwd=self.base_path,
                capture_output=True,
                text=True
            )
            
            # Alternative: run Node.js populate script directly
            self.run_command('node src/populate-db.js', cwd=self.backend_path)
            
            logger.info("✅ All data processed and loaded")
            return True
            
        except Exception as e:
            logger.error(f"❌ Data processing failed: {e}")
            return False
    
    def setup_backend(self) -> bool:
        """Setup and start backend API"""
        self.log_phase("BACKEND SETUP", "Installing dependencies and starting API server")
        
        try:
            # Install dependencies
            if not (self.backend_path / "node_modules").exists():
                logger.info("📦 Installing backend dependencies...")
                self.run_command('npm install', cwd=self.backend_path)
            
            # Start backend server
            logger.info("🚀 Starting backend server...")
            process = self.run_command('node src/server.js', cwd=self.backend_path, background=True)
            
            self.services['backend']['status'] = 'running'
            self.services['backend']['pid'] = process.pid
            
            # Wait and verify server is running
            time.sleep(3)
            try:
                import requests
                response = requests.get('http://localhost:3000', timeout=5)
                if response.status_code == 200:
                    logger.info("✅ Backend API server running on http://localhost:3000")
                    return True
            except:
                pass
            
            logger.info("⚠️ Backend server started but health check failed")
            return True
            
        except Exception as e:
            logger.error(f"❌ Backend setup failed: {e}")
            return False
    
    def setup_frontend(self) -> bool:
        """Setup and start frontend development server"""
        self.log_phase("FRONTEND SETUP", "Installing dependencies and starting development server")
        
        try:
            # Install dependencies
            if not (self.frontend_path / "node_modules").exists():
                logger.info("📦 Installing frontend dependencies...")
                self.run_command('npm install', cwd=self.frontend_path)
            
            # Start development server
            logger.info("🚀 Starting frontend development server...")
            process = self.run_command('npm run dev', cwd=self.frontend_path, background=True)
            
            self.services['frontend']['status'] = 'running'
            self.services['frontend']['pid'] = process.pid
            
            # Wait for server to start
            time.sleep(5)
            logger.info("✅ Frontend development server starting on http://localhost:5173")
            
            return True
            
        except Exception as e:
            logger.error(f"❌ Frontend setup failed: {e}")
            return False
    
    def verify_system(self) -> bool:
        """Verify all components are working"""
        self.log_phase("SYSTEM VERIFICATION", "Testing all components and endpoints")
        
        checks = []
        
        # Check database
        try:
            result = subprocess.run(['docker', 'exec', 'transparency_portal', 'psql', '-U', 'postgres', '-d', 'transparency_portal', '-c', 'SELECT COUNT(*) FROM salaries;'], 
                                  capture_output=True, text=True)
            if result.returncode == 0:
                logger.info("✅ Database connection and data verified")
                checks.append(True)
            else:
                logger.warning("⚠️ Database check failed")
                checks.append(False)
        except Exception as e:
            logger.error(f"❌ Database verification failed: {e}")
            checks.append(False)
        
        # Check backend API
        try:
            import requests
            endpoints = [
                'http://localhost:3000',
                'http://localhost:3000/api/salaries',
                'http://localhost:3000/api/tenders',
                'http://localhost:3000/api/reports'
            ]
            
            for endpoint in endpoints:
                try:
                    response = requests.get(endpoint, timeout=10)
                    if response.status_code == 200:
                        logger.info(f"✅ API endpoint working: {endpoint}")
                        checks.append(True)
                    else:
                        logger.warning(f"⚠️ API endpoint returned {response.status_code}: {endpoint}")
                        checks.append(False)
                except requests.RequestException as e:
                    logger.warning(f"⚠️ API endpoint failed: {endpoint} - {e}")
                    checks.append(False)
        except ImportError:
            logger.warning("⚠️ Requests library not available for API testing")
        
        # Check frontend
        try:
            import requests
            response = requests.get('http://localhost:5173', timeout=10)
            if response.status_code == 200 and 'Portal de Transparencia' in response.text:
                logger.info("✅ Frontend application verified")
                checks.append(True)
            else:
                logger.warning("⚠️ Frontend verification failed")
                checks.append(False)
        except Exception as e:
            logger.warning(f"⚠️ Frontend verification failed: {e}")
            checks.append(False)
        
        success_rate = sum(checks) / len(checks) * 100 if checks else 0
        logger.info(f"📊 System verification: {success_rate:.1f}% successful")
        
        return success_rate > 75  # Consider successful if > 75% of checks pass
    
    def display_status(self):
        """Display current system status"""
        self.log_phase("SYSTEM STATUS", "Current status of all services")
        
        logger.info("🌐 SERVICE STATUS:")
        for service, info in self.services.items():
            status_emoji = "🟢" if info['status'] == 'running' else "🔴"
            pid_info = f" (PID: {info['pid']})" if info['pid'] else ""
            logger.info(f"  {status_emoji} {service.title()}: {info['status']}{pid_info}")
        
        logger.info("\n🔗 ACCESS POINTS:")
        logger.info("  🏠 Frontend:  http://localhost:5173")
        logger.info("  🔧 Backend:   http://localhost:3000")
        logger.info("  📊 API Docs:  http://localhost:3000/api")
        logger.info("  🐳 Database:  localhost:5432 (PostgreSQL)")
        
        logger.info("\n📊 DATA SUMMARY:")
        try:
            with open(self.data_path / "preserved" / "metadata" / "preservation_metadata.json") as f:
                metadata = json.load(f)
                logger.info(f"  📁 Total Files: {metadata['total_files']}")
                logger.info(f"  📅 Years: {min(metadata['years_covered'])}-{max(metadata['years_covered'])}")
                logger.info(f"  🗂️ File Types: {len(metadata['file_types'])}")
        except Exception:
            logger.info("  📁 Data metadata not available")
    
    def cleanup(self):
        """Cleanup running services"""
        logger.info("🧹 Cleaning up services...")
        
        for service, info in self.services.items():
            if info['pid']:
                try:
                    import psutil
                    process = psutil.Process(info['pid'])
                    process.terminate()
                    logger.info(f"✅ Terminated {service} (PID: {info['pid']})")
                except Exception as e:
                    logger.warning(f"⚠️ Could not terminate {service}: {e}")
    
    def run_mode(self, mode: str) -> bool:
        """Run specific mode"""
        success = True
        
        if mode == 'setup':
            self.log_phase("SETUP MODE", "Initial system setup")
            success &= self.check_dependencies()
            success &= self.setup_database()
            
        elif mode == 'data':
            self.log_phase("DATA MODE", "Data processing and database loading")
            success &= self.process_all_data()
            
        elif mode == 'serve':
            self.log_phase("SERVE MODE", "Starting all services")
            success &= self.setup_database()
            success &= self.setup_backend()
            success &= self.setup_frontend()
            success &= self.verify_system()
            
        elif mode == 'deploy':
            self.log_phase("DEPLOY MODE", "Preparing for deployment")
            # Build frontend for production
            logger.info("🏗️ Building frontend for production...")
            self.run_command('npm run build', cwd=self.frontend_path)
            logger.info("✅ Deployment preparation complete")
            
        elif mode == 'full':
            self.log_phase("FULL MODE", "Complete end-to-end setup and deployment")
            success &= self.check_dependencies()
            success &= self.setup_database()
            success &= self.process_all_data()
            success &= self.setup_backend()
            success &= self.setup_frontend()
            success &= self.verify_system()
            
        else:
            logger.error(f"❌ Unknown mode: {mode}")
            return False
        
        return success
    
    def interactive_mode(self):
        """Interactive mode for manual control"""
        while True:
            print("\n🎯 Carmen de Areco Master Orchestrator")
            print("=" * 50)
            print("1. 🔧 Setup System")
            print("2. 📊 Process Data")  
            print("3. 🚀 Start Services")
            print("4. ✅ Verify System")
            print("5. 📈 Show Status")
            print("6. 🧹 Cleanup")
            print("7. 🚪 Exit")
            
            choice = input("\nSelect option (1-7): ").strip()
            
            try:
                if choice == '1':
                    self.run_mode('setup')
                elif choice == '2':
                    self.run_mode('data')
                elif choice == '3':
                    self.setup_backend()
                    self.setup_frontend()
                elif choice == '4':
                    self.verify_system()
                elif choice == '5':
                    self.display_status()
                elif choice == '6':
                    self.cleanup()
                elif choice == '7':
                    self.cleanup()
                    break
                else:
                    print("❌ Invalid option")
            except KeyboardInterrupt:
                print("\n🛑 Operation interrupted")
            except Exception as e:
                print(f"❌ Error: {e}")

def main():
    parser = argparse.ArgumentParser(description='Carmen de Areco Master Orchestrator')
    parser.add_argument('--mode', choices=['setup', 'data', 'serve', 'deploy', 'full', 'interactive'], 
                       default='interactive', help='Operation mode')
    parser.add_argument('--no-cleanup', action='store_true', help='Skip cleanup on exit')
    
    args = parser.parse_args()
    
    orchestrator = MasterOrchestrator()
    
    try:
        logger.info("🎯 Carmen de Areco Master Orchestrator Starting...")
        logger.info(f"📍 Base Path: {orchestrator.base_path}")
        logger.info(f"🎮 Mode: {args.mode}")
        
        if args.mode == 'interactive':
            orchestrator.interactive_mode()
        else:
            success = orchestrator.run_mode(args.mode)
            
            if success:
                logger.info("✅ All operations completed successfully!")
                if args.mode in ['serve', 'full']:
                    orchestrator.display_status()
                    logger.info("\n🎉 System is ready! Access the dashboard at http://localhost:5173")
                    logger.info("Press Ctrl+C to stop services...")
                    try:
                        while True:
                            time.sleep(60)
                    except KeyboardInterrupt:
                        logger.info("🛑 Shutting down...")
            else:
                logger.error("❌ Some operations failed. Check logs above.")
                sys.exit(1)
    
    except KeyboardInterrupt:
        logger.info("🛑 Interrupted by user")
    except Exception as e:
        logger.error(f"❌ Unexpected error: {e}")
        sys.exit(1)
    finally:
        if not args.no_cleanup:
            orchestrator.cleanup()

if __name__ == "__main__":
    main()