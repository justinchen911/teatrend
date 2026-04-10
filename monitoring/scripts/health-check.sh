#!/usr/bin/env bash
# Health Check Script - SaaS Monitoring
# Checks all core services and outputs a colored status report
# Exit 1 if any service is unhealthy

set -euo pipefail

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

ERRORS=0

echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo -e "${CYAN}        SaaS 服务健康检查               ${NC}"
echo -e "${CYAN}══════════════════════════════════════════${NC}"
echo ""

# --- Check Application API ---
echo -n "  [API]       localhost:3000 /api/health ... "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://localhost:3000/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK (HTTP 200)${NC}"
else
    echo -e "${RED}✗ FAIL (HTTP ${HTTP_CODE})${NC}"
    ERRORS=$((ERRORS + 1))
fi

# --- Check Prometheus ---
echo -n "  [Prometheus] localhost:9090 ...             "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://localhost:9090/-/healthy 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ UNREACHABLE${NC}"
    ERRORS=$((ERRORS + 1))
fi

# --- Check Loki ---
echo -n "  [Loki]      localhost:3100 ...             "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://localhost:3100/ready 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ UNREACHABLE${NC}"
    ERRORS=$((ERRORS + 1))
fi

# --- Check Grafana ---
echo -n "  [Grafana]   localhost:3001 ...             "
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 http://localhost:3001/api/health 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ OK${NC}"
else
    echo -e "${RED}✗ UNREACHABLE${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo -e "${CYAN}══════════════════════════════════════════${NC}"

if [ "$ERRORS" -eq 0 ]; then
    echo -e "${GREEN}  所有服务运行正常 ✓${NC}"
    echo -e "${CYAN}══════════════════════════════════════════${NC}"
    exit 0
else
    echo -e "${RED}  ${ERRORS} 个服务异常 ✗${NC}"
    echo -e "${CYAN}══════════════════════════════════════════${NC}"
    exit 1
fi
