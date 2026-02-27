/*
 * CPU Scheduling Algorithms Simulator - JavaScript Logic
 * 
 * This file implements all CPU scheduling algorithms:
 * 1. FCFS (First Come First Serve) - Non-preemptive, queue-based scheduling
 * 2. SJF (Shortest Job First) - Non-preemptive, sorts by burst time (ascending)
 * 3. RRS (Round Robin Scheduling) - Preemptive, time quantum-based rotation
 * 4. LJF (Longest Job First) - Non-preemptive, sorts by burst time (descending)
 * 5. Priority Scheduling - Non-preemptive, based on priority values (lower = higher priority)
 * 6. LRTF (Longest Remaining Time First) - Preemptive version of LJF
 * 7. SRTF (Shortest Remaining Time First) - Preemptive version of SJF
 *
 * Each algorithm calculates:
 * - Completion Time (CT): When process finishes
 * - Turnaround Time (TAT): CT - Arrival Time
 * - Waiting Time (WT): TAT - Burst Time
 * - Response Time (RT): First time process gets CPU - Arrival Time
 */

// Global data structure
let processes = [];
let currentAlgorithm = 'fcfs';
let simulationResults = null;

// ============ DOM INITIALIZATION ============

document.addEventListener('DOMContentLoaded', function() {
    const algorithmSelect = document.getElementById('algorithm-select');
    algorithmSelect.addEventListener('change', handleAlgorithmChange);
});

// ============ EVENT HANDLERS ============

function handleAlgorithmChange() {
    currentAlgorithm = document.getElementById('algorithm-select').value;
    
    // Show/hide algorithm-specific inputs
    const priorityGroup = document.getElementById('priority-group');
    const quantumGroup = document.getElementById('quantum-group');
    
    if (currentAlgorithm === 'priority') {
        priorityGroup.style.display = 'block';
        quantumGroup.style.display = 'none';
    } else if (currentAlgorithm === 'rrs') {
        quantumGroup.style.display = 'block';
        priorityGroup.style.display = 'none';
    } else {
        priorityGroup.style.display = 'none';
        quantumGroup.style.display = 'none';
    }
}

function addProcess() {
    clearError();
    
    const processId = document.getElementById('process-id').value.trim();
    const arrivalTime = parseFloat(document.getElementById('arrival-time').value);
    const burstTime = parseFloat(document.getElementById('burst-time').value);
    const priority = parseFloat(document.getElementById('priority').value) || Infinity;
    const timeQuantum = parseFloat(document.getElementById('time-quantum').value) || 2;
    
    // Validation
    if (!processId) {
        showError('Process ID is required');
        return;
    }
    
    if (isNaN(arrivalTime) || arrivalTime < 0) {
        showError('Arrival Time must be a non-negative number');
        return;
    }
    
    if (isNaN(burstTime) || burstTime <= 0) {
        showError('Burst Time must be a positive number');
        return;
    }
    
    if (currentAlgorithm === 'priority' && isNaN(priority)) {
        showError('Priority is required for Priority Scheduling');
        return;
    }
    
    if (currentAlgorithm === 'rrs' && isNaN(timeQuantum)) {
        showError('Time Quantum is required for Round Robin');
        return;
    }
    
    // Check for duplicate process ID
    if (processes.some(p => p.id === processId)) {
        showError('Process ID already exists');
        return;
    }
    
    // Add process
    const process = {
        id: processId,
        arrivalTime: arrivalTime,
        burstTime: burstTime,
        priority: priority,
        timeQuantum: timeQuantum,
        originalBurstTime: burstTime
    };
    
    processes.push(process);
    updateTable();
    resetForm();
}

function deleteProcess(index) {
    processes.splice(index, 1);
    updateTable();
    document.getElementById('results-section').style.display = 'none';
}

function resetForm() {
    document.getElementById('process-id').value = '';
    document.getElementById('arrival-time').value = '';
    document.getElementById('burst-time').value = '';
    document.getElementById('priority').value = '';
    document.getElementById('time-quantum').value = '';
    clearError();
}

function clearAll() {
    processes = [];
    resetForm();
    updateTable();
    document.getElementById('results-section').style.display = 'none';
    
    // Reset detailed analytics
    const analyticsTableBody = document.getElementById('analytics-table-body');
    if (analyticsTableBody) analyticsTableBody.innerHTML = '';
    
    const statElements = [
        'wt-min', 'wt-max', 'wt-median', 'wt-avg', 'wt-stddev',
        'tat-min', 'tat-max', 'tat-median', 'tat-avg', 'tat-stddev',
        'bt-min', 'bt-max', 'bt-median', 'bt-avg', 'bt-total',
        'algorithm-used', 'total-processes', 'context-switches', 'throughput', 'avg-response-ratio'
    ];
    
    statElements.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.textContent = '—';
    });
    
    const pieContainer = document.getElementById('time-distribution-pie');
    if (pieContainer) pieContainer.innerHTML = '';
    
    const legendContainer = document.getElementById('time-distribution-legend');
    if (legendContainer) legendContainer.innerHTML = '';
}

function runSimulation() {
    if (processes.length === 0) {
        showError('Please add at least one process');
        return;
    }
    
    // Reset burst times for preemptive algorithms
    processes.forEach(p => {
        p.burstTime = p.originalBurstTime;
    });
    
    let results;
    switch(currentAlgorithm) {
        case 'fcfs':
            results = scheduleFCFS();
            break;
        case 'sjf':
            results = scheduleSJF();
            break;
        case 'rrs':
            results = scheduleRoundRobin();
            break;
        case 'ljf':
            results = scheduleLJF();
            break;
        case 'priority':
            results = schedulePriority();
            break;
        case 'lrtf':
            results = scheduleLRTF();
            break;
        case 'srtf':
            results = scheduleSRTF();
            break;
        default:
            results = scheduleFCFS();
    }
    
    simulationResults = results;
    displayResults(results);
}

// ============ SCHEDULING ALGORITHMS ============

