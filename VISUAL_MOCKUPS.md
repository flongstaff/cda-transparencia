# Visual Mockups for Key UI Components

This document provides visual mockups for the key UI components in both desktop and mobile formats using SVG representations.

## 1. Financial Health Score Card

### Desktop Version

```svg
<svg width="320" height="180" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect x="0" y="0" width="320" height="180" rx="12" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feGaussianBlur in="SourceAlpha" stdDeviation="2"/>
    <feOffset dx="0" dy="1" result="offsetblur"/>
    <feFlood flood-color="rgba(0,0,0,0.1)"/>
    <feComposite in2="offsetblur" operator="in"/>
    <feMerge>
      <feMergeNode/>
      <feMergeNode in="SourceGraphic"/>
    </feMerge>
  </filter>
  
  <!-- Title -->
  <text x="16" y="28" font-family="Inter, sans-serif" font-size="16" font-weight="500" fill="#111827">
    Financial Health Score
  </text>
  
  <!-- Circular Progress Indicator -->
  <circle cx="70" cy="90" r="40" fill="none" stroke="#E5E7EB" stroke-width="8"/>
  <circle cx="70" cy="90" r="40" fill="none" stroke="#22C55E" stroke-width="8" 
          stroke-dasharray="251.2" stroke-dashoffset="37.68" transform="rotate(-90 70 90)"/>
  <text x="70" y="90" font-family="Inter, sans-serif" font-size="20" font-weight="500" fill="#111827" text-anchor="middle" dominant-baseline="middle">
    85%
  </text>
  
  <!-- Score Value -->
  <text x="160" y="80" font-family="Inter, sans-serif" font-size="48" font-weight="700" fill="#111827">
    85
  </text>
  
  <!-- Status Text -->
  <text x="160" y="110" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#22C55E">
    Excellent Financial Health
  </text>
</svg>
```

### Mobile Version

```svg
<svg width="300" height="140" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect x="0" y="0" width="300" height="140" rx="12" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Title -->
  <text x="16" y="24" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#111827">
    Financial Health Score
  </text>
  
  <!-- Circular Progress Indicator -->
  <circle cx="50" cy="75" r="30" fill="none" stroke="#E5E7EB" stroke-width="6"/>
  <circle cx="50" cy="75" r="30" fill="none" stroke="#22C55E" stroke-width="6" 
          stroke-dasharray="188.4" stroke-dashoffset="28.26" transform="rotate(-90 50 75)"/>
  <text x="50" y="75" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#111827" text-anchor="middle" dominant-baseline="middle">
    85%
  </text>
  
  <!-- Score Value -->
  <text x="120" y="70" font-family="Inter, sans-serif" font-size="32" font-weight="700" fill="#111827">
    85
  </text>
  
  <!-- Status Text -->
  <text x="120" y="95" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#22C55E">
    Excellent Financial Health
  </text>
</svg>
```

## 2. Enhanced Metric Cards

### Desktop Version (Single Card Example)

```svg
<svg width="280" height="140" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect x="0" y="0" width="280" height="140" rx="10" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Icon and Title -->
  <circle cx="20" cy="24" r="10" fill="#2563EB" fill-opacity="0.1"/>
  <path d="M15 19a5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5 5 5 0 0 0 5-5zM7 19a3 3 0 0 1 3-3 3 3 0 0 1 3 3 3 3 0 0 1-3 3 3 3 0 0 1-3-3z" fill="#2563EB"/>
  <text x="36" y="28" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#111827">
    Budget Execution
  </text>
  
  <!-- Metric Value -->
  <text x="16" y="70" font-family="Inter, sans-serif" font-size="24" font-weight="700" fill="#111827">
    92%
  </text>
  
  <!-- Trend Indicator -->
  <polygon points="16,90 24,82 24,86 30,86 30,94 24,94 24,98" fill="#22C55E"/>
  <text x="36" y="94" font-family="Inter, sans-serif" font-size="12" font-weight="400" fill="#22C55E">
    Change: +12%
  </text>
  
  <!-- Timestamp -->
  <text x="16" y="115" font-family="Inter, sans-serif" font-size="12" font-weight="400" fill="#6B7280">
    Last updated: Jan 15, 2025
  </text>
</svg>
```

