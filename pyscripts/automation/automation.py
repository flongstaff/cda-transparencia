#!/usr/bin/env python3
"""
Complete Automation Script for Carmen de Areco Transparency System
This script orchestrates the entire autonomous transparency monitoring system
"""

import subprocess
import sys
import time
import logging
from pathlib import Path
from datetime import datetime

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - SYSTEM_AUTOMATION - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def run_command(command, description, cwd=None):
    """Run a shell command and log the output"""
    logger.info(f"🚀 Executing: {description}")
    logger.debug(f"Command: {command}")
    
    try:
        result = subprocess.run(
            command, 
            shell=True, 
            cwd=cwd,
            capture_output=True, 
            text=True,
            timeout=300  # 5 minute timeout
        )
        
        if result.returncode == 0:
            logger.info(f"✅ {description} completed successfully")
            if result.stdout:
                logger.debug(f"Output: {result.stdout}")
        else:
            logger.error(f"❌ {description} failed with return code {result.returncode}")
            if result.stderr:
                logger.error(f"Error: {result.stderr}")
        
        return result.returncode == 0
    except subprocess.TimeoutExpired:
        logger.error(f"⏰ {description} timed out")
        return False
    except Exception as e:
        logger.error(f"💥 {description} failed with exception: {e}")
        return False

def setup_environment():
    """Setup the required environment and dependencies"""
    logger.info("🔧 Setting up environment...")
    
    # Check if we're in the right directory
    if not Path("carmen_transparencia").exists():
        logger.error("🚨 Please run this script from the project root directory")
        return False
    
    # Install Python dependencies
    deps_commands = [
        ("pip install -r requirements.txt", "Installing Python requirements"),
        ("pip install schedule requests beautifulsoup4 pandas numpy networkx matplotlib seaborn scipy fitz pdfplumber tabula-py", "Installing additional Python packages"),
    ]
    
    for command, description in deps_commands:
        if not run_command(command, description):
            logger.warning(f"⚠️  {description} failed, continuing...")
    
    # Setup frontend dependencies
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        if not run_command("npm install", "Installing frontend dependencies", str(frontend_dir)):
            logger.warning("⚠️  Frontend setup failed, continuing...")
    
    logger.info("✅ Environment setup completed")
    return True

def collect_new_documents():
    """Collect new documents from official sources"""
    logger.info("📄 Collecting new documents...")
    
    # Run document collection
    commands = [
        ("python scripts/scrapers/bora_scraper.py", "Collecting BORA documents"),
        ("python carmen_transparencia/cli.py scrape live --output data/live_scrape", "Scraping live documents"),
        ("python scripts/scrapers/pdf_extractor.py", "Extracting PDF data"),
    ]
    
    for command, description in commands:
        run_command(command, description)
    
    logger.info("✅ Document collection completed")

def process_documents():
    """Process collected documents"""
    logger.info("⚙️ Processing documents...")
    
    # Process documents
    commands = [
        ("python carmen_transparencia/cli.py process documents data/live_scrape data/processed", "Processing documents"),
        ("python scripts/convert_pdf_extracts_to_csv.py", "Converting PDF extracts to CSV"),
    ]
    
    for command, description in commands:
        run_command(command, description)
    
    logger.info("✅ Document processing completed")

def run_analysis():
    """Run all analysis components"""
    logger.info("🔍 Running analysis...")
    
    # Run analysis components
    commands = [
        ("python scripts/audit/anomaly_detection_system.py", "Running anomaly detection"),
        ("python scripts/audit/comparative_analysis_system.py", "Running comparative analysis"),
        ("python scripts/osint/municipality_osint_framework.py", "Running OSINT analysis"),
        ("python scripts/document_anomaly_detector.py", "Running document anomaly detection"),
    ]
    
    for command, description in commands:
        run_command(command, description)
    
    logger.info("✅ Analysis completed")

def update_database():
    """Update the main database with new findings"""
    logger.info("💾 Updating database...")
    
    # Update database
    commands = [
        ("python carmen_transparencia/cli.py populate from_json data/processed/summary.json documents", "Populating database from JSON"),
        ("python scripts/audit/financial_irregularity_tracker.py", "Tracking financial irregularities"),
    ]
    
    for command, description in commands:
        run_command(command, description)
    
    logger.info("✅ Database updated")

def generate_dashboard():
    """Generate public dashboard"""
    logger.info("📊 Generating public dashboard...")
    
    # Generate dashboard
    commands = [
        ("python scripts/citizen_dashboard_generator.py", "Generating citizen dashboard"),
    ]
    
    for command, description in commands:
        run_command(command, description)
    
    logger.info("✅ Dashboard generated")

