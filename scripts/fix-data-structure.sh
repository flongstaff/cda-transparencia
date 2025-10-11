#!/bin/bash
#
# Data Structure Verification and Fix Script
# Checks and fixes the data structure for the Carmen de Areco Transparency Portal

set -e  # Exit on any error

echo "🔍 Starting data structure verification and fix process..."

# Define base directories
BASE_DIR="/Users/flong/Developer/cda-transparencia"
DATA_DIR="$BASE_DIR/data"
CENTRAL_DATA_DIR="$BASE_DIR/central_data"
FRONTEND_PUBLIC_DATA_DIR="$BASE_DIR/frontend/public/data"
CENTRAL_PDFS_DIR="$BASE_DIR/central_pdfs"

echo "📁 Base directory: $BASE_DIR"
echo "📂 Data directory: $DATA_DIR"
echo "🗃️  Central data directory: $CENTRAL_DATA_DIR"
echo "🌐 Frontend public data directory: $FRONTEND_PUBLIC_DATA_DIR"
echo "📄 Central PDFs directory: $CENTRAL_PDFS_DIR"

# Check if directories exist
if [[ ! -d "$DATA_DIR" ]]; then
    echo "❌ Error: Data directory does not exist: $DATA_DIR"
    exit 1
fi

if [[ ! -d "$CENTRAL_PDFS_DIR" ]]; then
    echo "❌ Error: Central PDFs directory does not exist: $CENTRAL_PDFS_DIR"
    exit 1
fi

# Create central_data directory if it doesn't exist
if [[ ! -d "$CENTRAL_DATA_DIR" ]]; then
    echo "🆕 Creating central data directory..."
    mkdir -p "$CENTRAL_DATA_DIR"
fi

# Create subdirectories in central_data
echo "📁 Creating subdirectories in central data..."
mkdir -p "$CENTRAL_DATA_DIR/api"
mkdir -p "$CENTRAL_DATA_DIR/charts"
mkdir -p "$CENTRAL_DATA_DIR/consolidated"
mkdir -p "$CENTRAL_DATA_DIR/csv"
mkdir -p "$CENTRAL_DATA_DIR/documents"
mkdir -p "$CENTRAL_DATA_DIR/documents/pdfs"
mkdir -p "$CENTRAL_DATA_DIR/documents/organized"
mkdir -p "$CENTRAL_DATA_DIR/json"
mkdir -p "$CENTRAL_DATA_DIR/metadata"

echo "✅ Central data structure created"

# Check symlinks in organized_pdfs directory
echo "🔗 Checking symlinks in organized_pdfs directory..."

ORGANIZED_PDFS_DIR="$DATA_DIR/organized_pdfs"
if [[ -d "$ORGANIZED_PDFS_DIR" ]]; then
    echo "📂 Scanning organized_pdfs directory for broken symlinks..."
    
    # Find all symlinks in organized_pdfs
    find "$ORGANIZED_PDFS_DIR" -type l | while read -r symlink; do
        target=$(readlink "$symlink")
        echo "🔗 Checking symlink: $symlink -> $target"
        
        # Check if target exists
        if [[ ! -e "$target" ]]; then
            echo "❌ Broken symlink found: $symlink -> $target"
            # Try to fix by checking if target exists in central_pdfs/originals
            filename=$(basename "$target")
            new_target="$CENTRAL_PDFS_DIR/originals/$filename"
            
            if [[ -e "$new_target" ]]; then
                echo "🔧 Fixing symlink: $symlink -> $new_target"
                rm "$symlink"
                ln -s "$new_target" "$symlink"
                echo "✅ Fixed symlink: $symlink -> $new_target"
            else
                echo "⚠️  Target file not found in central_pdfs: $filename"
            fi
        else
            echo "✅ Valid symlink: $symlink -> $target"
        fi
    done
else
    echo "⚠️  organized_pdfs directory not found: $ORGANIZED_PDFS_DIR"
fi

# Check symlinks in other directories
echo "🔗 Checking symlinks in data directory..."
find "$DATA_DIR" -type l | while read -r symlink; do
    target=$(readlink "$symlink")
    echo "🔗 Checking symlink: $symlink -> $target"
    
    # Check if target exists
    if [[ ! -e "$target" ]]; then
        echo "❌ Broken symlink found: $symlink -> $target"
    else
        echo "✅ Valid symlink: $symlink -> $target"
    fi
done

# Create symlinks for frontend compatibility
echo "🔗 Creating symlinks for frontend compatibility..."

# Create symlinks from frontend/public/data to central_data
if [[ -d "$FRONTEND_PUBLIC_DATA_DIR" ]]; then
    echo "🌐 Creating symlinks in frontend public data directory..."
    
    # Remove existing directories and create symlinks
    for dir in api charts consolidated csv json; do
        if [[ -d "$FRONTEND_PUBLIC_DATA_DIR/$dir" ]]; then
            echo "🗑️  Removing existing directory: $FRONTEND_PUBLIC_DATA_DIR/$dir"
            rm -rf "$FRONTEND_PUBLIC_DATA_DIR/$dir"
        fi
        
        if [[ ! -L "$FRONTEND_PUBLIC_DATA_DIR/$dir" ]]; then
            echo "🔗 Creating symlink: $FRONTEND_PUBLIC_DATA_DIR/$dir -> $CENTRAL_DATA_DIR/$dir"
            ln -s "$CENTRAL_DATA_DIR/$dir" "$FRONTEND_PUBLIC_DATA_DIR/$dir"
        else
            echo "✅ Symlink already exists: $FRONTEND_PUBLIC_DATA_DIR/$dir"
        fi
    done
    
    # Handle documents directory specially
    DOCUMENTS_DIR="$FRONTEND_PUBLIC_DATA_DIR/documents"
    if [[ -d "$DOCUMENTS_DIR" ]]; then
        echo "🗑️  Removing existing documents directory: $DOCUMENTS_DIR"
        rm -rf "$DOCUMENTS_DIR"
    fi
    
    if [[ ! -L "$DOCUMENTS_DIR" ]]; then
        echo "🔗 Creating symlink: $DOCUMENTS_DIR -> $CENTRAL_DATA_DIR/documents"
        ln -s "$CENTRAL_DATA_DIR/documents" "$DOCUMENTS_DIR"
    else
        echo "✅ Symlink already exists: $DOCUMENTS_DIR"
    fi
else
    echo "⚠️  Frontend public data directory not found: $FRONTEND_PUBLIC_DATA_DIR"
fi

echo "✅ Data structure verification and fix process completed!"

# Summary
echo ""
echo "📊 Summary:"
echo "   • Central data directory: $CENTRAL_DATA_DIR"
echo "   • Subdirectories created: api, charts, consolidated, csv, documents, json, metadata"
echo "   • Documents subdirectories: pdfs, organized"
echo "   • Frontend symlinks updated for compatibility"
echo ""
echo "🎉 Data structure is now centralized and properly organized!"