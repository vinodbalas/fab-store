# AppBuilder Demo Guide: Building an Application from Scratch

## Quick Start: Build a Simple Dashboard in 5 Steps

### Step 1: Start with the Foundation (Layout Components)
**Drag & Drop First:**
1. **App Header** (Layout category)
   - This provides branding, navigation, and user avatar
   - Essential for any professional application
   - Drag it to the top of the canvas

2. **Container** (Layout category)
   - This will hold your main content
   - Drag it below the header
   - Set padding to 24px in properties panel

### Step 2: Add Structure (More Layout)
**Drag & Drop:**
3. **Grid** (Layout category)
   - Place inside the Container
   - Set columns to 3 (for metric cards)
   - Set gap to 16px
   - This creates a responsive grid for your metrics

4. **Section** (Layout category)
   - Add below the Grid
   - This will hold your data table or chart
   - Set padding to 24px

### Step 3: Add Content (Data Display)
**Drag & Drop:**
5. **Metric Card** (Data Display category)
   - Drag 3 Metric Cards into the Grid
   - Configure each:
     - Card 1: Title "Total Users", Value "1,234", Trend "+12%"
     - Card 2: Title "Revenue", Value "$45,678", Trend "+8%"
     - Card 3: Title "Orders", Value "567", Trend "+23%"

6. **Card** (Data Display category)
   - Drag into the Section below
   - Set title to "Recent Activity"
   - This will hold your data table

### Step 4: Add Data Visualization
**Drag & Drop:**
7. **Bar Chart** (Charts & Graphs category)
   - Place inside the Card
   - Configure:
     - Title: "Monthly Performance"
     - Data: Use sample data or connect to your data model

8. **Data Table** (Data Display category)
   - Add below the chart
   - Configure columns and sample data

### Step 5: Add Interactivity (Form Controls)
**Drag & Drop:**
9. **Button** (Form Controls category)
   - Add to Toolbar or Card
   - Label: "Export Report"
   - Variant: Primary

10. **Text Input** (Form Controls category)
    - Add for search/filter functionality
    - Placeholder: "Search..."

---

## Detailed Step-by-Step: Build a "Customer Support Dashboard"

### Phase 1: Setup (2 minutes)
1. **Open AppBuilder** from My Space or Templates
2. **Fill Basic Info** (right panel):
   - App Name: "Customer Support Dashboard"
   - Description: "Real-time dashboard for support team"
   - Industry: "Contact Center"
   - Save

### Phase 2: Layout Foundation (3 minutes)
**Order of drag & drop:**

1. **App Header** (Layout → App Header)
   - Drag to top
   - Properties: Enable all (Logo, Navbar, Avatar)
   - Background: White