function scheduleFCFS() {
    /*
     * FCFS (First Come First Serve)
     * Non-preemptive scheduling algorithm
     * Processes execute in order of arrival
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const results = [];
    let currentTime = 0;
    
    sorted.forEach(process => {
        // Process starts after previous process completes or at its arrival time
        const startTime = Math.max(currentTime, process.arrivalTime);
        const completionTime = startTime + process.burstTime;
        const turnaroundTime = completionTime - process.arrivalTime;
        const waitingTime = turnaroundTime - process.burstTime;
        const responseTime = startTime - process.arrivalTime;
        
        results.push({
            id: process.id,
            arrivalTime: process.arrivalTime,
            burstTime: process.originalBurstTime,
            startTime: startTime,
            completionTime: completionTime,
            turnaroundTime: turnaroundTime,
            waitingTime: waitingTime,
            responseTime: responseTime,
            ganttSegments: [{
                processId: process.id,
                start: startTime,
                end: completionTime
            }]
        });
        
        currentTime = completionTime;
    });
    
    return {
        processesMetrics: results,
        ganttData: results.flatMap(r => r.ganttSegments),
        algorithmName: 'FCFS'
    };
}

function scheduleSJF() {
    /*
     * SJF (Shortest Job First)
     * Non-preemptive scheduling algorithm
     * Processes with shortest burst time are executed first
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const results = [];
    const completed = new Set();
    let currentTime = 0;
    let ganttData = [];
    
    while (completed.size < sorted.length) {
        // Find available processes at current time
        const available = sorted.filter((p, i) => 
            !completed.has(i) && p.arrivalTime <= currentTime
        );
        
        if (available.length === 0) {
            // No process available, jump to next arrival time
            const nextArrival = sorted.find((p, i) => !completed.has(i));
            currentTime = nextArrival.arrivalTime;
        } else {
            // Find process with shortest burst time
            const originalIndices = sorted.map((p, i) => i);
            let minBurst = Infinity;
            let selectedIdx = -1;
            
            available.forEach(p => {
                if (p.burstTime < minBurst) {
                    minBurst = p.burstTime;
                    selectedIdx = originalIndices[sorted.indexOf(p)];
                }
            });
            
            const process = sorted[selectedIdx];
            const startTime = currentTime;
            const completionTime = startTime + process.burstTime;
            const turnaroundTime = completionTime - process.arrivalTime;
            const waitingTime = turnaroundTime - process.originalBurstTime;
            const responseTime = startTime - process.arrivalTime;
            
            results.push({
                id: process.id,
                arrivalTime: process.arrivalTime,
                burstTime: process.originalBurstTime,
                startTime: startTime,
                completionTime: completionTime,
                turnaroundTime: turnaroundTime,
                waitingTime: waitingTime,
                responseTime: responseTime
            });
            
            ganttData.push({
                processId: process.id,
                start: startTime,
                end: completionTime
            });
            
            completed.add(selectedIdx);
            currentTime = completionTime;
        }
    }
    
    return {
        processesMetrics: results,
        ganttData: ganttData,
        algorithmName: 'SJF'
    };
}

function scheduleLJF() {
    /*
     * LJF (Longest Job First)
     * Non-preemptive scheduling algorithm
     * Processes with longest burst time are executed first
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const results = [];
    const completed = new Set();
    let currentTime = 0;
    let ganttData = [];
    
    while (completed.size < sorted.length) {
        const available = sorted.filter((p, i) => 
            !completed.has(i) && p.arrivalTime <= currentTime
        );
        
        if (available.length === 0) {
            const nextArrival = sorted.find((p, i) => !completed.has(i));
            currentTime = nextArrival.arrivalTime;
        } else {
            const originalIndices = sorted.map((p, i) => i);
            let maxBurst = -1;
            let selectedIdx = -1;
            
            available.forEach(p => {
                if (p.burstTime > maxBurst) {
                    maxBurst = p.burstTime;
                    selectedIdx = originalIndices[sorted.indexOf(p)];
                }
            });
            
            const process = sorted[selectedIdx];
            const startTime = currentTime;
            const completionTime = startTime + process.burstTime;
            const turnaroundTime = completionTime - process.arrivalTime;
            const waitingTime = turnaroundTime - process.originalBurstTime;
            const responseTime = startTime - process.arrivalTime;
            
            results.push({
                id: process.id,
                arrivalTime: process.arrivalTime,
                burstTime: process.originalBurstTime,
                startTime: startTime,
                completionTime: completionTime,
                turnaroundTime: turnaroundTime,
                waitingTime: waitingTime,
                responseTime: responseTime
            });
            
            ganttData.push({
                processId: process.id,
                start: startTime,
                end: completionTime
            });
            
            completed.add(selectedIdx);
            currentTime = completionTime;
        }
    }
    
    return {
        processesMetrics: results,
        ganttData: ganttData,
        algorithmName: 'LJF'
    };
}

function scheduleRoundRobin() {
    /*
     * RRS (Round Robin Scheduling)
     * Preemptive scheduling algorithm
     * Each process gets a fixed time quantum (time slice)
     * If not completed, process goes to back of queue
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const processQueue = [];
    const results = [];
    const firstResponseTime = new Map();
    let currentTime = 0;
    let ganttData = [];
    
    // Get time quantum
    const timeQuantum = parseFloat(document.getElementById('time-quantum').value) || 2;
    
    // Initialize queue with processes at time 0
    sorted.forEach((p, i) => {
        if (p.arrivalTime === 0) {
            processQueue.push({...p, originalIndex: i});
        }
    });
    
    let nextArrivalIndex = sorted.findIndex(p => p.arrivalTime > 0);
    
    while (processQueue.length > 0 || nextArrivalIndex < sorted.length) {
        if (processQueue.length === 0) {
            // No process in queue, jump to next arrival time
            const nextProcess = sorted[nextArrivalIndex];
            currentTime = nextProcess.arrivalTime;
            
            // Add all processes arriving at this time
            for (let i = nextArrivalIndex; i < sorted.length && sorted[i].arrivalTime === currentTime; i++) {
                processQueue.push({...sorted[i], originalIndex: i});
                nextArrivalIndex++;
            }
        } else {
            // Get front of queue
            const process = processQueue.shift();
            
            // Record first response time
            if (!firstResponseTime.has(process.id)) {
                firstResponseTime.set(process.id, currentTime - process.arrivalTime);
            }
            
            // Execute for time quantum or remaining burst time
            const executionTime = Math.min(timeQuantum, process.burstTime);
            const startTime = currentTime;
            const endTime = startTime + executionTime;
            
            ganttData.push({
                processId: process.id,
                start: startTime,
                end: endTime
            });
            
            process.burstTime -= executionTime;
            currentTime = endTime;
            
            // Add newly arrived processes
            while (nextArrivalIndex < sorted.length && sorted[nextArrivalIndex].arrivalTime <= currentTime) {
                processQueue.push({...sorted[nextArrivalIndex], originalIndex: nextArrivalIndex});
                nextArrivalIndex++;
            }
            
            // If process not completed, add back to queue
            if (process.burstTime > 0) {
                processQueue.push(process);
            } else {
                // Process completed
                const completionTime = currentTime;
                const turnaroundTime = completionTime - process.arrivalTime;
                const waitingTime = turnaroundTime - process.originalBurstTime;
                
                // Find existing result or create new
                let result = results.find(r => r.id === process.id);
                if (!result) {
                    result = {
                        id: process.id,
                        arrivalTime: process.arrivalTime,
                        burstTime: process.originalBurstTime,
                        completionTime: completionTime,
                        turnaroundTime: turnaroundTime,
                        waitingTime: waitingTime,
                        responseTime: firstResponseTime.get(process.id) || 0
                    };
                    results.push(result);
                } else {
                    result.completionTime = completionTime;
                    result.turnaroundTime = turnaroundTime;
                    result.waitingTime = waitingTime;
                }
            }
        }
    }
    
    // Ensure all processes are in results
    sorted.forEach(p => {
        if (!results.find(r => r.id === p.id)) {
            const completionTime = currentTime;
            const turnaroundTime = completionTime - p.arrivalTime;
            results.push({
                id: p.id,
                arrivalTime: p.arrivalTime,
                burstTime: p.originalBurstTime,
                completionTime: completionTime,
                turnaroundTime: turnaroundTime,
                waitingTime: turnaroundTime - p.originalBurstTime,
                responseTime: firstResponseTime.get(p.id) || 0
            });
        }
    });
    
    return {
        processesMetrics: results,
        ganttData: ganttData,
        algorithmName: 'Round Robin'
    };
}

function schedulePriority() {
    /*
     * Priority Scheduling
     * Non-preemptive scheduling based on priority values
     * Lower priority value = higher priority (executes first)
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const results = [];
    const completed = new Set();
    let currentTime = 0;
    let ganttData = [];
    
    while (completed.size < sorted.length) {
        const available = sorted.filter((p, i) => 
            !completed.has(i) && p.arrivalTime <= currentTime
        );
        
        if (available.length === 0) {
            const nextArrival = sorted.find((p, i) => !completed.has(i));
            currentTime = nextArrival.arrivalTime;
        } else {
            // Find process with highest priority (lowest priority value)
            const originalIndices = sorted.map((p, i) => i);
            let highestPriority = Infinity;
            let selectedIdx = -1;
            
            available.forEach(p => {
                if (p.priority < highestPriority) {
                    highestPriority = p.priority;
                    selectedIdx = originalIndices[sorted.indexOf(p)];
                }
            });
            
            const process = sorted[selectedIdx];
            const startTime = currentTime;
            const completionTime = startTime + process.burstTime;
            const turnaroundTime = completionTime - process.arrivalTime;
            const waitingTime = turnaroundTime - process.originalBurstTime;
            const responseTime = startTime - process.arrivalTime;
            
            results.push({
                id: process.id,
                arrivalTime: process.arrivalTime,
                burstTime: process.originalBurstTime,
                startTime: startTime,
                completionTime: completionTime,
                turnaroundTime: turnaroundTime,
                waitingTime: waitingTime,
                responseTime: responseTime
            });
            
            ganttData.push({
                processId: process.id,
                start: startTime,
                end: completionTime
            });
            
            completed.add(selectedIdx);
            currentTime = completionTime;
        }
    }
    
    return {
        processesMetrics: results,
        ganttData: ganttData,
        algorithmName: 'Priority Scheduling'
    };
}

function scheduleSRTF() {
    /*
     * SRTF (Shortest Remaining Time First)
     * Preemptive version of SJF
     * Process with shortest remaining burst time is executed first
     * Preempts when new process arrives with less remaining time
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const processStates = sorted.map((p, i) => ({
        ...p,
        remainingTime: p.burstTime,
        originalIndex: i,
        startTime: null,
        firstExecutionTime: null
    }));
    
    const results = [];
    let currentTime = 0;
    let ganttData = [];
    const firstResponseTime = new Map();
    
    while (processStates.some(p => p.remainingTime > 0)) {
        // Find available processes at current time
        const available = processStates.filter(p => 
            p.remainingTime > 0 && p.arrivalTime <= currentTime
        );
        
        if (available.length === 0) {
            // Jump to next arrival time
            const nextArrival = processStates.find(p => p.remainingTime > 0 && p.arrivalTime > currentTime);
            if (nextArrival) {
                currentTime = nextArrival.arrivalTime;
                available.push(...processStates.filter(p => 
                    p.remainingTime > 0 && p.arrivalTime <= currentTime
                ));
            }
        }
        
        if (available.length === 0) break;
        
        // Find process with shortest remaining time
        const selected = available.reduce((min, p) => 
            p.remainingTime < min.remainingTime ? p : min
        );
        
        // Record first execution time
        if (!firstResponseTime.has(selected.id)) {
            firstResponseTime.set(selected.id, currentTime - selected.arrivalTime);
        }
        
        if (selected.firstExecutionTime === null) {
            selected.firstExecutionTime = currentTime;
        }
        
        // Execute for 1 time unit
        selected.remainingTime--;
        currentTime++;
        
        // Check if process is completed
        if (selected.remainingTime === 0) {
            results.push({
                id: selected.id,
                arrivalTime: selected.arrivalTime,
                burstTime: selected.originalBurstTime,
                completionTime: currentTime - 1,
                turnaroundTime: (currentTime - 1) - selected.arrivalTime,
                waitingTime: ((currentTime - 1) - selected.arrivalTime) - selected.originalBurstTime,
                responseTime: firstResponseTime.get(selected.id) || 0
            });
        }
        
        // Add gantt segment
        if (ganttData.length === 0 || ganttData[ganttData.length - 1].processId !== selected.id) {
            ganttData.push({
                processId: selected.id,
                start: currentTime - 1,
                end: currentTime
            });
        } else {
            ganttData[ganttData.length - 1].end = currentTime;
        }
    }
    
    return {
        processesMetrics: results,
        ganttData: ganttData,
        algorithmName: 'SRTF'
    };
}

function scheduleLRTF() {
    /*
     * LRTF (Longest Remaining Time First)
     * Preemptive version of LJF
     * Process with longest remaining burst time is executed first
     */
    const sorted = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    const processStates = sorted.map((p, i) => ({
        ...p,
        remainingTime: p.burstTime,
        originalIndex: i,
        startTime: null,
        firstExecutionTime: null
    }));
    
    const results = [];
    let currentTime = 0;
    let ganttData = [];
    const firstResponseTime = new Map();
    
    while (processStates.some(p => p.remainingTime > 0)) {
        const available = processStates.filter(p => 
            p.remainingTime > 0 && p.arrivalTime <= currentTime
        );
        
        if (available.length === 0) {
            const nextArrival = processStates.find(p => p.remainingTime > 0 && p.arrivalTime > currentTime);
            if (nextArrival) {
                currentTime = nextArrival.arrivalTime;
            }
            continue;
        }
        
        // Find process with longest remaining time
        const selected = available.reduce((max, p) => 
            p.remainingTime > max.remainingTime ? p : max
        );
        
        if (!firstResponseTime.has(selected.id)) {
            firstResponseTime.set(selected.id, currentTime - selected.arrivalTime);
        }
        
        if (selected.firstExecutionTime === null) {
            selected.firstExecutionTime = currentTime;
        }
        
        // Execute for 1 time unit
        selected.remainingTime--;
        currentTime++;
        
        if (selected.remainingTime === 0) {
            results.push({
                id: selected.id,
                arrivalTime: selected.arrivalTime,
                burstTime: selected.originalBurstTime,
                completionTime: currentTime - 1,
                turnaroundTime: (currentTime - 1) - selected.arrivalTime,
                waitingTime: ((currentTime - 1) - selected.arrivalTime) - selected.originalBurstTime,
                responseTime: firstResponseTime.get(selected.id) || 0
            });
        }
        
        if (ganttData.length === 0 || ganttData[ganttData.length - 1].processId !== selected.id) {
            ganttData.push({
                processId: selected.id,
                start: currentTime - 1,
                end: currentTime
            });
        } else {
            ganttData[ganttData.length - 1].end = currentTime;
        }
    }
    
    return {
        processesMetrics: results,
        ganttData: ganttData,
        algorithmName: 'LRTF'
    };
}

