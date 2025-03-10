#!/bin/bash

# Exit immediately if a command exits with a non-zero status
set -e

echo "Starting setup..."

# Ensure we are in the correct directory
cd "$(dirname "$0")"

# Fix incorrect package name (if needed)
if grep -q '"expres":' package.json; then
  echo "Fixing package.json (typo in 'express')..."
  sed -i 's/"expres":.*//' package.json
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the app
echo "Starting the Node.js application..."
node app.js
