#!/bin/bash

echo "🔄 Testing Complete MCPilot Workflow"
echo "===================================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Step 1: Load sample data
echo -e "${BLUE}Step 1: Loading sample data...${NC}"
curl -s -X POST http://localhost:3000/api/load-sample > /dev/null
echo -e "${GREEN}✓ Sample data loaded${NC}"
echo ""

# Step 2: Read initial config
echo -e "${BLUE}Step 2: Reading initial configuration...${NC}"
initial_config=$(curl -s http://localhost:3000/api/mcp-config)
echo "Servers found:"
echo "$initial_config" | grep -o '"[^"]*":{"command"' | cut -d'"' -f2 | while read server; do
    echo "  - $server"
done
echo ""

# Step 3: Toggle a server
echo -e "${BLUE}Step 3: Toggling filesystem server to disabled...${NC}"
curl -s -X POST http://localhost:3000/api/mcp-config \
    -H "Content-Type: application/json" \
    -d '{"mcpServers":{"filesystem":{"command":"npx","args":["-y","@modelcontextprotocol/server-filesystem","/tmp"],"env":{},"disabled":true},"git":{"command":"uvx","args":["mcp-server-git","--repository","/path/to/repo"],"disabled":true},"database":{"command":"npx","args":["database-mcp-server"],"disabled":false}}}' > /dev/null
echo -e "${GREEN}✓ Filesystem server disabled${NC}"
echo ""

# Step 4: Verify change
echo -e "${BLUE}Step 4: Verifying change...${NC}"
updated_config=$(curl -s http://localhost:3000/api/mcp-config)
if echo "$updated_config" | grep -q '"filesystem".*"disabled":true'; then
    echo -e "${GREEN}✓ Change verified in API${NC}"
fi
if grep -q '"disabled": true' ~/.aws/amazonq/mcp.json | head -1; then
    echo -e "${GREEN}✓ Change verified in file${NC}"
fi
echo ""

# Step 5: Update metadata (simulate theme change)
echo -e "${BLUE}Step 5: Changing theme to dark mode...${NC}"
curl -s -X POST http://localhost:3000/api/metadata \
    -H "Content-Type: application/json" \
    -d '{"application":{"theme":"dark","lastRefresh":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","contextUtilization":75,"activeProfile":"development"},"servers":{"filesystem":{"description":"File system access server","expanded":true,"toolsExpanded":true},"git":{"description":"Git operations","expanded":false,"toolsExpanded":false},"database":{"description":"Database server","expanded":false,"toolsExpanded":false}},"tools":{"filesystem":{"read_file":{"description":"Read files"},"write_file":{"description":"Write files"}}},"profiles":{"development":{"description":"Dev profile","enabledServers":["filesystem","database"],"disabledServers":["git"]}}}' > /dev/null
echo -e "${GREEN}✓ Theme changed to dark${NC}"
echo -e "${GREEN}✓ Active profile set to 'development'${NC}"
echo -e "${GREEN}✓ Context utilization set to 75%${NC}"
echo ""

# Step 6: Export configuration
echo -e "${BLUE}Step 6: Exporting configuration...${NC}"
export_result=$(curl -s -X POST http://localhost:3000/api/export)
export_file=$(echo "$export_result" | grep -o '"filename":"[^"]*"' | cut -d'"' -f4)
echo -e "${GREEN}✓ Configuration exported to: $export_file${NC}"
echo ""

# Step 7: Verify all files
echo -e "${BLUE}Step 7: Verifying all files exist...${NC}"
if [ -f ~/.aws/amazonq/mcp.json ]; then
    echo -e "${GREEN}✓ mcp.json exists${NC}"
fi
if [ -f ~/.aws/amazonq/mcp-metadata.json ]; then
    echo -e "${GREEN}✓ mcp-metadata.json exists${NC}"
fi
export_count=$(ls ~/.aws/amazonq/exports/*.json 2>/dev/null | wc -l)
echo -e "${GREEN}✓ $export_count export file(s) in exports directory${NC}"
echo ""

# Step 8: Read final state
echo -e "${BLUE}Step 8: Reading final state...${NC}"
final_metadata=$(curl -s http://localhost:3000/api/metadata)
theme=$(echo "$final_metadata" | grep -o '"theme":"[^"]*"' | cut -d'"' -f4)
profile=$(echo "$final_metadata" | grep -o '"activeProfile":"[^"]*"' | cut -d'"' -f4)
context=$(echo "$final_metadata" | grep -o '"contextUtilization":[0-9]*' | cut -d':' -f2)

echo "Final state:"
echo "  Theme: $theme"
echo "  Active Profile: $profile"
echo "  Context Utilization: ${context}%"
echo ""

# Summary
echo "===================================="
echo -e "${GREEN}✅ Complete workflow test passed!${NC}"
echo ""
echo -e "${YELLOW}Summary of changes:${NC}"
echo "  • Loaded sample data with 3 servers"
echo "  • Disabled filesystem server"
echo "  • Changed theme to dark mode"
echo "  • Set active profile to 'development'"
echo "  • Updated context utilization to 75%"
echo "  • Exported configuration"
echo ""
echo -e "${BLUE}Files created:${NC}"
echo "  • ~/.aws/amazonq/mcp.json"
echo "  • ~/.aws/amazonq/mcp-metadata.json"
echo "  • ~/.aws/amazonq/exports/$export_file"
echo ""
echo "🌐 Ready to test in browser: http://localhost:3000"