// ============ UI UPDATE FUNCTIONS ============

function updateTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = '';
    
    processes.forEach((process, index) => {
        const row = tbody.insertRow();
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.priority === Infinity ? '-' : process.priority}</td>
            <td><button class="btn btn-delete" onclick="deleteProcess(${index})">Delete</button></td>
        `;
    });
}

function displayResults(results) {
    // Display process metrics
    const resultsBody = document.getElementById('results-body');
    resultsBody.innerHTML = '';
    
    results.processesMetrics.sort((a, b) => a.id.localeCompare(b.id)).forEach(result => {
        const row = resultsBody.insertRow();
        row.innerHTML = `
            <td>${result.id}</td>
            <td>${result.arrivalTime}</td>
            <td>${result.burstTime}</td>
            <td>${result.completionTime.toFixed(2)}</td>
            <td>${result.turnaroundTime.toFixed(2)}</td>
            <td>${result.waitingTime.toFixed(2)}</td>
            <td>${result.responseTime.toFixed(2)}</td>
        `;
    });
    
    // Calculate averages
    const metrics = results.processesMetrics;
    const avgTAT = (metrics.reduce((sum, p) => sum + p.turnaroundTime, 0) / metrics.length).toFixed(2);
    const avgWT = (metrics.reduce((sum, p) => sum + p.waitingTime, 0) / metrics.length).toFixed(2);
    const avgCT = (metrics.reduce((sum, p) => sum + p.completionTime, 0) / metrics.length).toFixed(2);
    const avgRT = (metrics.reduce((sum, p) => sum + p.responseTime, 0) / metrics.length).toFixed(2);
    
    document.getElementById('avg-tat').textContent = avgTAT;
    document.getElementById('avg-wt').textContent = avgWT;
    document.getElementById('avg-ct').textContent = avgCT;
    document.getElementById('avg-rt').textContent = avgRT;
    
    // Add idle blocks to gantt data
    const ganttDataWithIdle = addIdleBlocks(results.ganttData);
    
    // Draw Gantt chart
    renderGanttChart(ganttDataWithIdle, metrics);
    
    // Update analytics dashboard
    updateDashboard(metrics, ganttDataWithIdle);
    
    // Show results section
    document.getElementById('results-section').style.display = 'block';
}

function addIdleBlocks(ganttData) {
    /*
     * Adds idle time blocks to gantt data where there are gaps
     * Sorts gantt data by start time and inserts idle blocks
     */
    if (!ganttData || ganttData.length === 0) return ganttData;
    
    const sorted = [...ganttData].sort((a, b) => a.start - b.start);
    const result = [];
    let currentTime = 0;
    
    sorted.forEach((segment, index) => {
        // Add idle block if there's a gap
        if (segment.start > currentTime) {
            result.push({
                processId: 'Idle',
                start: currentTime,
                end: segment.start
            });
        }
        
        result.push(segment);
        currentTime = segment.end;
    });
    
    return result;
}

// ============ PROFESSIONAL GANTT CHART RENDERING ============

function renderGanttChart(ganttData, metrics) {
    /*
     * Renders a professional Gantt chart with:
     * - Colored process blocks with gradient backgrounds
     * - Idle time blocks with dashed borders
     * - Time scale below the chart
     * - Color-coded legend
     */
    if (!ganttData || ganttData.length === 0) {
        document.getElementById('gantt-bar').innerHTML = '<p>No scheduling data available</p>';
        return;
    }
    
    // Calculate max time
    const maxTime = Math.max(...ganttData.map(s => s.end));
    
    // Get color map
    const uniqueProcesses = [...new Set(ganttData.map(s => s.processId))].filter(p => p !== 'Idle');
    const colorMap = getColorMap(uniqueProcesses);
    
    // Render chart components
    createGanttBlocks(ganttData, maxTime, colorMap);
    createTimeScale(maxTime);
    createGanttLegend(ganttData, colorMap);
}

function createGanttBlocks(ganttData, maxTime, colorMap) {
    /*
     * Creates individual Gantt chart blocks for each process segment
     * - Calculates width based on execution time
     * - Applies gradient colors for processes
     * - Adds labels with process ID and time range
     */
    const ganttBar = document.getElementById('gantt-bar');
    ganttBar.innerHTML = '';
    
    ganttData.forEach((segment, index) => {
        // Calculate block width as percentage
        const duration = segment.end - segment.start;
        const widthPercent = ((duration) / maxTime) * 100;
        
        // Create block element
        const block = document.createElement('div');
        block.className = 'gantt-block';
        
        if (segment.processId === 'Idle') {
            block.classList.add('idle');
        } else {
            const color = colorMap[segment.processId];
            // Create gradient background
            block.style.background = `linear-gradient(135deg, ${color}dd 0%, ${color}99 100%)`;
        }
        
        block.style.width = widthPercent + '%';
        block.setAttribute('data-start', segment.start);
        block.setAttribute('data-end', segment.end);
        
        // Create block content
        const content = document.createElement('div');
        content.className = 'gantt-block-content';
        
        // Process ID
        const pid = document.createElement('div');
        pid.className = 'gantt-block-pid';
        pid.textContent = segment.processId;
        
        // Time range
        const timeRange = document.createElement('div');
        timeRange.className = 'gantt-block-time';
        timeRange.textContent = `${segment.start}–${segment.end}`;
        
        content.appendChild(pid);
        content.appendChild(timeRange);
        block.appendChild(content);
        
        // Add animation delay
        block.style.animation = `ganttSlideIn 0.4s ease-out ${index * 0.05}s both`;
        
        ganttBar.appendChild(block);
    });
}

function createTimeScale(maxTime) {
    /*
     * Creates time markers below the Gantt bar
     * - Calculates intelligent intervals (0, 2, 4, 6, etc.)
     * - Aligns with block boundaries
     */
    const ganttScale = document.getElementById('gantt-scale');
    ganttScale.innerHTML = '';
    
    // Calculate interval for time scale
    let interval = 1;
    if (maxTime > 20) interval = 5;
    if (maxTime > 50) interval = 10;
    if (maxTime > 100) interval = 20;
    
    // Create scale marks
    for (let time = 0; time <= maxTime; time += interval) {
        const mark = document.createElement('div');
        mark.className = 'gantt-scale-mark';
        mark.style.flex = interval;
        
        const text = document.createElement('div');
        text.className = 'gantt-scale-text';
        text.textContent = time;
        
        mark.appendChild(text);
        ganttScale.appendChild(mark);
    }
}

function createGanttLegend(ganttData, colorMap) {
    /*
     * Creates legend showing process colors
     * - Extracts unique process IDs from ganttData
     * - Maps colors consistently with chart blocks
     */
    const legendContainer = document.getElementById('gantt-legend');
    legendContainer.innerHTML = '';
    
    // Get unique processes in order (excluding Idle)
    const uniqueProcesses = [];
    const seenProcesses = new Set();
    
    ganttData.forEach(segment => {
        if (segment.processId !== 'Idle' && !seenProcesses.has(segment.processId)) {
            uniqueProcesses.push(segment.processId);
            seenProcesses.add(segment.processId);
        }
    });
    
    // Create legend items
    uniqueProcesses.forEach(processId => {
        const legendItem = document.createElement('div');
        legendItem.className = 'gantt-legend-item';
        
        const colorBox = document.createElement('div');
        colorBox.className = 'gantt-legend-color';
        const color = colorMap[processId];
        colorBox.style.background = `linear-gradient(135deg, ${color}dd 0%, ${color}99 100%)`;
        colorBox.style.border = `1px solid ${color}`;
        
        const label = document.createElement('div');
        label.className = 'gantt-legend-label';
        label.textContent = processId;
        
        legendItem.appendChild(colorBox);
        legendItem.appendChild(label);
        
        legendContainer.appendChild(legendItem);
    });
}

function getColorMap(processes) {
    /*
     * Maps process IDs to unique colors
     * - Uses a curated palette of professional colors
     * - Returns a consistent mapping for all algorithm runs
     * Colors: Purple, Cyan, Pink, Green, Orange, Blue, Red, Yellow variations
     */
    const colors = [
        '#6366f1', // Indigo
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#8b5cf6', // Violet
        '#14b8a6', // Teal
        '#f97316', // Orange
        '#06d6a0', // Spring Green
        '#118ab2', // Ocean Blue
        '#ff006e', // Hot Pink
        '#fb5607', // Burnt Orange
        '#73b7f7'  // Sky Blue
    ];
    
    const colorMap = {};
    const sortedProcesses = [...processes].sort();
    
    sortedProcesses.forEach((p, i) => {
        colorMap[p] = colors[i % colors.length];
    });
    
    return colorMap;
}

// ============ ERROR HANDLING ============

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.classList.add('show');
    setTimeout(() => {
        errorDiv.classList.remove('show');
    }, 5000);
}

function clearError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.classList.remove('show');
}

// ============ ANALYTICS DASHBOARD FUNCTIONS ============

/**
 * Calculate analytics metrics from simulation results
 * @param {Array} processMetrics - Array of process results with TAT, WT, CT, etc.
 * @param {Array} ganttData - Array of gantt sequence data
 * @returns {Object} Analytics object with calculated metrics
 */
function calculateAnalytics(processMetrics, ganttData) {
    if (!processMetrics || processMetrics.length === 0) {
        return {
            avgWaitingTime: 0,
            avgTurnaroundTime: 0,
            cpuUtilization: 0,
            totalExecutionTime: 0
        };
    }

    // Calculate average waiting time
    const totalWaitingTime = processMetrics.reduce((sum, p) => sum + p.waitingTime, 0);
    const avgWaitingTime = totalWaitingTime / processMetrics.length;

    // Calculate average turnaround time
    const totalTurnaroundTime = processMetrics.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const avgTurnaroundTime = totalTurnaroundTime / processMetrics.length;

    // Calculate total execution time (max completion time)
    const totalExecutionTime = Math.max(...processMetrics.map(p => p.completionTime));

    // Calculate CPU utilization
    // Total busy time = sum of all burst times
    const totalBusyTime = processMetrics.reduce((sum, p) => sum + p.burstTime, 0);
    const cpuUtilization = (totalBusyTime / totalExecutionTime) * 100;

    return {
        avgWaitingTime: Math.round(avgWaitingTime * 100) / 100,
        avgTurnaroundTime: Math.round(avgTurnaroundTime * 100) / 100,
        cpuUtilization: Math.round(cpuUtilization * 100) / 100,
        totalExecutionTime: totalExecutionTime
    };
}

/**
 * Render analytics KPI cards with calculated values
 * @param {Object} analyticsData - Object with calculated analytics metrics
 */
function renderAnalyticsCards(analyticsData) {
    const kpiWaitingTime = document.getElementById('kpi-waiting-time');
    const kpiTurnaroundTime = document.getElementById('kpi-turnaround-time');
    const kpiCpuUtilization = document.getElementById('kpi-cpu-utilization');
    const kpiExecutionTime = document.getElementById('kpi-execution-time');

    if (kpiWaitingTime) {
        kpiWaitingTime.textContent = analyticsData.avgWaitingTime.toFixed(2);
    }
    if (kpiTurnaroundTime) {
        kpiTurnaroundTime.textContent = analyticsData.avgTurnaroundTime.toFixed(2);
    }
    if (kpiCpuUtilization) {
        kpiCpuUtilization.textContent = analyticsData.cpuUtilization.toFixed(2);
    }
    if (kpiExecutionTime) {
        kpiExecutionTime.textContent = analyticsData.totalExecutionTime;
    }
}

/**
 * Render performance chart with process metrics
 * @param {Array} processMetrics - Array of process results
 */
function renderPerformanceChart(processMetrics) {
    const performanceChart = document.getElementById('performance-chart');
    const chartXAxis = document.getElementById('chart-x-axis');

    if (!performanceChart || !chartXAxis) {
        return;
    }

    // Clear previous content
    performanceChart.innerHTML = '';
    chartXAxis.innerHTML = '';

    if (!processMetrics || processMetrics.length === 0) {
        return;
    }

    // Find max value for y-axis scaling
    const maxValue = Math.max(...processMetrics.flatMap(p => [
        p.burstTime,
        p.waitingTime,
        p.turnaroundTime
    ]));

    // Scale factor for chart height (adjust based on container height)
    const chartHeight = 280; // pixels
    const scaleFactor = chartHeight / (maxValue * 1.1); // 1.1 for some top padding

    // Render each process group
    processMetrics.forEach((process, index) => {
        const processGroup = document.createElement('div');
        processGroup.className = 'process-group';

        // Burst Time bar
        const burstBar = document.createElement('div');
        burstBar.className = 'bar burst-time';
        const burstHeight = process.burstTime * scaleFactor;
        burstBar.style.height = burstHeight + 'px';
        burstBar.style.minHeight = burstHeight > 5 ? 'auto' : '5px';
        burstBar.title = `P${process.id} Burst: ${process.burstTime}`;
        processGroup.appendChild(burstBar);

        // Waiting Time bar
        const waitBar = document.createElement('div');
        waitBar.className = 'bar waiting-time';
        const waitHeight = process.waitingTime * scaleFactor;
        waitBar.style.height = waitHeight + 'px';
        waitBar.style.minHeight = waitHeight > 5 ? 'auto' : '5px';
        waitBar.title = `P${process.id} Waiting: ${process.waitingTime}`;
        processGroup.appendChild(waitBar);

        // Turnaround Time bar
        const tatBar = document.createElement('div');
        tatBar.className = 'bar turnaround-time';
        const tatHeight = process.turnaroundTime * scaleFactor;
        tatBar.style.height = tatHeight + 'px';
        tatBar.style.minHeight = tatHeight > 5 ? 'auto' : '5px';
        tatBar.title = `P${process.id} Turnaround: ${process.turnaroundTime}`;
        processGroup.appendChild(tatBar);

        performanceChart.appendChild(processGroup);

        // Add x-axis label
        const xLabel = document.createElement('div');
        xLabel.className = 'x-label';
        xLabel.textContent = `P${process.id}`;
        chartXAxis.appendChild(xLabel);
    });

    // Render Y-axis scale
    const yAxis = document.querySelector('.chart-y-axis');
    if (yAxis) {
        yAxis.innerHTML = '';
        
        // Create 5-6 Y-axis labels
        const steps = 5;
        for (let i = steps; i >= 0; i--) {
            const label = document.createElement('div');
            label.className = 'y-label';
            const value = Math.round((maxValue / steps) * i);
            label.textContent = value;
            yAxis.appendChild(label);
        }
    }
}

/**
 * Update entire analytics dashboard
 * @param {Array} processMetrics - Array of process results
 * @param {Array} ganttData - Array of gantt sequence data
 */
function updateDashboard(processMetrics, ganttData) {
    // Calculate analytics
    const analyticsData = calculateAnalytics(processMetrics, ganttData);
    
    // Render KPI cards
    renderAnalyticsCards(analyticsData);
    
    // Render performance chart
    renderPerformanceChart(processMetrics);
    
    // Render detailed analytics
    renderProcessAnalyticsTable(processMetrics);
    renderTimeDistributionChart(processMetrics, ganttData);
    renderAlgorithmInsights(processMetrics, ganttData);
    renderStatisticalSummary(processMetrics);
}

// ============ DETAILED PROCESS ANALYTICS FUNCTIONS ============

/**
 * Render detailed process analytics table with all metrics
 * @param {Array} processMetrics - Array of process results
 */
function renderProcessAnalyticsTable(processMetrics) {
    const tableBody = document.getElementById('analytics-table-body');
    if (!tableBody || !processMetrics || processMetrics.length === 0) return;
    
    tableBody.innerHTML = '';
    
    processMetrics.sort((a, b) => a.id.localeCompare(b.id)).forEach(process => {
        // Calculate derived metrics
        const tat = process.turnaroundTime;
        const bt = process.burstTime;
        const wt = process.waitingTime;
        
        const tatBtRatio = (tat / bt).toFixed(2);
        const wtTatPercent = ((wt / tat) * 100).toFixed(1);
        
        // Determine efficiency badge
        const wtTatValue = parseFloat(wtTatPercent);
        let efficiencyClass, efficiencyText;
        if (wtTatValue <= 30) {
            efficiencyClass = 'efficiency-excellent';
            efficiencyText = 'Excellent';
        } else if (wtTatValue <= 60) {
            efficiencyClass = 'efficiency-average';
            efficiencyText = 'Average';
        } else {
            efficiencyClass = 'efficiency-poor';
            efficiencyText = 'Poor';
        }
        
        // Create table row
        const row = tableBody.insertRow();
        row.innerHTML = `
            <td>${process.id}</td>
            <td>${process.arrivalTime}</td>
            <td>${process.burstTime}</td>
            <td>${process.completionTime.toFixed(2)}</td>
            <td>${tat.toFixed(2)}</td>
            <td>${wt.toFixed(2)}</td>
            <td>${tatBtRatio}</td>
            <td>${wtTatPercent}%</td>
            <td><span class="efficiency-badge ${efficiencyClass}">${efficiencyText}</span></td>
        `;
    });
}

/**
 * Render time distribution pie chart (CPU Busy vs Idle)
 * @param {Array} processMetrics - Array of process results
 * @param {Array} ganttData - Gantt schedule data
 */
function renderTimeDistributionChart(processMetrics, ganttData) {
    const pieContainer = document.getElementById('time-distribution-pie');
    const legendContainer = document.getElementById('time-distribution-legend');
    
    if (!pieContainer || !legendContainer || !processMetrics || processMetrics.length === 0) return;
    
    // Calculate busy time (sum of all burst times)
    const busyTime = processMetrics.reduce((sum, p) => sum + p.burstTime, 0);
    
    // Calculate total execution time
    const totalTime = Math.max(...processMetrics.map(p => p.completionTime));
    
    // Calculate idle time
    const idleTime = totalTime - busyTime;
    
    // Calculate percentages
    const busyPercent = (busyTime / totalTime) * 100;
    const idlePercent = (idleTime / totalTime) * 100;
    
    // Colors for pie chart
    const busyColor = '#3b82f6';
    const idleColor = '#e5e7eb';
    
    // Create pie chart using SVG conic gradient
    const radius = 80;
    const cx = 100;
    const cy = 100;
    
    // Clear previous content
    pieContainer.innerHTML = '';
    
    // Create busy time slice (as first slice)
    const busyAngle = (busyPercent / 100) * 360;
    const busyEndAngle = busyAngle;
    
    // Helper function to create arc path
    const createArcPath = (angle1, angle2, radius, cx, cy) => {
        const rad1 = (angle1 * Math.PI) / 180 - Math.PI / 2;
        const rad2 = (angle2 * Math.PI) / 180 - Math.PI / 2;
        
        const x1 = cx + radius * Math.cos(rad1);
        const y1 = cy + radius * Math.sin(rad1);
        const x2 = cx + radius * Math.cos(rad2);
        const y2 = cy + radius * Math.sin(rad2);
        
        const largeArc = angle2 - angle1 > 180 ? 1 : 0;
        
        return `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    };
    
    // Create busy slice
    const busyPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    busyPath.setAttribute('d', createArcPath(0, busyEndAngle, radius, cx, cy));
    busyPath.setAttribute('fill', busyColor);
    busyPath.setAttribute('class', 'pie-slice');
    busyPath.setAttribute('stroke', 'white');
    busyPath.setAttribute('stroke-width', '2');
    pieContainer.appendChild(busyPath);
    
    // Create idle slice
    const idlePath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    idlePath.setAttribute('d', createArcPath(busyEndAngle, 360, radius, cx, cy));
    idlePath.setAttribute('fill', idleColor);
    idlePath.setAttribute('class', 'pie-slice');
    idlePath.setAttribute('stroke', 'white');
    idlePath.setAttribute('stroke-width', '2');
    pieContainer.appendChild(idlePath);
    
    // Create legend
    legendContainer.innerHTML = `
        <div class="legend-entry">
            <div class="legend-dot" style="background-color: ${busyColor};"></div>
            <div class="legend-text">
                <div class="legend-label">CPU Busy</div>
                <div class="legend-value">${busyPercent.toFixed(1)}% (${busyTime.toFixed(1)}ms)</div>
            </div>
        </div>
        <div class="legend-entry">
            <div class="legend-dot" style="background-color: ${idleColor};"></div>
            <div class="legend-text">
                <div class="legend-label">CPU Idle</div>
                <div class="legend-value">${idlePercent.toFixed(1)}% (${idleTime.toFixed(1)}ms)</div>
            </div>
        </div>
    `;
}

