#!/bin/bash

# Exit immediately if a command fails
set -e

echo "Setting up the Flask environment..."

# Ensure we're in the correct directory
cd "$(dirname "$0")"

# Create a virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
  echo "Creating virtual environment..."
  python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

export REPLICATE_API_TOKEN="r8_LWnU1qQW53j3ufU2erkSdul6vXzE8qP2P4F49"

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

# Ensure Replicate API token is set
if [ -z "$REPLICATE_API_TOKEN" ]; then
  echo "Error: REPLICATE_API_TOKEN is not set. Please set it before running this script."
  exit 1
fi

# Start the Flask app
echo "Starting Flask application..."
python generate.py
