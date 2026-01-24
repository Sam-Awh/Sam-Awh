
// Fix for Framer Form Submission on Vercel - De-Forming Strategy
// Replaces the <form> element with a <div> to physically prevent "submit" events,
// bypassing Framer's event listeners entirely.

(function () {
    console.log("Fix-form script loaded - De-Forming Mode");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaejekw";

    function convertFormToDiv(form) {
        if (form.tagName !== 'FORM') return;
        if (form.dataset.deformed) return;

        console.log("De-forming form:", form);

        // 1. Create the container div
        const formContainer = document.createElement('div');

        // 2. Copy all attributes (classes, style, id, etc.)
        Array.from(form.attributes).forEach(attr => {
            if (attr.name !== 'action' && attr.name !== 'method') {
                formContainer.setAttribute(attr.name, attr.value);
            }
        });

        // Mark it so we don't process it again (though it's a div now)
        formContainer.dataset.deformed = "true";

        // 3. Move contents
        // We use innerHTML to preserve children structure. 
        // Note: This relies on inputs not being cleared. 
        // Since this runs on load/appear, inputs should be empty anyway.
        formContainer.innerHTML = form.innerHTML;

        // 4. Replace the form with the div
        form.parentNode.replaceChild(formContainer, form);
        console.log("Form has been transmuted into a DIV.");

        // 5. Wire up the functionality on the new container
        setupFormLogic(formContainer);
    }

    function setupFormLogic(container) {
        // Find the "submit" button inside our new div
        // It might still be type="submit", which is fine in a div (it does nothing), 
        // but we want to handle the click.

        const candidates = Array.from(container.querySelectorAll('button, input[type="submit"], [role="button"], a'));

        const submitBtn = candidates.find(el => {
            const text = (el.innerText || el.textContent || "").trim().toLowerCase();
            const val = (el.value || "").toLowerCase();
            return text.includes('send') || text.includes('submit') || val.includes('send');
        });

        if (!submitBtn) {
            console.warn("Could not find submit button in De-Formed container");
            return;
        }

        console.log("Found submit button (De-Formed):", submitBtn);

        // Visual check: Change text slightly so user knows it worked
        // submitBtn.style.outline = "2px solid lime"; // Debug visual

        submitBtn.onclick = async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("Custom handler triggered via Click.");

            // UI Feedback
            const originalText = submitBtn.innerText || submitBtn.value;
            const originalPointerEvents = submitBtn.style.pointerEvents;
            const originalOpacity = submitBtn.style.opacity;

            if (submitBtn.tagName === 'INPUT') {
                submitBtn.value = "Sending...";
            } else {
                submitBtn.innerText = "Sending...";
            }

            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";

            // Collect Data Manually (since no form)
            const inputs = container.querySelectorAll('input, textarea, select');
            const data = {};

            inputs.forEach(input => {
                if (input.name) {
                    data[input.name] = input.value;
                } else if (input.type === 'email') {
                    data['email'] = input.value;
                } else if (input.placeholder && !data[input.placeholder]) {
                    // Fallback if name is missing (Framer sometimes omits names)
                    data[input.placeholder] = input.value;
                }
            });

            console.log("Collected Data:", data);

            // Simple Validation
            // Check for empty required fields? (Assuming all text fields are required for now)
            const missing = Object.keys(data).filter(k => !data[k]);
            /* 
            if (missing.length > 0) {
                 alert("Please fill in all fields.");
                 resetBtn();
                 return;
            }
            */

            // Build FormData for Formspree
            const formData = new FormData();
            for (const key in data) {
                formData.append(key, data[key]);
            }

            try {
                const response = await fetch(FORMSPREE_ENDPOINT, {
                    method: "POST",
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    alert("Message sent successfully!");
                    // Clear inputs
                    inputs.forEach(input => input.value = "");
                } else {
                    const resData = await response.json();
                    if (resData.errors) {
                        alert("Error: " + resData.errors.map(error => error.message).join(", "));
                    } else {
                        alert("Oops! There was a problem submitting your form");
                    }
                }
            } catch (error) {
                console.error("Formspree Error:", error);
                alert("Oops! There was a problem submitting your form.");
            } finally {
                resetBtn();
            }

            function resetBtn() {
                if (submitBtn.tagName === 'INPUT') {
                    submitBtn.value = originalText;
                } else {
                    submitBtn.innerText = originalText;
                }
                submitBtn.style.opacity = originalOpacity;
                submitBtn.style.pointerEvents = originalPointerEvents;
            }
        };
    }

    // Observer
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element
                    if (node.tagName === 'FORM') {
                        convertFormToDiv(node);
                    } else {
                        // Check children
                        const forms = node.querySelectorAll('form');
                        forms.forEach(convertFormToDiv);
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial check
    document.querySelectorAll('form').forEach(convertFormToDiv);

})();
