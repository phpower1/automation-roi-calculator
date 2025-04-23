document.addEventListener('DOMContentLoaded', () => {
    // --- Get DOM Elements (Keep existing) ---
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');
    const stepperButtons = document.querySelectorAll('.stepper-button');
    const softwareCostInput = document.getElementById('software-cost');
    const setupCostInput = document.getElementById('setup-cost');
    const trainingCostInput = document.getElementById('training-cost');
    const numEmployeesInput = document.getElementById('num-employees');
    const avgWageInput = document.getElementById('avg-wage');
    const hoursPerTaskInput = document.getElementById('hours-per-task');
    const errorRateInput = document.getElementById('error-rate');
    const timeSavingsInput = document.getElementById('time-savings');
    const errorReductionInput = document.getElementById('error-reduction');
    const maintenanceCostInput = document.getElementById('maintenance-cost');
    const implCostResult = document.getElementById('result-implementation-cost');
    const monthlySavingsResult = document.getElementById('result-monthly-savings');
    const paybackPeriodResult = document.getElementById('result-payback-period');
    const annualRoiResult = document.getElementById('result-annual-roi');
    const laborSavingsResult = document.getElementById('result-labor-savings');
    const errorSavingsResult = document.getElementById('result-error-savings');
    const maintenanceCostResult = document.getElementById('result-maintenance-cost');
    const resultsMessage = document.getElementById('results-message');
    const ctx = document.getElementById('roiChart').getContext('2d');
    let roiChartInstance = null;

    // --- Helper Functions (Keep existing) ---
    const formatCurrency = (value) => {
        if (isNaN(value) || !isFinite(value)) return '$0.00';
        const num = Number(value);
        return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };
    const formatMonths = (value) => {
        if (isNaN(value) || !isFinite(value) || value <= 0) return 'N/A';
        return `${value.toFixed(1)} months`;
    };
    const formatPercentage = (value) => {
        if (isNaN(value)) return 'N/A';
        if (!isFinite(value)) return 'Infinite';
        return `${value.toFixed(1)}%`;
    };
    const getNumericValue = (inputElement) => {
        return parseFloat(inputElement.value) || 0;
    };

    // --- Event Listeners ---

    // Stepper Button Functionality (Keep existing)
    stepperButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetInputId = button.dataset.target;
            const targetInput = document.getElementById(targetInputId);
            if (!targetInput) return;
            const step = parseFloat(targetInput.step) || 1;
            const min = parseFloat(targetInput.min);
            const max = parseFloat(targetInput.max);
            let currentValue = getNumericValue(targetInput);
            let newValue;
            if (button.classList.contains('plus')) {
                newValue = currentValue + step;
            } else if (button.classList.contains('minus')) {
                newValue = currentValue - step;
            }
            if (!isNaN(min) && newValue < min) newValue = min;
            if (!isNaN(max) && newValue > max) newValue = max;
            if ((isNaN(min) || min >= 0) && newValue < 0) newValue = 0;
            const stepString = step.toString();
            const decimalPlaces = stepString.includes('.') ? stepString.split('.')[1].length : 0;
            targetInput.value = newValue.toFixed(decimalPlaces);
        });
    });

    // Calculate ROI Button Functionality (Update Chart Options)
    calculateBtn.addEventListener('click', () => {
        // --- Read Values & Calculations (Keep existing) ---
        const softwareCost = getNumericValue(softwareCostInput);
        const setupCost = getNumericValue(setupCostInput);
        const trainingCost = getNumericValue(trainingCostInput);
        const numEmployees = getNumericValue(numEmployeesInput);
        const avgWage = getNumericValue(avgWageInput);
        const hoursPerTask = getNumericValue(hoursPerTaskInput);
        const errorRate = getNumericValue(errorRateInput) / 100;
        const timeSavings = getNumericValue(timeSavingsInput) / 100;
        const errorReduction = getNumericValue(errorReductionInput) / 100;
        const maintenanceCost = getNumericValue(maintenanceCostInput);

        const totalImplementationCost = softwareCost + setupCost + trainingCost;
        const currentMonthlyLaborCost = numEmployees * avgWage * hoursPerTask;
        const currentMonthlyErrorCost = currentMonthlyLaborCost * errorRate;
        const laborSavings = currentMonthlyLaborCost * timeSavings;
        const errorSavings = currentMonthlyErrorCost * errorReduction;
        const grossMonthlySavings = laborSavings + errorSavings;
        const netMonthlySavings = grossMonthlySavings - maintenanceCost;

        let paybackPeriodMonths = Infinity;
        if (netMonthlySavings > 0 && totalImplementationCost > 0) {
            paybackPeriodMonths = totalImplementationCost / netMonthlySavings;
        } else if (totalImplementationCost <= 0 && netMonthlySavings > 0) {
             paybackPeriodMonths = 0;
        } else if (totalImplementationCost <= 0 && netMonthlySavings <= 0) {
            paybackPeriodMonths = NaN;
        }

        const annualSavings = netMonthlySavings * 12;
        let annualROI = 0;
         if (totalImplementationCost > 0) {
             annualROI = (annualSavings / totalImplementationCost) * 100;
         } else if (annualSavings > 0) {
             annualROI = Infinity;
         }

        // --- Display Results (Keep existing) ---
        implCostResult.textContent = formatCurrency(totalImplementationCost);
        monthlySavingsResult.textContent = formatCurrency(netMonthlySavings);
        paybackPeriodResult.textContent = formatMonths(paybackPeriodMonths);
        annualRoiResult.textContent = formatPercentage(annualROI);
        laborSavingsResult.textContent = formatCurrency(laborSavings);
        errorSavingsResult.textContent = formatCurrency(errorSavings);
        maintenanceCostResult.textContent = formatCurrency(-maintenanceCost);

        // --- Generate Chart Data (Keep existing) ---
        const months = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
        const cumulativeSavingsData = [];
        const netRoiData = [];

        for (let i = 0; i < 12; i++) {
            const monthNum = i + 1;
            const currentCumulativeSavings = netMonthlySavings * monthNum;
            cumulativeSavingsData.push(currentCumulativeSavings);

            let currentNetRoi = 0;
            if (totalImplementationCost > 0) {
                currentNetRoi = ((currentCumulativeSavings - totalImplementationCost) / totalImplementationCost) * 100;
            } else if (currentCumulativeSavings > 0) {
                currentNetRoi = Infinity;
            }
            netRoiData.push(isFinite(currentNetRoi) ? currentNetRoi : null);
        }

        // --- Create or Update Chart (Refined Options) ---
        const chartData = {
            labels: months,
            datasets: [
                {
                    label: 'Cumulative Savings',
                    data: cumulativeSavingsData,
                    borderColor: '#4A90E2', // Blue
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2.5, // Slightly thicker line
                    tension: 0.1,
                    yAxisID: 'ySavings',
                    pointRadius: 4, // Slightly larger points
                    pointHoverRadius: 6,
                    pointStyle: 'circle' // Explicitly circle points
                },
                {
                    label: 'Net ROI',
                    data: netRoiData,
                    borderColor: '#D0021B', // Red
                    backgroundColor: 'rgba(208, 2, 27, 0.1)',
                    borderWidth: 2.5, // Slightly thicker line
                    tension: 0.1,
                    yAxisID: 'yRoi',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointStyle: 'circle', // Explicitly circle points
                    spanGaps: false // Ensure gaps for null values
                }
            ]
        };

        const chartOptions = {
            responsive: true,
            maintainAspectRatio: true, // Can adjust this if needed, often works well with defined axes
            aspectRatio: 2.5, // Adjust aspect ratio for better proportions like the image
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Month'
                    },
                    grid: {
                        display: false // Hide vertical grid lines like the image
                    }
                },
                ySavings: { // Primary Y Axis for Savings ($)
                    type: 'linear',
                    position: 'left',
                    beginAtZero: true, // Ensure axis starts at 0
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatCurrency(value);
                        }
                    },
                     grid: {
                         drawOnChartArea: true,
                         color: '#e9ecef' // Lighter grid color
                     }
                },
                 yRoi: { // Secondary Y Axis for ROI (%)
                    type: 'linear',
                    position: 'right',
                    // beginAtZero: false, // Allow negative ROI, auto-scale
                    title: {
                        display: true,
                        text: 'Net ROI (%)'
                    },
                    ticks: {
                         callback: function(value) {
                             // Check if it's null or infinite before formatting
                             if (value === null || !isFinite(value)) return ''; // Don't display tick label for null/Infinity
                             return formatPercentage(value);
                         }
                    },
                     grid: {
                         drawOnChartArea: false // Keep grid lines off for secondary axis
                     }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            // Check raw value for null/Infinity before formatting
                            const rawValue = context.raw;
                            if (rawValue === null) {
                                label += 'N/A';
                            } else if (!isFinite(rawValue)) {
                                label += 'Infinite';
                            } else if (context.parsed.y !== null) {
                                if (context.dataset.yAxisID === 'yRoi') {
                                    label += formatPercentage(context.parsed.y);
                                } else {
                                    label += formatCurrency(context.parsed.y);
                                }
                            }
                            return label;
                        }
                    }
                },
                 legend: {
                     position: 'bottom',
                     labels: {
                         usePointStyle: true,
                         pointStyle: 'circle' // Ensure legend uses circles
                     }
                 }
            }
        };


        if (roiChartInstance) {
            roiChartInstance.data = chartData;
            roiChartInstance.options = chartOptions;
            roiChartInstance.update();
        } else {
            roiChartInstance = new Chart(ctx, {
                type: 'line',
                data: chartData,
                options: chartOptions
            });
        }


        // --- Update summary message (Keep existing) ---
        if (paybackPeriodMonths === 0) {
             resultsMessage.textContent = `Investment recovered immediately with positive ROI thereafter.`;
             resultsMessage.style.backgroundColor = '#e9f7ec';
             resultsMessage.style.color = '#155724';
        } else if (isFinite(paybackPeriodMonths) && paybackPeriodMonths > 0) {
            resultsMessage.textContent = `The investment will be recovered in ${paybackPeriodMonths.toFixed(1)} months with a positive ROI thereafter.`;
            resultsMessage.style.backgroundColor = '#e9f7ec';
            resultsMessage.style.color = '#155724';
        } else if (!isFinite(paybackPeriodMonths) && netMonthlySavings > 0) {
             resultsMessage.textContent = `Immediate positive return as there is no implementation cost.`;
             resultsMessage.style.backgroundColor = '#e9f7ec';
             resultsMessage.style.color = '#155724';
        }
         else {
            resultsMessage.textContent = `Based on the current inputs, the investment may not generate sufficient positive savings to recover the initial cost.`;
             resultsMessage.style.backgroundColor = '#f8d7da';
             resultsMessage.style.color = '#721c24';
        }


        // Show the results section (Keep existing)
        resultsSection.classList.remove('hidden');
    });
});