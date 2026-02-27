# CPU Scheduling Algorithms Simulator

A comprehensive web-based simulator that visualizes and analyzes different CPU scheduling algorithms. Built with pure HTML, CSS, and JavaScript—no frameworks required.

## 🎯 Features

- **7 CPU Scheduling Algorithms**
  - FCFS (First Come First Serve)
  - SJF (Shortest Job First)
  - RRS (Round Robin Scheduling)
  - LJF (Longest Job First)
  - Priority Scheduling
  - LRTF (Longest Remaining Time First)
  - SRTF (Shortest Remaining Time First)

- **Process Management**
  - Add processes with custom Arrival Time, Burst Time, and Priority
  - Delete individual processes
  - Clear all processes at once
  - Real-time input validation

- **Scheduling Results**
  - Completion Time (CT)
  - Turnaround Time (TAT)
  - Waiting Time (WT)
  - Response Time (RT)
  - Average metrics for all processes

- **Gantt Chart Visualization**
  - Color-coded process execution timeline
  - Time axis labels
  - Process identification
  - Process legend

- **Modern UI**
  - Responsive design (mobile, tablet, desktop)
  - Dark theme with accent colors
  - Glassmorphism effects
  - Smooth animations

## 🎨 Professional Gantt Chart Visualization

The simulator features a **production-grade Gantt chart** that visualizes CPU scheduling with:

### Chart Features
- **Color-Coded Process Blocks**
  - Each process has a unique gradient color
  - Consistent colors across the chart and legend
  - 15 different color options for variety

- **Idle Time Visualization**
  - Dashed-border gray blocks represent idle CPU time
  - Automatically inserted between processes
  - Helps identify scheduling inefficiencies

- **Block Information**
  - Process ID displayed prominently
  - Execution time range shown below (e.g., "2–7")
  - Bold, white text for contrast
  - Rounded corners for modern appearance

- **Time Scale**
  - Numeric markers below the chart (0, 2, 4, 6, etc.)
  - Intelligent interval calculation based on max time
  - Perfectly aligned with block boundaries

- **Interactive Elements**
  - Blocks lift up on hover with shadow enhancement
  - Smooth animations when chart is rendered
  - Responsive to different screen sizes
  - Horizontal scrolling for wide charts

- **Professional Styling**
  - White background container
  - Light gray border (matching professional UIs)
  - Smooth shadows and depth
  - Glassmorphism effects on legend

- **Color Legend**
  - Shows all process colors in order
  - Interactive with hover effects
  - Smooth scaling animation on hover
  - Positioned below the chart for easy reference

### Chart Rendering Pipeline

The Gantt chart uses a **data-driven approach**:

1. **Data Generation** → Scheduling algorithms produce timeline segments
2. **Idle Block Insertion** → `addIdleBlocks()` adds gaps between segments
3. **Chart Rendering** → `renderGanttChart()` orchestrates visualization
4. **Block Creation** → `createGanttBlocks()` builds individual process blocks
5. **Scale Creation** → `createTimeScale()` adds time markers
6. **Legend Creation** → `createGanttLegend()` builds color reference

### Color Palette

