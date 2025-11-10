#!/bin/bash

echo "🧪 Testing MCPilot API Endpoints"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Check files
echo "1️⃣  Testing check-files endpoint..."
response=$(curl -s http://localhost:3000/api/check-files)
if echo "$response" | grep -q "mcpConfigExists"; then
    echo -e "${GREEN}✓ Check files endpoint working${NC}"
else
    echo -e "${RED}✗ Check files endpoint failed${NC}"
fi
echo ""

# Test 2: Read MCP config
echo "2️⃣  Testing read MCP config..."
response=$(curl -s http://localhost:3000/api/mcp-config)
if echo "$response" | grep -q "mcpServers"; then
    echo -e "${GREEN}✓ Read MCP config working${NC}"
else
    echo -e "${RED}✗ Read MCP config failed${NC}"
fi
echo ""

# Test 3: Read metadata
echo "3️⃣  Testing read metadata..."
response=$(curl -s http://localhost:3000/api/metadata)
if echo "$response" | grep -q "application"; then
    echo -e "${GREEN}✓ Read metadata working${NC}"
else
    echo -e "${RED}✗ Read metadata failed${NC}"
fi
echo ""

# Test 4: Write metadata
echo "4️⃣  Testing write metadata..."
response=$(curl -s -X POST http://localhost:3000/api/metadata \
    -H "Content-Type: application/json" \
    -d '{"application":{"theme":"dark","lastRefresh":"2025-11-09T00:00:00Z","contextUtilization":50,"activeProfile":null},"servers":{},"tools":{},"profiles":{}}')
if echo "$response" | grep -q "success"; then
    echo -e "${GREEN}✓ Write metadata working${NC}"
else
    echo -e "${RED}✗ Write metadata failed${NC}"
fi
echo ""

# Test 5: Export config
echo "5️⃣  Testing export config..."
response=$(curl -s -X POST http://localhost:3000/api/export)
if echo "$response" | grep -q "filename"; then
    echo -e "${GREEN}✓ Export config working${NC}"
    filename=$(echo "$response" | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
    echo "   Exported to: $filename"
else
    echo -e "${RED}✗ Export config failed${NC}"
fi
echo ""

# Test 6: Static file serving
echo "6️⃣  Testing static file serving..."
response=$(curl -s http://localhost:3000/)
if echo "$response" | grep -q "MCPilot"; then
    echo -e "${GREEN}✓ Static files serving working${NC}"
else
    echo -e "${RED}✗ Static files serving failed${NC}"
fi
echo ""

echo "================================"
echo "✅ All API tests completed!"
echo ""
echo "🌐 Open http://localhost:3000 in your browser to use MCPilot"