### Mobile Version (Single Card Example)

```svg
<svg width="300" height="120" xmlns="http://www.w3.org/2000/svg">
  <!-- Card Background -->
  <rect x="0" y="0" width="300" height="120" rx="10" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Icon and Title -->
  <circle cx="18" cy="22" r="9" fill="#2563EB" fill-opacity="0.1"/>
  <path d="M13.5 17.5a4.5 4.5 0 0 0-4.5-4.5 4.5 4.5 0 0 0-4.5 4.5 4.5 4.5 0 0 0 4.5 4.5 4.5 4.5 0 0 0 4.5-4.5zM6.3 17.5a2.7 2.7 0 0 1 2.7-2.7 2.7 2.7 0 0 1 2.7 2.7 2.7 2.7 0 0 1-2.7 2.7 2.7 2.7 0 0 1-2.7-2.7z" fill="#2563EB"/>
  <text x="32" y="25" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#111827">
    Budget Execution
  </text>
  
  <!-- Metric Value -->
  <text x="16" y="60" font-family="Inter, sans-serif" font-size="20" font-weight="700" fill="#111827">
    92%
  </text>
  
  <!-- Trend and Timestamp -->
  <polygon points="16,78 22,72 22,75 27,75 27,81 22,81 22,84" fill="#22C55E"/>
  <text x="30" y="81" font-family="Inter, sans-serif" font-size="11" font-weight="400" fill="#22C55E">
    +12%
  </text>
  <text x="70" y="81" font-family="Inter, sans-serif" font-size="11" font-weight="400" fill="#6B7280">
    Updated: Jan 15
  </text>
</svg>
```

## 3. Data Verification Badge

### Desktop Version

```svg
<svg width="120" height="28" xmlns="http://www.w3.org/2000/svg">
  <!-- Badge Background -->
  <rect x="0" y="0" width="120" height="28" rx="6" fill="#DCFCE7" stroke="#22C55E" stroke-width="1"/>
  
  <!-- Check Icon -->
  <path d="M20 6L9 17l-5-5" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Text -->
  <text x="30" y="18" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#15803D">
    Verified
  </text>
</svg>
```

### Mobile Version

```svg
<svg width="100" height="24" xmlns="http://www.w3.org/2000/svg">
  <!-- Badge Background -->
  <rect x="0" y="0" width="100" height="24" rx="6" fill="#DCFCE7" stroke="#22C55E" stroke-width="1"/>
  
  <!-- Check Icon -->
  <path d="M18 5L8 15l-4-4" fill="none" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  
  <!-- Text -->
  <text x="26" y="16" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#15803D">
    Verified
  </text>
</svg>
```

## 4. Transparency Score

### Desktop Version

```svg
<svg width="200" height="60" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="200" height="60" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Title -->
  <text x="10" y="18" font-family="Inter, sans-serif" font-size="12" font-weight="500" fill="#111827">
    Transparency Score
  </text>
  
  <!-- Star Rating -->
  <g fill="#F97316">
    <polygon points="20,25 23,32 31,32 25,37 28,44 20,40 12,44 15,37 9,32 17,32"/>
    <polygon points="35,25 38,32 46,32 40,37 43,44 35,40 27,44 30,37 24,32 32,32"/>
    <polygon points="50,25 53,32 61,32 55,37 58,44 50,40 42,44 45,37 39,32 47,32"/>
    <polygon points="65,25 68,32 76,32 70,37 73,44 65,40 57,44 60,37 54,32 62,32"/>
    <polygon points="80,25 83,32 91,32 85,37 88,44 80,40 72,44 75,37 69,32 77,32" fill="#E5E7EB"/>
  </g>
  
  <!-- Score -->
  <text x="100" y="38" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#111827">
    4.2/5
  </text>
  
  <!-- Document Count -->
  <text x="10" y="52" font-family="Inter, sans-serif" font-size="11" font-weight="400" fill="#6B7280">
    Based on 24 documents
  </text>
</svg>
```

