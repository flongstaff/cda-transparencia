# Key UI Components Design Specification

This document provides detailed descriptions, visual specifications, and interaction patterns for the key UI components identified in the design plan for the Carmen de Areco Transparency Portal.

## 1. Financial Health Score Card

### Desktop Design
**Visual Description:**
- Large rectangular card with rounded corners (12px radius)
- Primary color: #2563EB (Primary Blue) as the accent color
- Background: #FFFFFF (White) with subtle shadow (0px 1px 3px rgba(0,0,0,0.1))
- Size: 320px width x 180px height
- Content arranged in a vertical stack with clear typography hierarchy

**Layout Structure:**
```
+--------------------------------------------------+
| Financial Health Score                         | ← Title (16px, semi-bold, #111827)
|                                                  |
| [Circular progress indicator]  [Score value]     | ← Score display (80px diameter circle)
| 85% Complete              85                     |   Score value: 48px bold, #111827
|                                                  |
| [Progress bar background]                        | ← Progress bar (100% width)
| [=======-------------------]                     |   Filled: #22C55E (Success Green)
| Excellent Financial Health                       |   Text: 14px, semi-bold, #22C55E
+--------------------------------------------------+
```

**Color Specifications:**
- Background: #FFFFFF
- Border: #E5E7EB (1px solid)
- Title text: #111827
- Score value: #111827
- Progress indicator track: #E5E7EB
- Progress indicator fill: #22C55E (85-100%), #F97316 (70-84%), #EF4444 (0-69%)
- Status text: #22C55E (Excellent), #F97316 (Good), #EF4444 (Needs Attention)

**Typography:**
- Title: Inter, 16px, Semi-bold (500)
- Score value: Inter, 48px, Bold (700)
- Percentage text: Inter, 14px, Regular (400)
- Status text: Inter, 14px, Semi-bold (500)

**Interaction Patterns:**
- Hover effect: Subtle elevation with shadow enhancement (0px 4px 6px rgba(0,0,0,0.1))
- Clickable area: Entire card
- On click: Navigate to detailed financial health report page
- Tooltip on hover: "Your financial health score is calculated based on budget execution, debt levels, and spending patterns."

### Mobile Design
**Visual Description:**
- Width: 100% of container
- Height: 140px
- Simplified layout with horizontal arrangement

**Layout Structure:**
```
+----------------------------------------------+
| Financial Health Score                     | ← Title (14px, semi-bold)
|                                            |
| [Progress circle]  [Score value]           | ← 60px diameter circle
| 85%              85                        |   Score value: 32px bold
| Excellent Financial Health                 | ← Status text: 12px, semi-bold
+----------------------------------------------+
```

## 2. Enhanced Metric Cards

### Desktop Design
**Visual Description:**
- Medium-sized rectangular cards with rounded corners (10px radius)
- Consistent design with color-coded accents
- Background: #FFFFFF (White) with subtle shadow
- Size: 280px width x 140px height
- Three cards arranged in a horizontal row

**Layout Structure:**
```
+--------------------------------------------+
| [Icon] Metric Title                      | ← Icon (20px) + Title (14px, semi-bold)
|                                            |
| Metric Value                             | ← Value: 24px, bold
|                                            |
| [Trend indicator] Change: +12%           | ← Trend: 12px, regular + change value
| Last updated: Jan 15, 2025               | ← Timestamp: 12px, regular, #6B7280
+--------------------------------------------+
```

**Color Specifications:**
- Background: #FFFFFF
- Border: #E5E7EB (1px solid)
- Title text: #111827
- Metric value: #111827
- Icon color: #2563EB (Primary Blue)
- Positive trend: #22C55E (Success Green)
- Negative trend: #EF4444 (Danger Red)
- Neutral trend: #6B7280 (Gray)
- Timestamp: #6B7280

**Typography:**
- Title: Inter, 14px, Semi-bold (500)
- Value: Inter, 24px, Bold (700)
- Trend: Inter, 12px, Regular (400)
- Timestamp: Inter, 12px, Regular (400)

**Card Variants:**
1. **Budget Execution Card**
   - Icon: PieChart (Lucide React)
   - Color accent: #2563EB (Primary Blue)
   - Example value: 92%

2. **Revenue Collection Card**
   - Icon: Coins (Lucide React)
   - Color accent: #22C55E (Success Green)
   - Example value: $12.4M

3. **Debt Ratio Card**
   - Icon: CreditCard (Lucide React)
   - Color accent: #F97316 (Secondary Orange)
   - Example value: 18.5%

**Interaction Patterns:**
- Hover effect: Subtle elevation with shadow enhancement
- Clickable area: Entire card
- On click: Navigate to detailed view of that specific metric
- Focus state: 2px outline with #2563EB color for keyboard navigation

### Mobile Design
**Visual Description:**
- Full-width cards stacked vertically
- Height: 120px
- Simplified layout

**Layout Structure:**
```
+------------------------------------------+
| [Icon] Metric Title                    | ← Icon (18px) + Title (13px)
|                                          |
| Metric Value                           | ← Value: 20px, bold
| [Trend] +12%   Updated: Jan 15         | ← Trend: 11px + Timestamp: 11px
+------------------------------------------+
```

## 3. Data Verification Badge

### Desktop Design
**Visual Description:**
- Small rectangular badge with rounded corners (6px radius)
- Color-coded based on verification status
- Icon + text layout
- Size: 120px width x 28px height

**Layout Structure:**
```
[✓] Verified
```

