#!/bin/bash

# 🚀 LEGACYMAP BACKEND - QUICK START GUIDE

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   LEGACYMAP BACKEND SETUP                      ║"
echo "║              Code Analysis Engine - Quick Start                ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Step 1: Install Dependencies
echo "📦 Step 1: Installing dependencies..."
pip install -r requirements.txt
echo "✅ Dependencies installed"
echo ""

# Step 2: Verify Installation
echo "🔍 Step 2: Verifying installation..."
python3 -c "
import sys
sys.path.insert(0, '.')
from app.main import app
from app.scanner import is_source_file, count_loc, extract_imports
from app.utils import extract_zip_to_temp, cleanup
print('✅ All modules loaded successfully')
print('✅ FastAPI app initialized')
print('✅ Scanner functions available')
print('✅ Utility functions available')
"
echo ""

# Step 3: Start Backend
echo "🚀 Step 3: Starting backend server..."
echo "    Server will run on http://localhost:8000"
echo "    API Documentation: http://localhost:8000/docs"
echo ""
echo "📝 Press CTRL+C to stop the server"
echo ""

uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    SERVER STOPPED                              ║"
echo "╚════════════════════════════════════════════════════════════════╝"
