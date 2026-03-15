document.addEventListener("DOMContentLoaded", () => {
    // ----------------------------------------------------------------------
    // WIZARD STATE MANAGEMENT
    // ----------------------------------------------------------------------
    const state = {
        budget: null,
        timeline: null,
        services: [],
        brandName: "",
        brandIndustry: "",
        brandAudience: "",
        brandSuccess: "",
        brandAdmire: "",
        date: null,
        time: null,
        email: ""
    };

    let currentStepIndex = 1;
    const TOTAL_STEPS = 5;

    // DOM Elements Cache
    const steps = document.querySelectorAll(".wizard-step");
    const progressSteps = document.querySelectorAll(".progress-step");
    const progressLines = document.querySelectorAll(".progress-line");

    // Form Navigation Buttons
    const btnNext1 = document.getElementById("btn-next-1");
    const btnNext2 = document.getElementById("btn-next-2");
    const btnNext3 = document.getElementById("btn-next-3");
    const btnNext4 = document.getElementById("btn-next-4");
    const backBtns = document.querySelectorAll(".back-btn");

    // Inputs & Soft Exit
    const softExitMsg = document.getElementById("soft-exit-message");
    const brandNameInput = document.getElementById("brand-name");

    // Summary Elements
    const sumBrand = document.getElementById("sum-brand");
    const sumServices = document.getElementById("sum-services");
    const sumBudget = document.getElementById("sum-budget");
    const sumTimeline = document.getElementById("sum-timeline");
    const sumCall = document.getElementById("sum-call");

    // ----------------------------------------------------------------------
    // STEP NAVIGATION LOGIC
    // ----------------------------------------------------------------------
    function showStep(index) {
        steps.forEach((step, i) => {
            if (i === index - 1) {
                step.classList.add("step-active");
            } else {
                step.classList.remove("step-active");
            }
        });
        updateProgressbar(index);
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function updateProgressbar(index) {
        progressSteps.forEach((step, i) => {
            if (i < index) {
                step.classList.add("active");
                if (i < index - 1) step.classList.add("completed");
            } else {
                step.classList.remove("active", "completed");
            }
        });

        progressLines.forEach((line, i) => {
            if (i < index - 1) {
                line.classList.add("active");
            } else {
                line.classList.remove("active");
            }
        });
    }

    function nextStep() {
        if (currentStepIndex < TOTAL_STEPS) {
            currentStepIndex++;
            showStep(currentStepIndex);
            if (currentStepIndex === 5) populateSummary();
        }
    }

    function prevStep() {
        if (currentStepIndex > 1) {
            currentStepIndex--;
            showStep(currentStepIndex);
        }
    }

    // Bind Back / Next Navigations
    backBtns.forEach(btn => btn.addEventListener("click", prevStep));
    btnNext1.addEventListener("click", nextStep);
    btnNext2.addEventListener("click", nextStep);
    btnNext3.addEventListener("click", nextStep);
    btnNext4.addEventListener("click", nextStep);

    // ----------------------------------------------------------------------
    // INTERACTIVE SELECTIONS (Cards & Pills)
    // ----------------------------------------------------------------------

    // Generic Card/Pill Click Handler
    document.querySelectorAll(".selection-card, .selection-pill").forEach(el => {
        el.addEventListener("click", (e) => {
            const group = el.dataset.group;
            const value = el.dataset.value;
            const isMulti = el.classList.contains("multi-select");

            if (!isMulti) {
                // Single Choice: Deselect siblings
                document.querySelectorAll(`[data-group="${group}"]`).forEach(sibling => sibling.classList.remove("selected"));
                el.classList.add("selected");
                state[group] = value;
            } else {
                // Multi Choice (Services)
                el.classList.toggle("selected");
                if (el.classList.contains("selected")) {
                    state[group].push(value);
                } else {
                    state[group] = state[group].filter(item => item !== value);
                }
            }
            validateCurrentStep();
        });
    });

    // Brief Inputs (Step 3) Change Events
    const stateMap = {
        "brand-name": "brandName",
        "brand-industry": "brandIndustry",
        "brand-audience": "brandAudience",
        "brand-success": "brandSuccess",
        "brand-admire": "brandAdmire"
    };

    Object.keys(stateMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("input", () => {
                state[stateMap[id]] = el.value;
                validateCurrentStep();
            });
        }
    });

    // ----------------------------------------------------------------------
    // CALENDAR UI SHELL LOGIC (Step 4)
    // ----------------------------------------------------------------------
    const calDays = document.querySelectorAll(".cal-day.selectable");
    const timeSlotsBox = document.getElementById("time-slots");
    const dateLabel = document.getElementById("selected-date-label");
    const customTimeGroup = document.getElementById("custom-time-group");
    const customTimeInput = document.getElementById("custom-time-input");

    calDays.forEach(day => {
        day.addEventListener("click", () => {
            if (day.classList.contains("disabled")) return;

            // Deselect other days
            calDays.forEach(d => d.classList.remove("selected"));
            day.classList.add("selected");

            const dateStr = day.dataset.date;
            state.date = dateStr;
            dateLabel.textContent = `Available times for ${dateStr}`;

            // Reset time state if new date selected
            state.time = null;
            document.querySelectorAll(".time-pill").forEach(p => p.classList.remove("selected"));
            customTimeGroup.classList.remove("active");

            // Animation for time slots reveal
            if (timeSlotsBox.classList.contains("hidden")) {
                timeSlotsBox.classList.remove("hidden");
                gsap.fromTo(timeSlotsBox,
                    { opacity: 0, y: 30, scaleY: 0.9 },
                    { opacity: 1, y: 0, scaleY: 1, duration: 0.8, ease: "expo.out" }
                );
            } else {
                gsap.fromTo(timeSlotsBox,
                    { x: -5 },
                    { x: 0, duration: 0.5, ease: "elastic.out(1, 0.3)" }
                );
            }

            validateCurrentStep();
        });
    });

    // Time slots logic
    document.querySelectorAll(".time-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            document.querySelectorAll(".time-pill").forEach(p => p.classList.remove("selected"));
            pill.classList.add("selected");

            if (pill.id === "custom-time-toggle") {
                state.time = customTimeInput.value || null;
                customTimeGroup.classList.add("active");
                gsap.fromTo(customTimeGroup, { scaleX: 0.9 }, { scaleX: 1, duration: 0.4 });
            } else {
                state.time = pill.dataset.value;
                customTimeGroup.classList.remove("active");
            }
            validateCurrentStep();
        });
    });

    // Custom time input listener
    if (customTimeInput) {
        customTimeInput.addEventListener("input", () => {
            if (document.getElementById("custom-time-toggle").classList.contains("selected")) {
                state.time = customTimeInput.value;
                validateCurrentStep();
            }
        });
    }

    // ----------------------------------------------------------------------
    // VALIDATION RULES
    // ----------------------------------------------------------------------
    function validateCurrentStep() {
        // Step 1: Budget & Timeline logic
        if (currentStepIndex === 1) {
            if (state.budget === "Starter") {
                softExitMsg.classList.remove("hidden");
                btnNext1.disabled = true; // Hard stop
            } else {
                softExitMsg.classList.add("hidden");
                btnNext1.disabled = !(state.budget && state.timeline);
            }
        }

        // Step 2: Services
        if (currentStepIndex === 2) {
            btnNext2.disabled = state.services.length === 0;
        }

        // Step 3: All Brief fields required
        if (currentStepIndex === 3) {
            btnNext3.disabled = !(
                state.brandName.trim().length >= 2 &&
                state.brandIndustry.trim().length > 0 &&
                state.brandAudience.trim().length > 0 &&
                state.brandSuccess.trim().length > 0 &&
                state.brandAdmire.trim().length > 0
            );
        }

        // Step 4: Calendar Date + Time
        if (currentStepIndex === 4) {
            btnNext4.disabled = !(state.date && state.time);
        }
    }

    // ----------------------------------------------------------------------
    // SUMMARY & SUBMISSION (Step 5)
    // ----------------------------------------------------------------------
    function populateSummary() {
        sumBrand.textContent = state.brandName || "N/A";
        sumServices.textContent = state.services.length > 0 ? state.services.join(", ") : "None";
        sumBudget.textContent = state.budget || "N/A";
        sumTimeline.textContent = state.timeline || "N/A";
        sumCall.textContent = `${state.date} at ${state.time}`;
    }

    const finalEmailInput = document.getElementById("final-email");
    const submitBtn = document.getElementById("wizard-submit");
    const successMsg = document.getElementById("wizard-success-msg");
    const wizardForm = document.getElementById("wizardForm");

    finalEmailInput.addEventListener("input", () => {
        state.email = finalEmailInput.value;
        // Basic email validation
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email);
        submitBtn.disabled = !isValid;
    });

    submitBtn.addEventListener("click", async (e) => {
        e.preventDefault();
        submitBtn.disabled = true;
        submitBtn.querySelector("span").textContent = "Sending...";

        // Construct Form Data matching Web3Forms mapping
        const fbGroup = new FormData(wizardForm);
        fbGroup.append("Brand", state.brandName);
        fbGroup.append("Industry", state.brandIndustry);
        fbGroup.append("Audience", state.brandAudience);
        fbGroup.append("Success_Definition", state.brandSuccess);
        fbGroup.append("Admired_Brands", state.brandAdmire);
        fbGroup.append("Budget", state.budget);
        fbGroup.append("Timeline", state.timeline);
        fbGroup.append("Services_Selected", state.services.join(", "));
        fbGroup.append("Discovery_Call", `${state.date} at ${state.time}`);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: fbGroup
            });
            const data = await response.json();

            if (data.success) {
                // Hide Submit Button and Email grouping, show success
                submitBtn.style.display = "none";
                finalEmailInput.closest(".form-group").style.display = "none";
                successMsg.classList.remove("hidden");
                document.querySelectorAll(".back-btn").forEach(b => b.style.display = "none");
            } else {
                throw new Error("Submission Failed");
            }
        } catch (error) {
            console.error(error);
            submitBtn.disabled = false;
            submitBtn.querySelector("span").textContent = "Error - Try Again";
        }
    });

    // Initialize state validation
    validateCurrentStep();
});
