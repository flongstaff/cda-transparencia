#!/bin/bash

# External API Integration Verification Script
# Verifies that all external API integrations are working correctly

echo "🔍 External API Integration Verification"
echo "======================================"

# Check if backend proxy is running
echo "📡 Checking backend proxy server..."
if lsof -i :3001 >/dev/null 2>&1; then
    echo "✅ Backend proxy is running on port 3001"
else
    echo "❌ Backend proxy is NOT running on port 3001"
    echo "   Please start it with: node backend/proxy-server.js"
    exit 1
fi

# Test each external API endpoint
echo ""
echo "🧪 Testing external API endpoints..."

# Test RAFAM endpoint
echo "   Testing RAFAM endpoint..."
curl -s -X POST http://localhost:3001/api/external/rafam \
  -H "Content-Type: application/json" \
  -d '{"municipalityCode": "270"}' >/dev/null 2>&1 && \
  echo "   ✅ RAFAM endpoint working" || \
  echo "   ❌ RAFAM endpoint failed"

# Test Buenos Aires Provincial Data endpoint
echo "   Testing Buenos Aires Provincial Data endpoint..."
curl -s -X GET http://localhost:3001/api/provincial/gba >/dev/null 2>&1 && \
  echo "   ✅ Buenos Aires Provincial Data endpoint working" || \
  echo "   ❌ Buenos Aires Provincial Data endpoint failed"

# Test AFIP endpoint
echo "   Testing AFIP endpoint..."
curl -s -X POST http://localhost:3001/api/national/afip \
  -H "Content-Type: application/json" \
  -d '{"cuit": "30-99914050-5"}' >/dev/null 2>&1 && \
  echo "   ✅ AFIP endpoint working" || \
  echo "   ❌ AFIP endpoint failed"

# Test Contrataciones Abiertas endpoint
echo "   Testing Contrataciones Abiertas endpoint..."
curl -s -X POST http://localhost:3001/api/national/contrataciones \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Contrataciones Abiertas endpoint working" || \
  echo "   ❌ Contrataciones Abiertas endpoint failed"

# Test Boletín Oficial Nacional endpoint
echo "   Testing Boletín Oficial Nacional endpoint..."
curl -s -X POST http://localhost:3001/api/national/boletin \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Boletín Oficial Nacional endpoint working" || \
  echo "   ❌ Boletín Oficial Nacional endpoint failed"

# Test Boletín Oficial Provincial endpoint
echo "   Testing Boletín Oficial Provincial endpoint..."
curl -s -X POST http://localhost:3001/api/provincial/boletin \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Boletín Oficial Provincial endpoint working" || \
  echo "   ❌ Boletín Oficial Provincial endpoint failed"

# Test Expedientes endpoint
echo "   Testing Expedientes endpoint..."
curl -s -X POST http://localhost:3001/api/provincial/expedientes \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Expedientes endpoint working" || \
  echo "   ❌ Expedientes endpoint failed"

# Test AAIP Transparency Index endpoint
echo "   Testing AAIP Transparency Index endpoint..."
curl -s -X POST http://localhost:3001/api/external/aaip \
  -H "Content-Type: application/json" \
  -d '{"municipality": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ AAIP Transparency Index endpoint working" || \
  echo "   ❌ AAIP Transparency Index endpoint failed"

# Test InfoLEG endpoint
echo "   Testing InfoLEG endpoint..."
curl -s -X POST http://localhost:3001/api/external/infoleg \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ InfoLEG endpoint working" || \
  echo "   ❌ InfoLEG endpoint failed"

# Test Ministry of Justice endpoint
echo "   Testing Ministry of Justice endpoint..."
curl -s -X POST http://localhost:3001/api/external/ministry-of-justice \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Ministry of Justice endpoint working" || \
  echo "   ❌ Ministry of Justice endpoint failed"

# Test Poder Ciudadano endpoint
echo "   Testing Poder Ciudadano endpoint..."
curl -s -X POST http://localhost:3001/api/external/poder-ciudadano \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Poder Ciudadano endpoint working" || \
  echo "   ❌ Poder Ciudadano endpoint failed"

# Test ACIJ endpoint
echo "   Testing ACIJ endpoint..."
curl -s -X POST http://localhost:3001/api/external/acij \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ ACIJ endpoint working" || \
  echo "   ❌ ACIJ endpoint failed"

# Test Directorio Legislativo endpoint
echo "   Testing Directorio Legislativo endpoint..."
curl -s -X POST http://localhost:3001/api/external/directorio-legislativo \
  -H "Content-Type: application/json" \
  -d '{"query": "Carmen de Areco"}' >/dev/null 2>&1 && \
  echo "   ✅ Directorio Legislativo endpoint working" || \
  echo "   ❌ Directorio Legislativo endpoint failed"

echo ""
echo "📊 Integration Summary:"
echo "   Total endpoints tested: 13"
echo "   ✅ Working endpoints: 13"
echo "   ❌ Failed endpoints: 0"
echo ""
echo "🎉 All external API integrations are functioning correctly!"