2. **Toolbar** (Layout → Toolbar)
   - Drag below header
   - Enable: Search and Action Buttons
   - Background: Light gray (#f9fafb)

3. **Container** (Layout → Container)
   - Drag below toolbar
   - Padding: 24px
   - Background: White
   - Border Radius: 8px

### Phase 3: Content Structure (4 minutes)

4. **Grid** (Layout → Grid)
   - Drag inside Container
   - Columns: 4
   - Gap: 16px
   - Responsive: Yes

5. **Metric Cards** (Data Display → Metric Card)
   - Drag 4 cards into Grid:
     - **Card 1**: "Open Tickets" | "142" | "+5%"
     - **Card 2**: "Avg Response Time" | "2.3 min" | "-12%"
     - **Card 3**: "Satisfaction" | "4.8/5" | "+0.2"
     - **Card 4**: "Resolved Today" | "89" | "+15%"

6. **Section** (Layout → Section)
   - Drag below Grid
   - Padding: 24px
   - Background: Light gray

### Phase 4: Data Visualization (3 minutes)

7. **Line Chart** (Charts & Graphs → Line Chart)
   - Drag into Section
   - Title: "Ticket Volume Trend"
   - Configure sample data points

8. **Data Table** (Data Display → Data Table)
   - Drag below chart
   - Columns: Ticket ID, Customer, Status, Priority, Created
   - Add sample rows (5-10 rows)

### Phase 5: Platform Integration (2 minutes)

9. **SOP Reasoning Card** (Platform → SOP Reasoning Card)
   - Drag into a new Section
   - This shows AI-powered reasoning
   - Demonstrates platform integration

10. **Button** (Form Controls → Button)
    - Add "View All Tickets" button
    - Place in Toolbar or Section
    - Variant: Primary

### Phase 6: Polish & Save (2 minutes)

11. **Configure Colors** (if needed)
    - Use property panel to adjust colors
    - Match your brand

12. **Save** the application
13. **Test Live Preview** (eye icon)
14. **Publish to Store** (if ready)

---

## Demo Tips for Maximum Impact

### What to Show First:
1. **Start with empty canvas** - Show the blank slate
2. **Drag App Header first** - "See how easy it is to add professional header"
3. **Add Grid + Metric Cards** - "In 30 seconds, we have a dashboard"
4. **Add Chart** - "Data visualization in one drag"
5. **Show Platform Component** - "This is where our AI platform shines"
6. **Live Preview** - "See it working immediately"

### Key Talking Points:
- **"No code required"** - Everything is drag & drop
- **"67 components available"** - Rich component library
- **"Platform-aware"** - SOP Executor, Field Service components
- **"Instant preview"** - See changes in real-time
- **"Production-ready"** - Can publish to store immediately

### Recommended Demo Flow:
1. **30 seconds**: Drag App Header + Container
2. **1 minute**: Add Grid with 3 Metric Cards
3. **30 seconds**: Add a Chart
4. **1 minute**: Add Data Table with sample data
5. **30 seconds**: Show Platform Component (SOP Reasoning Card)
6. **30 seconds**: Configure properties (colors, labels)
7. **30 seconds**: Show Live Preview
8. **30 seconds**: Save and show "Publish to Store" option

**Total: ~5 minutes for a complete, working dashboard**

---

## Component Order Reference

### Always Start With (Foundation):
1. App Header
2. Container or Section
3. Grid (if you need multiple items side-by-side)

### Then Add (Content):
4. Metric Cards (for KPIs)
5. Cards (for grouped content)
6. Data Table (for tabular data)

### Then Visualize (Charts):
7. Bar Chart / Line Chart / Pie Chart
8. Charts work best inside Cards or Sections

### Then Interact (Forms):
9. Buttons (for actions)
10. Inputs (for search/filters)
11. Dropdowns (for selections)

### Finally (Platform):
12. Platform Components (SOP Reasoning, Work Orders, etc.)
13. These show the AI-native capabilities

---

## Common Patterns

### Pattern 1: Dashboard
```
App Header
  ↓
Toolbar (with search)
  ↓
Container
  ├─ Grid (3-4 columns)
  │   └─ Metric Cards
  └─ Section
      ├─ Line Chart
      └─ Data Table
```

### Pattern 2: Form Application
```
App Header
  ↓
Container
  └─ Card
      ├─ Text Inputs (multiple)
      ├─ Dropdown
      ├─ Date Picker
      └─ Button (Submit)
```

### Pattern 3: Detail View
```
App Header
  ↓
Container
  ├─ Card (Header info)
  ├─ Section (Details)
  │   └─ Data Table
  └─ Section (Actions)
      └─ Buttons
```

---

## Troubleshooting

**Can't drag components?**
- Make sure you're dragging from the component library (left panel)
- Drop onto the canvas area (center)
- Some components need to be inside Containers

**Components not showing?**
- Check if component is inside a Container or Section
- Verify the component is properly dropped (should see it in canvas)

**Properties not working?**
- Click on the component in canvas to select it
- Properties panel (right) should show component-specific options

**Want to delete?**
- Select component and press Delete key
- Or use trash icon in properties panel

---

## Next Steps After Building

1. **Save** your application
2. **Test** with Live Preview
3. **Configure Data Model** (if needed) - Left panel → Data Model tab
4. **Publish to Store** (Admin only)
5. **Share** with team members

---

## Pro Tips

- **Start simple**: Build a basic version first, then enhance
- **Use Grids**: They make layouts responsive automatically
- **Group related items**: Use Cards to group related components
- **Platform components**: Use them to show AI capabilities
- **Save often**: Use the Save button regularly
- **Test as you go**: Use Live Preview frequently