def deploy_frontend():
    """Deploy frontend if needed"""
    logger.info("🌐 Deploying frontend...")
    
    frontend_dir = Path("frontend")
    if frontend_dir.exists():
        commands = [
            ("npm run build", "Building frontend"),
        ]
        
        for command, description in commands:
            run_command(command, description, str(frontend_dir))
    
    logger.info("✅ Frontend deployment completed")

def run_full_cycle():
    """Run complete automation cycle"""
    logger.info("🔄 Starting complete automation cycle...")
    start_time = time.time()
    
    try:
        # 1. Collect new documents
        collect_new_documents()
        
        # 2. Process documents
        process_documents()
        
        # 3. Run analysis
        run_analysis()
        
        # 4. Update database
        update_database()
        
        # 5. Generate dashboard
        generate_dashboard()
        
        # 6. Deploy frontend
        deploy_frontend()
        
        elapsed_time = time.time() - start_time
        logger.info(f"✅ Complete automation cycle finished in {elapsed_time:.1f} seconds")
        
    except Exception as e:
        logger.error(f"💥 Automation cycle failed: {e}")
        return False
    
    return True

def run_continuous_monitoring():
    """Run continuous monitoring system"""
    logger.info("🔄 Starting continuous monitoring...")
    
    # Import and run the autonomous system
    try:
        sys.path.append(str(Path(__file__).parent))
        from scripts.autonomous_transparency_system import AutonomousTransparencySystem
        
        system = AutonomousTransparencySystem()
        system.start_continuous_monitoring()
        
    except Exception as e:
        logger.error(f"💥 Continuous monitoring failed: {e}")
        return False
    
    return True

def show_status():
    """Show system status"""
    logger.info("📋 System Status Report")
    logger.info("=" * 50)
    
    # Check required files/directories
    required_paths = [
        "carmen_transparencia",
        "scripts",
        "data",
        "frontend"
    ]
    
    for path in required_paths:
        if Path(path).exists():
            logger.info(f"✅ {path}")
        else:
            logger.warning(f"❌ {path}")
    
    # Show recent data
    data_dir = Path("data")
    if data_dir.exists():
        recent_files = sorted(data_dir.rglob("*"), key=lambda x: x.stat().st_mtime, reverse=True)[:5]
        logger.info(f"\n📅 Recent files in data directory:")
        for file in recent_files:
            if file.is_file():
                mtime = datetime.fromtimestamp(file.stat().st_mtime)
                logger.info(f"  - {file.name} ({mtime.strftime('%Y-%m-%d %H:%M')})")
    
    logger.info("=" * 50)

def main():
    """Main entry point"""
    logger.info("🏛️ Carmen de Areco Transparency Automation System")
    logger.info("=" * 60)
    
    if len(sys.argv) < 2:
        print("""
Available commands:
  setup          - Setup environment and dependencies
  collect        - Collect new documents
  process        - Process collected documents
  analyze        - Run analysis on documents
  update-db      - Update database with new findings
  dashboard      - Generate public dashboard
  deploy         - Deploy frontend
  full-cycle     - Run complete automation cycle
  continuous     - Run continuous monitoring system
  status         - Show system status
  help           - Show this help message
        """)
        return
    
    command = sys.argv[1]
    
    if command == "setup":
        setup_environment()
    elif command == "collect":
        collect_new_documents()
    elif command == "process":
        process_documents()
    elif command == "analyze":
        run_analysis()
    elif command == "update-db":
        update_database()
    elif command == "dashboard":
        generate_dashboard()
    elif command == "deploy":
        deploy_frontend()
    elif command == "full-cycle":
        run_full_cycle()
    elif command == "continuous":
        run_continuous_monitoring()
    elif command == "status":
        show_status()
    elif command == "help":
        print("Available commands:")
        print("  setup          - Setup environment and dependencies")
        print("  collect        - Collect new documents")
        print("  process        - Process collected documents")
        print("  analyze        - Run analysis on documents")
        print("  update-db      - Update database with new findings")
        print("  dashboard      - Generate public dashboard")
        print("  deploy         - Deploy frontend")
        print("  full-cycle     - Run complete automation cycle")
        print("  continuous     - Run continuous monitoring system")
        print("  status         - Show system status")
        print("  help           - Show this help message")
    else:
        logger.error(f"Unknown command: {command}")
        logger.info("Run 'python automation.py help' for available commands")

if __name__ == "__main__":
    main()