/**
 * Render algorithm insights panel
 * @param {Array} processMetrics - Array of process results
 * @param {Array} ganttData - Gantt schedule data
 */
function renderAlgorithmInsights(processMetrics, ganttData) {
    // Get algorithm name from dropdown
    const algorithmDropdown = document.getElementById('algorithm-select');
    const algorithmSelect = algorithmDropdown.value;
    
    // Map algorithm codes to display names
    const algorithmNames = {
        fcfs: 'FCFS (First Come First Serve)',
        sjf: 'SJF (Shortest Job First)',
        rrs: 'Round Robin (RR)',
        ljf: 'LJF (Longest Job First)',
        priority: 'Priority Scheduling',
        lrtf: 'LRTF (Longest Remaining Time First)',
        srtf: 'SRTF (Shortest Remaining Time First)'
    };
    
    const algorithmUsed = algorithmNames[algorithmSelect] || 'Unknown';
    
    // Calculate context switches (number of transitions - 1)
    let contextSwitches = 0;
    if (ganttData && ganttData.length > 0) {
        let lastProcess = ganttData[0].processId;
        for (let i = 1; i < ganttData.length; i++) {
            if (ganttData[i].processId !== lastProcess && ganttData[i].processId !== 'Idle') {
                contextSwitches++;
                lastProcess = ganttData[i].processId;
            }
        }
    }
    
    // Calculate other metrics
    const totalProcesses = processMetrics ? processMetrics.length : 0;
    const totalExecutionTime = Math.max(...(processMetrics || []).map(p => p.completionTime));
    const throughput = (totalProcesses / totalExecutionTime).toFixed(4);
    
    // Calculate average response ratio (TAT / BT)
    let avgResponseRatio = 0;
    if (processMetrics && processMetrics.length > 0) {
        const ratios = processMetrics.map(p => p.turnaroundTime / p.burstTime);
        avgResponseRatio = (ratios.reduce((a, b) => a + b, 0) / ratios.length).toFixed(2);
    }
    
    // Update UI
    const elements = {
        'algorithm-used': algorithmUsed,
        'total-processes': totalProcesses,
        'context-switches': contextSwitches,
        'throughput': `${throughput} proc/ms`,
        'avg-response-ratio': avgResponseRatio
    };
    
    Object.entries(elements).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    });
}

