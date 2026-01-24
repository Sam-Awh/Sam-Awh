
// Fix for Framer Form Submission on Vercel - The Terminator Edition v5
// 1. Constantly monitors and destroys <form> tags (converts to <div>).
// 2. Intercepts GLOBAL capture-phase events to kill Framer handlers.
// 3. Manually handles data collection and submission.

(function () {
    console.log("Fix-form script loaded - Terminator Mode v5");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaejekw";

    // --- UTILITIES ---

    function handleManualSubmission(container) {
        console.log("Terminator: Handling submission manually.");

        // UI Feedback
        const submitBtn = container.querySelector('button, input[type="submit"], [role="button"]');
        let originalText = "";

        if (submitBtn) {
            originalText = submitBtn.innerText || submitBtn.value;
            if (submitBtn.tagName === 'INPUT') submitBtn.value = "Sending...";
            else submitBtn.innerText = "Sending...";

            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";
        }

        // Collect Data
        const data = {};
        const inputs = container.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Skip buttons/submit inputs
            if (input.type === 'submit' || input.type === 'button') return;

            let name = input.name;
            if (!name) {
                // Heuristics for missing names
                if (input.type === 'email') name = 'email';
                else if (input.placeholder) name = input.placeholder;
                else name = 'field_' + Math.random().toString(36).substr(2, 5);
            }
            data[name] = input.value;
        });

        console.log("Terminator: Collected Data", data);

        // Send to Formspree
        const formData = new FormData();
        for (const key in data) {
            formData.append(key, data[key]);
        }

        fetch(FORMSPREE_ENDPOINT, {
            method: "POST",
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
            .then(response => {
                if (response.ok) {
                    alert("Message sent successfully!");
                    inputs.forEach(i => i.value = ""); // Clear
                } else {
                    return response.json().then(d => {
                        if (d.errors) alert("Error: " + d.errors.map(e => e.message).join(", "));
                        else alert("Oops! There was a problem submitting your form");
                    });
                }
            })
            .catch(error => {
                console.error("Terminator: Network Error", error);
                alert("Oops! There was a problem submitting your form.");
            })
            .finally(() => {
                if (submitBtn) {
                    if (submitBtn.tagName === 'INPUT') submitBtn.value = originalText;
                    else submitBtn.innerText = originalText;
                    submitBtn.style.opacity = "";
                    submitBtn.style.pointerEvents = "";
                }
            });
    }

    // --- PHASE 1: DOM POLICING (Anti-Hydration) ---

    function transmuteForm(form) {
        if (form.tagName !== 'FORM') return;

        console.log("Terminator: Detected FORM tag. Terminating...");

        // Create replacement DIV
        const div = document.createElement('div');

        // Copy attributes
        Array.from(form.attributes).forEach(attr => {
            div.setAttribute(attr.name, attr.value);
        });

        // Mark as our specific type
        div.setAttribute('data-framer-terminator', 'true');
        div.style.display = 'block'; // Ensure visibility

        // Move children
        while (form.firstChild) {
            div.appendChild(form.firstChild);
        }

        // Replace
        form.parentNode.replaceChild(div, form);

        // Find and patch the button inside the new div (just in case)
        const btn = div.querySelector('button, input[type="submit"]');
        if (btn) {
            // We clone the button too to strip listeners, just to be sure
            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            // Attach our handler
            newBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                handleManualSubmission(div);
            });
        }
    }

    // The Interval Police
    setInterval(() => {
        const forms = document.querySelectorAll('form');
        forms.forEach(transmuteForm);
    }, 100); // Check every 100ms


    // --- PHASE 2: EVENT INTERCEPTION (The Firewall) ---

    // 1. Capture ALL 'submit' events and KILL them.
    window.addEventListener('submit', function (e) {
        console.log("Terminator: Intercepted SUBMIT event.", e.target);
        e.preventDefault();
        e.stopImmediatePropagation();
        e.stopPropagation();

        // If we caught a submit, we should handle it (if data is available)
        // Try to find the container
        const container = e.target.closest('[data-framer-terminator]') || e.target.closest('form') || e.target;
        handleManualSubmission(container);
    }, true); // Capture phase!

    // 2. Capture ALL 'click' events on valid submit triggers
    window.addEventListener('click', function (e) {
        const target = e.target;
        const isSubmit = target.matches('button[type="submit"], input[type="submit"]') ||
            (target.innerText && (target.innerText.toLowerCase() === 'send' || target.innerText.toLowerCase() === 'submit'));

        if (isSubmit) {
            // Check if it's inside our container or a form
            const container = target.closest('[data-framer-terminator]') || target.closest('form');

            if (container) {
                console.log("Terminator: Intercepted CLICK event on submit button.", target);
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();
                handleManualSubmission(container);
            }
        }
    }, true); // Capture phase!

})();