Professional colors used in consistent order:
- **Indigo** (#6366f1)
- **Cyan** (#06b6d4)
- **Pink** (#ec4899)
- **Emerald** (#10b981)
- **Amber** (#f59e0b)
- **Blue** (#3b82f6)
- **Red** (#ef4444)
- **Violet** (#8b5cf6)
- **Teal** (#14b8a6)
- **Orange** (#f97316)
- Plus 5 additional colors for extended support

### Responsive Design

- **Desktop**: Full width chart with horizontal scrolling
- **Tablet**: Adapts to smaller viewport
- **Mobile**: Maintains readability with scroll capability
- All elements scale proportionally

### Animation Effects

- **Gantt Blocks**: staggered slide-in animation (ganttSlideIn)
- **Legend Items**: smooth hover transformation
- **Overall Chart**: fade-in on render
- **Smooth Scrolling**: enabled for better UX

### CSS Classes Reference

| Class | Purpose |
|-------|---------|
| `.gantt-section` | Outer container |
| `.gantt-container` | Flex layout for all chart parts |
| `.gantt-chart-wrapper` | White box with border and scroll |
| `.gantt-bar-container` | Flexbox for bar and scale |
| `.gantt-bar` | Horizontal process bar |
| `.gantt-block` | Individual process segment |
| `.gantt-block.idle` | Idle time segment |
| `.gantt-scale` | Time scale axis |
| `.gantt-legend-container` | Legend wrapper |
| `.gantt-legend-item` | Individual legend item |

### Performance Optimizations

- Minimal DOM operations
- Efficient flex layout
- CSS-based animations (GPU accelerated)
- No external libraries required
- Pure vanilla JavaScript



```
OS Project/
├── index.html           # Homepage with "Enter Dashboard" button
├── dashboard.html       # Main simulation interface
├── css/
│   └── styles.css       # All styling (responsive design, dark theme)
├── js/
│   └── app.js           # All scheduling algorithms and logic
└── README.md            # This file
```

## 🚀 How to Run

1. **Download or Clone the Project**
   ```
   Navigate to the project folder: c:\simulation\OS Project
   ```

2. **Open the Application**
   - **Option A**: Double-click `index.html` to open in your default browser
   - **Option B**: Right-click `index.html` → "Open with" → Choose your browser
   - **Option C**: Use a local server (Python, Node.js, etc.)
     ```bash
     # Python 3
     python -m http.server 8000
     
     # Python 2
     python -m SimpleHTTPServer 8000
     
     # Node.js (if http-server is installed)
     http-server
     ```
   - Then navigate to `http://localhost:8000` in your browser

3. **Click "Enter Dashboard"** to start using the simulator

## 📖 How to Use

### Step 1: Select an Algorithm
- Choose from the dropdown menu at the top of the form
- Different algorithms may require different input fields

### Step 2: Add Processes
Enter the following for each process:
- **Process ID**: Unique identifier (e.g., P1, P2, P3)
- **Arrival Time**: Time when process enters the system
- **Burst Time**: CPU time required by the process
- **Priority**: Only for Priority Scheduling (lower = higher priority)
- **Time Quantum**: Only for Round Robin (time slice for each process)

Click "Add Process" to add the process to the table.

### Step 3: Manage Processes
- View all added processes in the table
- Delete specific processes using the "Delete" button in each row
- Click "Reset Form" to clear input fields
- Click "Clear All" to remove all processes and reset results

### Step 4: Run Simulation
Click the "Visualize" button to:
- Schedule processes using the selected algorithm
- Calculate all metrics for each process
- Display results in a results table
- Show Gantt chart visualization
- Display average metrics

### Step 5: Analyze Results
- Review detailed metrics for each process
- Check average values for all processes
- View Gantt chart to understand execution order and timeline
- Use legend to identify process colors in the chart

## 🔄 Scheduling Algorithms Explained

### 1. FCFS (First Come First Serve)
- **Type**: Non-preemptive
- **Strategy**: Processes execute in order of arrival
- **Best For**: Simple, fair scheduling
- **Drawback**: Long waiting times for subsequent processes
- **Calculation**: Each process waits for all previous processes to complete

### 2. SJF (Shortest Job First)
- **Type**: Non-preemptive
- **Strategy**: Process with shortest burst time executes first
- **Best For**: Minimizing average waiting time
- **Drawback**: Longer processes may starve; unfair to long processes
- **Calculation**: Selects available process with minimum burst time

### 3. LJF (Longest Job First)
- **Type**: Non-preemptive
- **Strategy**: Process with longest burst time executes first
- **Best For**: Scheduling long tasks first
- **Drawback**: Short processes wait longer
- **Calculation**: Selects available process with maximum burst time

### 4. RRS (Round Robin Scheduling)
- **Type**: Preemptive
- **Strategy**: Each process gets a fixed time quantum (time slice)
- **Best For**: Fair CPU sharing among processes
- **Parameter**: Time Quantum (e.g., 2, 4, 8)
- **Calculation**: Process rotates in queue if not completed within time quantum
- **Note**: Averages depend on time quantum value

### 5. Priority Scheduling
- **Type**: Non-preemptive
- **Strategy**: Highest priority process executes first
- **Priority**: Lower numeric value = higher priority
- **Best For**: Important processes need faster execution
- **Calculation**: Selects available process with minimum priority value
- **Note**: Can lead to starvation of low-priority processes

### 6. SRTF (Shortest Remaining Time First)
- **Type**: Preemptive
- **Strategy**: Process with shortest remaining burst time executes first
- **Best For**: Minimizing average waiting time with preemption
- **Calculation**: Context switch when new process with less remaining time arrives
- **Advantage**: Better than SJF for reducing average waiting time

### 7. LRTF (Longest Remaining Time First)
- **Type**: Preemptive
- **Strategy**: Process with longest remaining burst time executes first
- **Best For**: Scheduling long tasks first with preemption
- **Calculation**: Context switch when new process with more remaining time arrives
- **Trade-off**: Fair but can cause high context switch overhead

## 📊 Metrics Explained

- **Arrival Time (AT)**: Time when process enters the ready queue
- **Burst Time (BT)**: Total CPU time required by the process
- **Completion Time (CT)**: Time when process finishes execution
- **Turnaround Time (TAT)**: CT - AT (total time from arrival to completion)
- **Waiting Time (WT)**: TAT - BT (time spent waiting, not executing)
- **Response Time (RT)**: First CPU access time - AT (time to first execution)

## 🎨 Color Scheme

- **Primary**: Cyan (#00d4ff) - Headers, highlights
- **Secondary**: Electric Blue (#0099ff) - Buttons, accents
- **Background**: Dark Navy (#0f1419, #1a1e2e)
- **Text**: Light Gray (#e0e0e0, #b0b0b0)
- **Variables**: 15 unique colors for Gantt chart processes

## 💻 Browser Compatibility

- Chrome/Chromium 60+
- Firefox 55+
- Safari 10+
- Edge 79+
- Opera 47+

## 🛠️ Technologies Used

- **HTML5**: Semantic markup and canvas for Gantt chart
- **CSS3**: Flexbox, Grid, Animations, Transformations
- **Vanilla JavaScript**: All scheduling logic, no frameworks

## 📝 Example Scenarios

### Scenario 1: Ideal Case for SJF
```
Processes: P1 (AT=0, BT=5), P2 (AT=0, BT=3), P3 (AT=0, BT=2)
SJF Order: P3 → P2 → P1
Result: Minimal average waiting time
```

### Scenario 2: Round Robin with Time Quantum
```
Processes: P1 (AT=0, BT=8), P2 (AT=0, BT=6)
Time Quantum: 2
Round Robin rotation ensures both processes get fair CPU time
```

### Scenario 3: Priority Scheduling
```
Processes: P1 (AT=0, BT=5, Priority=2), P2 (AT=0, BT=3, Priority=1)
Priority Order: P2 (priority 1) → P1 (priority 2)
```

## 🐛 Troubleshooting

**Issue**: Processes not appearing in table
- **Solution**: Ensure all required fields are filled and valid

**Issue**: "Visualize" button shows no results
- **Solution**: Add at least one process before clicking Visualize

**Issue**: Gantt chart not visible
- **Solution**: Check browser console for errors; ensure JavaScript is enabled

**Issue**: Wrong calculation results
- **Solution**: Verify the selected algorithm matches your expectation

## 📚 Algorithm Complexity

| Algorithm | Non-preemptive | Preemptive | Best Case | Worst Case |
|-----------|----------------|------------|-----------|------------|
| FCFS      | ✓              | -          | O(n)      | O(n)       |
| SJF       | ✓              | -          | O(n log n)| O(n²)      |
| RRS       | -              | ✓          | O(n)      | O(n²)      |
| LJF       | ✓              | -          | O(n log n)| O(n²)      |
| Priority  | ✓              | -          | O(n log n)| O(n²)      |
| SRTF      | -              | ✓          | O(n)      | O(n²)      |
| LRTF      | -              | ✓          | O(n)      | O(n²)      |

## 🎓 Educational Value

This simulator is ideal for:
- Operating Systems courses
- CPU Scheduling algorithm study
- System design education
- Performance analysis learning
- Visual algorithm understanding

## 📄 License

This project is created for educational purposes. Feel free to use and modify for learning.

## 👨‍💻 Author

Created as a comprehensive CPU Scheduling Simulator for educational use.

---

**Happy Scheduling! 🚀**
