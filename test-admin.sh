#!/bin/bash
echo "Testing admin creation..."
curl -X POST http://localhost:3000/api/setup/create-admin
echo ""