**Color Specifications:**
- Background (Verified): #DCFCE7 (Light Green)
- Border (Verified): #22C55E (Success Green)
- Text (Verified): #15803D (Dark Green)
- Icon (Verified): #22C55E (Success Green)

- Background (Processing): #FFEDD5 (Light Orange)
- Border (Processing): #F97316 (Secondary Orange)
- Text (Processing): #C2410C (Dark Orange)
- Icon (Processing): #F97316 (Secondary Orange)

- Background (Pending): #E5E7EB (Light Gray)
- Border (Pending): #6B7280 (Gray)
- Text (Pending): #374151 (Dark Gray)
- Icon (Pending): #6B7280 (Gray)

**Typography:**
- Text: Inter, 12px, Semi-bold (500)

**Interaction Patterns:**
- Tooltip on hover: "This data has been verified by municipal authorities."
- Clickable: No
- Position: Top-right corner of data containers

### Mobile Design
**Visual Description:**
- Slightly smaller: 100px width x 24px height
- Same color scheme and layout

## 4. Transparency Score

### Desktop Design
**Visual Description:**
- Prominent badge-like component with dual display modes
- Star rating system + numerical score
- Size: 200px width x 60px height

**Layout Structure:**
```
Transparency Score
★★★★☆ 4.2/5
Based on 24 documents
```

**Color Specifications:**
- Background: #FFFFFF with subtle shadow
- Border: #E5E7EB (1px solid)
- Title text: #111827
- Star rating (filled): #F97316 (Secondary Orange)
- Star rating (empty): #E5E7EB
- Score text: #111827
- Document count: #6B7280

**Typography:**
- Title: Inter, 12px, Semi-bold (500)
- Score: Inter, 18px, Bold (700)
- Document count: Inter, 11px, Regular (400)

**Interaction Patterns:**
- Hover effect: Slight scale-up (102%)
- Clickable area: Entire component
- On click: Expand to show detailed transparency metrics
- Tooltip: "Transparency score is calculated based on document availability, update frequency, and detail completeness."

### Mobile Design
**Visual Description:**
- Width: 180px
- Height: 50px
- Compact layout

**Layout Structure:**
```
Transparency: ★★★★☆ 4.2
(24 documents)
```

## 5. Financial Category Navigation

### Desktop Design
**Visual Description:**
- Horizontal navigation bar with category pills
- Each category represented as a pill-shaped button
- Active category highlighted
- Size: Full-width container with 60px height

**Layout Structure:**
```
[All] [Budget] [Revenue] [Expenses] [Debt] [Investments]
 ↑
Active category
```

**Color Specifications:**
- Background: #F9FAFB
- Border: #E5E7EB (1px solid bottom)
- Pill background (inactive): #FFFFFF
- Pill background (active): #2563EB (Primary Blue)
- Pill text (inactive): #374151
- Pill text (active): #FFFFFF
- Pill border (inactive): #E5E7EB
- Pill border (active): #2563EB

**Typography:**
- Category text: Inter, 14px, Medium (500)

**Interaction Patterns:**
- Hover effect: Light background change for inactive pills
- Active state: Blue background with white text
- Smooth transition: 0.2s for all state changes
- Keyboard navigation: Arrow keys to navigate between categories
- Focus state: Visible outline for accessibility

### Mobile Design
**Visual Description:**
- Horizontal scrollable navigation
- Smaller pill sizes to accommodate touch
- Height: 50px

**Layout Structure:**
```
[All][Budget][Revenue][Expenses][Debt][Investments]
```

**Responsive Behavior:**
- Categories that don't fit are accessible via horizontal scrolling
- Scroll indicators appear when content overflows
- Touch-friendly minimum target size of 44px

## Dark Mode Variants

All components have dark mode equivalents with the following specifications:

**Dark Mode Color Palette:**
- Background: #111827
- Card backgrounds: #1F2937
- Text primary: #F9FAFB
- Text secondary: #D1D5DB
- Borders: #374151
- Interactive elements: #2563EB (unchanged for consistency)

## Accessibility Features

1. **Contrast Ratios:**
   - All text meets WCAG 2.1 AA standards (4.5:1 minimum)
   - Interactive elements have 3:1 contrast against backgrounds

2. **Keyboard Navigation:**
   - All interactive components are keyboard accessible
   - Focus indicators are visible and consistent
   - Logical tab order follows visual layout

3. **Screen Reader Support:**
   - ARIA labels for all interactive elements
   - Proper heading hierarchy (H2 for card titles, H3 for section titles)
   - Alternative text for icons and visual indicators

4. **Responsive Behavior:**
   - All components adapt to different screen sizes
   - Mobile-first approach with progressive enhancement
   - Touch targets meet minimum 44px requirement

## Implementation Notes

1. **Technology Stack:**
   - Components should be built using React with TypeScript
   - Styled with Tailwind CSS classes
   - Icons from Lucide React library
   - Responsive design with CSS Grid and Flexbox

2. **Performance Considerations:**
   - Lazy loading for complex visualizations
   - Efficient re-rendering with React.memo where appropriate
   - Debounced hover effects to prevent performance issues

3. **Localization:**
   - All text should be translatable
   - Number formatting should respect locale settings
   - Date formatting should be localized

4. **Testing Requirements:**
   - Unit tests for all interactive components
   - Visual regression tests for design consistency
   - Accessibility audits using automated tools
   - Cross-browser compatibility testing

This specification ensures that all key UI components are visually consistent, accessible, and provide an excellent user experience across all devices and user contexts.