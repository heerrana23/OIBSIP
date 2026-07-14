// ==========================================================================
// TEMPERATURE CONVERTER LOGIC AND APPLICATION ARCHITECTURE
// ==========================================================================

document.addEventListener("DOMContentLoaded", () => {
    // DOM Element Queries
    const tempInput = document.getElementById("temp-input");
    const fromUnitSelect = document.getElementById("from-unit");
    const toUnitSelect = document.getElementById("to-unit");
    const swapUnitsBtn = document.getElementById("swap-units-btn");
    const convertBtn = document.getElementById("convert-btn");
    const resetBtn = document.getElementById("reset-btn");
    const errorMsg = document.getElementById("error-msg");
    const errorText = document.getElementById("error-text");
    const resultsSection = document.getElementById("results-section");
    
    // Output Result UI Targets
    const targetUnitLabel = document.getElementById("target-unit-label");
    const finalResultValue = document.getElementById("final-result-value");
    
    // UI Animations Elements
    const thermometerIcon = document.querySelector(".live-thermometer");
    const btnText = document.querySelector(".btn-text");
    const btnLoader = document.querySelector(".loader");

    // Full Unit Names Map for the UI Card Display
    const unitNames = {
        'C': 'Celsius (°C)',
        'F': 'Fahrenheit (°F)',
        'K': 'Kelvin (K)'
    };

    // ==========================================================================
    // 1. INPUT & ABSOLUTE ZERO VALIDATION
    // ==========================================================================
    function validateInput(value, unit) {
        if (isNaN(value) || tempInput.value.trim() === "") {
            return { isValid: false, message: "Please enter a valid numeric temperature." };
        }

        // Absolute Zero Safety Enforcements
        if (unit === "C" && value < -273.15) {
            return { isValid: false, message: "Temperature cannot fall below Absolute Zero (-273.15°C)." };
        }
        if (unit === "F" && value < -459.67) {
            return { isValid: false, message: "Temperature cannot fall below Absolute Zero (-459.67°F)." };
        }
        if (unit === "K" && value < 0) {
            return { isValid: false, message: "Temperature cannot fall below Absolute Zero (0 K)." };
        }

        return { isValid: true, message: "" };
    }

    function showError(message) {
        errorText.textContent = message;
        errorMsg.classList.remove("hidden");
        resultsSection.classList.add("hidden");
    }

    function clearError() {
        errorMsg.classList.add("hidden");
    }

    // ==========================================================================
    // 2. SPECIFIC TARGET CONVERSION ALGORITHM
    // ==========================================================================
    function calculateSingleConversion(value, from, to) {
        // Base case: units are identical
        if (from === to) return value;

        let celsius;

        // Step 1: Normalize source unit to Celsius standard base
        switch (from) {
            case "C": celsius = value; break;
            case "F": celsius = (value - 32) * 5/9; break;
            case "K": celsius = value - 273.15; break;
        }

        // Step 2: Convert from normalized base to explicit targeted unit
        switch (to) {
            case "C": return celsius;
            case "F": return (celsius * 9/5) + 32;
            case "K": return celsius + 273.15;
        }
    }

    // ==========================================================================
    // 3. INTERFACE CONTROLLERS & ACTIONS
    // ==========================================================================
    function processConversion() {
        const rawValue = parseFloat(tempInput.value);
        const sourceUnit = fromUnitSelect.value;
        const targetUnit = toUnitSelect.value;
        
        const validation = validateInput(rawValue, sourceUnit);
        
        if (!validation.isValid) {
            showError(validation.message);
            return;
        }
        
        clearError();
        
        // Show UX processing state
        btnText.classList.add("hidden");
        btnLoader.classList.remove("hidden");
        convertBtn.disabled = true;

        setTimeout(() => {
            btnText.classList.remove("hidden");
            btnLoader.classList.add("hidden");
            convertBtn.disabled = false;
            
            // Core engine execution
            const result = calculateSingleConversion(rawValue, sourceUnit, targetUnit);
            
            // Present ONLY the explicitly requested targeted conversion
            targetUnitLabel.textContent = `Converted to ${unitNames[targetUnit]}`;
            finalResultValue.innerHTML = `${result.toFixed(2)}<small>${targetUnit === 'K' ? ' K' : '°' + targetUnit}</small>`;
            
            resultsSection.classList.remove("hidden");
            
            // Visual trigger micro-animation
            thermometerIcon.style.transform = "scale(1.2) rotate(10deg)";
            setTimeout(() => thermometerIcon.style.transform = "scale(1) rotate(0deg)", 300);
            
        }, 400);
    }

    // Swap Feature: Switches "From" and "To" units instantaneously
    swapUnitsBtn.addEventListener("click", () => {
        const temp = fromUnitSelect.value;
        fromUnitSelect.value = toUnitSelect.value;
        toUnitSelect.value = temp;
        
        if (tempInput.value.trim() !== "") {
            processConversion();
        }
    });

    function resetApplication() {
        tempInput.value = "";
        fromUnitSelect.value = "C";
        toUnitSelect.value = "F";
        clearError();
        resultsSection.classList.add("hidden");
    }

    // ==========================================================================
    // 4. BINDINGS & LISTENERS
    // ==========================================================================
    convertBtn.addEventListener("click", processConversion);
    resetBtn.addEventListener("click", resetApplication);

    tempInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            processConversion();
        }
    });

    // Real-Time passive validation triggers while user types
    tempInput.addEventListener("input", () => {
        if (tempInput.value.trim() === "") {
            clearError();
            return;
        }
        const validation = validateInput(parseFloat(tempInput.value), fromUnitSelect.value);
        if (validation.isValid) clearError();
        else showError(validation.message);
    });

    // Dropdowns changes immediately triggers smart auto-calculations
    fromUnitSelect.addEventListener("change", () => {
        if (tempInput.value.trim() !== "") processConversion();
    });
    toUnitSelect.addEventListener("change", () => {
        if (tempInput.value.trim() !== "") processConversion();
    });
});