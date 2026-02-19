#!/bin/bash

# TellMe - Quick Start Script

echo "🚀 Starting TellMe server..."
echo ""
echo "Choose your server:"
echo "1) Python 3 (recommended)"
echo "2) Python 2"
echo "3) Node.js (http-server)"
echo ""
read -p "Enter choice [1-3]: " choice

case $choice in
  1)
    echo "Starting Python 3 server on http://localhost:8000"
    python3 -m http.server 8000
    ;;
  2)
    echo "Starting Python 2 server on http://localhost:8000"
    python -m SimpleHTTPServer 8000
    ;;
  3)
    echo "Starting Node.js server on http://localhost:8000"
    npx http-server -p 8000 -o tellme.html
    ;;
  *)
    echo "Invalid choice. Starting Python 3 server..."
    python3 -m http.server 8000
    ;;
esac

