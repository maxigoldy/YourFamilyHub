#!/bin/bash

# YourFamily Startup Script
# This script starts the YourFamily self-hosted application

# Color definitions for better visibility
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'  # No Color

echo -e "${GREEN}**********************************************"
echo -e "${GREEN}   Welcome to YourFamily Self-Hosted Hub!   "
echo -e "${GREEN}                 v1.0.0                       "
echo -e "${GREEN}**********************************************\n\n"
echo -e "${NC}"

# Check if Node.js is installed
echo -e "${GREEN}**********************************************"
echo -e "${YELLOW}##### Starting Installation #####${NC}"
echo -e "${YELLOW}Checking if Node.js is installed...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Error: Node.js is not installed. Please install Node.js 18+ first.\nHow to: https://docs.yourfamilyhub.xyz/errors/server/node.js-is-not-installed${NC}"
    exit 1
fi

# Check if we're in the right directory
echo -e "${YELLOW}Checking the directory structure...${NC}"
if [ ! -f "server/server.js" ]; then
    echo -e "${RED}Error: server/server.js not found. Please run this script from the YourFamily directory.${NC}"
    exit 1
fi

# Force clean installation to fix native module bindings
echo -e "${YELLOW}Cleaning previous installation...${NC}"
rm -rf node_modules package-lock.json

echo -e "${YELLOW}Installing dependencies...${NC}"
npm install --production

# Autorunning fix
./path-to-regexp-error-fix.sh

echo -e "${YELLOW}\n##### End of Installation #####\n\nEnjoy your self-hosted version of YourFamilyHub!\nmade by Maxi Goldmann\n\n${NC}"

# Set production environment
export NODE_ENV=production
export PORT=${PORT:-3000}

# Start the server
echo -e "${GREEN}**********************************************"
echo -e "${GREEN}  Starting YourFamilyHub server on port $PORT...${NC}"
echo -e "${GREEN}  Access your family hub at: http://localhost:$PORT${NC}"
echo -e "${GREEN}  Documentation: https://docs.yourfamilyhub.xyz/${NC}"
echo -e "${GREEN}  Press Ctrl+C to stop the server${NC}"
echo -e "${GREEN}**********************************************"
echo -e "${NC}"

node server/server.js