### Mobile Version

```svg
<svg width="180" height="50" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="180" height="50" rx="8" fill="#FFFFFF" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Title -->
  <text x="8" y="16" font-family="Inter, sans-serif" font-size="11" font-weight="500" fill="#111827">
    Transparency:
  </text>
  
  <!-- Star Rating -->
  <g fill="#F97316">
    <polygon points="18,22 21,28 29,28 23,33 26,40 18,36 10,40 13,33 7,28 15,28"/>
    <polygon points="32,22 35,28 43,28 37,33 40,40 32,36 24,40 27,33 21,28 29,28"/>
    <polygon points="46,22 49,28 57,28 51,33 54,40 46,36 38,40 41,33 35,28 43,28"/>
    <polygon points="60,22 63,28 71,28 65,33 68,40 60,36 52,40 55,33 49,28 57,28"/>
    <polygon points="74,22 77,28 85,28 79,33 82,40 74,36 66,40 69,33 63,28 71,28" fill="#E5E7EB"/>
  </g>
  
  <!-- Score -->
  <text x="90" y="32" font-family="Inter, sans-serif" font-size="16" font-weight="700" fill="#111827">
    4.2
  </text>
  
  <!-- Document Count -->
  <text x="8" y="44" font-family="Inter, sans-serif" font-size="10" font-weight="400" fill="#6B7280">
    (24 documents)
  </text>
</svg>
```

## 5. Financial Category Navigation

### Desktop Version

```svg
<svg width="600" height="60" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="600" height="60" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Category Pills -->
  <!-- All (Active) -->
  <rect x="10" y="15" width="60" height="30" rx="15" fill="#2563EB" stroke="#2563EB"/>
  <text x="40" y="35" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#FFFFFF" text-anchor="middle">
    All
  </text>
  
  <!-- Budget -->
  <rect x="80" y="15" width="80" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="120" y="35" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#374151" text-anchor="middle">
    Budget
  </text>
  
  <!-- Revenue -->
  <rect x="170" y="15" width="90" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="215" y="35" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#374151" text-anchor="middle">
    Revenue
  </text>
  
  <!-- Expenses -->
  <rect x="270" y="15" width="90" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="315" y="35" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#374151" text-anchor="middle">
    Expenses
  </text>
  
  <!-- Debt -->
  <rect x="370" y="15" width="70" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="405" y="35" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#374151" text-anchor="middle">
    Debt
  </text>
  
  <!-- Investments -->
  <rect x="450" y="15" width="110" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="505" y="35" font-family="Inter, sans-serif" font-size="14" font-weight="500" fill="#374151" text-anchor="middle">
    Investments
  </text>
</svg>
```

### Mobile Version

```svg
<svg width="320" height="50" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect x="0" y="0" width="320" height="50" fill="#F9FAFB" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Category Pills (Scrollable - showing first few) -->
  <!-- All (Active) -->
  <rect x="5" y="10" width="50" height="30" rx="15" fill="#2563EB" stroke="#2563EB"/>
  <text x="30" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#FFFFFF" text-anchor="middle">
    All
  </text>
  
  <!-- Budget -->
  <rect x="60" y="10" width="70" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="95" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#374151" text-anchor="middle">
    Budget
  </text>
  
  <!-- Revenue -->
  <rect x="135" y="10" width="80" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="175" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#374151" text-anchor="middle">
    Revenue
  </text>
  
  <!-- Expenses -->
  <rect x="220" y="10" width="80" height="30" rx="15" fill="#FFFFFF" stroke="#E5E7EB"/>
  <text x="260" y="30" font-family="Inter, sans-serif" font-size="13" font-weight="500" fill="#374151" text-anchor="middle">
    Expenses
  </text>
  
  <!-- Scroll Indicator -->
  <circle cx="310" cy="25" r="2" fill="#9CA3AF"/>
</svg>
```