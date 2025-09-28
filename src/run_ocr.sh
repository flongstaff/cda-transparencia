#!/bin/bash
#
# Complete OCR Pipeline Runner
# Runs the complete PDF OCR extraction and organization pipeline

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[INFO]$(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]$(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]$(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]$(date '+%Y-%m-%d %H:%M:%S')${NC} $1"
}

# Check if running in the correct directory
if [ ! -f "scripts/run_ocr_pipeline.py" ]; then
    log_error "This script must be run from the project root directory"
    exit 1
fi

# Parse arguments
LIMIT=""
INCREMENTAL=false
CLEANUP=false
VERIFY_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --limit)
            LIMIT="--limit $2"
            shift 2
            ;;
        --incremental)
            INCREMENTAL=true
            shift
            ;;
        --cleanup)
            CLEANUP=true
            shift
            ;;
        --verify-only)
            VERIFY_ONLY=true
            shift
            ;;
        *)
            log_error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check dependencies
log "Checking dependencies..."

# Check Python
if ! command_exists python3; then
    log_error "Python 3 is required but not found"
    exit 1
fi

# Check Tesseract OCR
if ! command_exists tesseract; then
    log_error "Tesseract OCR is required but not found"
    log "Install Tesseract with: brew install tesseract (macOS) or apt-get install tesseract-ocr (Linux)"
    exit 1
fi

# Check virtual environment
if [ ! -d ".venv" ]; then
    log_warning "Virtual environment not found, creating one..."
    python3 -m venv .venv
fi

# Activate virtual environment
source .venv/bin/activate

# Install/update required packages
log "Installing/updating required packages..."
pip install -q -r requirements.txt >> ocr_setup.log 2>&1

# Check if OCR packages are installed
log "Checking OCR packages..."
if ! python3 -c "import pytesseract" 2>/dev/null; then
    log_error "pytesseract not installed"
    pip install -q pytesseract >> ocr_setup.log 2>&1
fi

if ! python3 -c "import easyocr" 2>/dev/null; then
    log_error "easyocr not installed"
    pip install -q easyocr >> ocr_setup.log 2>&1
fi

if ! python3 -c "import pdf2image" 2>/dev/null; then
    log_error "pdf2image not installed"
    pip install -q pdf2image >> ocr_setup.log 2>&1
fi

# Show system information
log "System information:"
log "  - Python: $(python3 --version)"
log "  - Tesseract: $(tesseract --version | head -1)"
log "  - Working directory: $(pwd)"

# Run PDF inventory first
log "Running PDF inventory..."
if python3 scripts/pdf_inventory.py; then
    log_success "PDF inventory completed"
else
    log_warning "PDF inventory failed, continuing..."
fi

# Run the OCR pipeline
log "Starting OCR pipeline..."

# Build command
CMD="python3 scripts/run_ocr_pipeline.py"

if [ "$INCREMENTAL" = true ]; then
    CMD="$CMD --incremental"
fi

if [ "$CLEANUP" = true ]; then
    CMD="$CMD --cleanup"
fi

if [ "$VERIFY_ONLY" = true ]; then
    CMD="$CMD --verify-only"
fi

if [ -n "$LIMIT" ]; then
    CMD="$CMD $LIMIT"
fi

# Execute the command
log "Executing: $CMD"
if eval $CMD; then
    log_success "OCR pipeline completed successfully!"
    
    # Show results summary
    if [ -d "data/ocr_extracted" ]; then
        log "OCR extraction results:"
        find data/ocr_extracted -type f | wc -l | xargs -I {} echo "  - Total files extracted: {}"
        
        # Show directory breakdown
        for dir in data/ocr_extracted/*/; do
            if [ -d "$dir" ]; then
                count=$(find "$dir" -type f 2>/dev/null | wc -l)
                echo "  - $(basename "$dir"): $count files"
            fi
        done
    fi
    
    exit 0
else
    log_error "OCR pipeline failed!"
    exit 1
fi