/**
 * Calculate statistical metrics
 * @param {Array} values - Array of numeric values
 * @returns {Object} Min, max, median, average, and standard deviation
 */
function calculateStats(values) {
    if (!values || values.length === 0) {
        return { min: 0, max: 0, median: 0, avg: 0, stddev: 0 };
    }
    
    const sorted = [...values].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[sorted.length - 1];
    
    // Calculate median
    let median;
    if (sorted.length % 2 === 0) {
        median = (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2;
    } else {
        median = sorted[Math.floor(sorted.length / 2)];
    }
    
    // Calculate average
    const avg = sorted.reduce((a, b) => a + b, 0) / sorted.length;
    
    // Calculate standard deviation
    const variance = sorted.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / sorted.length;
    const stddev = Math.sqrt(variance);
    
    return { min, max, median, avg, stddev };
}

/**
 * Render statistical summary section
 * @param {Array} processMetrics - Array of process results
 */
function renderStatisticalSummary(processMetrics) {
    if (!processMetrics || processMetrics.length === 0) return;
    
    // Extract values
    const waitingTimes = processMetrics.map(p => p.waitingTime);
    const turnaroundTimes = processMetrics.map(p => p.turnaroundTime);
    const burstTimes = processMetrics.map(p => p.burstTime);
    
    // Calculate statistics
    const wtStats = calculateStats(waitingTimes);
    const tatStats = calculateStats(turnaroundTimes);
    const btStats = calculateStats(burstTimes);
    const btTotal = burstTimes.reduce((a, b) => a + b, 0);
    
    // Update UI - Waiting Time Statistics
    document.getElementById('wt-min').textContent = wtStats.min.toFixed(2);
    document.getElementById('wt-max').textContent = wtStats.max.toFixed(2);
    document.getElementById('wt-median').textContent = wtStats.median.toFixed(2);
    document.getElementById('wt-avg').textContent = wtStats.avg.toFixed(2);
    document.getElementById('wt-stddev').textContent = wtStats.stddev.toFixed(2);
    
    // Update UI - Turnaround Time Statistics
    document.getElementById('tat-min').textContent = tatStats.min.toFixed(2);
    document.getElementById('tat-max').textContent = tatStats.max.toFixed(2);
    document.getElementById('tat-median').textContent = tatStats.median.toFixed(2);
    document.getElementById('tat-avg').textContent = tatStats.avg.toFixed(2);
    document.getElementById('tat-stddev').textContent = tatStats.stddev.toFixed(2);
    
    // Update UI - Burst Time Statistics
    document.getElementById('bt-min').textContent = btStats.min.toFixed(2);
    document.getElementById('bt-max').textContent = btStats.max.toFixed(2);
    document.getElementById('bt-median').textContent = btStats.median.toFixed(2);
    document.getElementById('bt-avg').textContent = btStats.avg.toFixed(2);
    document.getElementById('bt-total').textContent = btTotal.toFixed(2);
}
