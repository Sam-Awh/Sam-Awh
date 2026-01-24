
// Fix for Framer Form Submission on Vercel - Nuclear Option
// Detects the form button, CLONES and REPLACES it to strip all Framer event listeners.

(function () {
    console.log("Fix-form script loaded - Nuclear Mode");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaejekw";

    function patchForm(form) {
        if (form.dataset.patched) return;
        form.dataset.patched = "true";

        console.log("Patching form:", form);

        // Find the button. Framer buttons can be tricky.
        // We look for:
        // 1. explicit submit buttons
        // 2. inputs with type submit
        // 3. elements with text "Send" or "Submit" (case insensitive)
        // 4. elements with role="button" inside the form

        const candidates = Array.from(form.querySelectorAll('button, input[type="submit"], [role="button"], a, div'));

        const submitBtn = candidates.find(el => {
            // Check type
            if (el.getAttribute('type') === 'submit') return true;

            // Check exact text content (trim whitespace)
            const text = (el.innerText || el.textContent || "").trim().toLowerCase();
            return text === 'send' || text === 'submit';
        });

        if (!submitBtn) {
            console.warn("Could not find a clear Submit/Send button in form", form);
            return;
        }

        console.log("Found submit button:", submitBtn);

        // THE NUCLEAR OPTION: Clone and Replace
        // This removes ALL event listeners attached by React/Framer
        const newBtn = submitBtn.cloneNode(true);
        submitBtn.parentNode.replaceChild(newBtn, submitBtn);

        console.log("Replaced submit button with clean clone");

        // Attach our own listener
        newBtn.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("Clean button clicked. Submitting to Formspree...");

            // UI Feedback
            const originalText = newBtn.innerText;
            newBtn.innerText = "Sending...";
            newBtn.style.opacity = "0.7";
            newBtn.style.pointerEvents = "none";

            // Gather Data
            const formData = new FormData(form);

            // Debug: Log data
            console.log("Data:", Object.fromEntries(formData.entries()));

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
                    form.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        alert("Error: " + data.errors.map(error => error.message).join(", "));
                    } else {
                        alert("Oops! There was a problem submitting your form");
                    }
                }
            } catch (error) {
                console.error("Formspree Error:", error);
                alert("Oops! There was a problem submitting your form.");
            } finally {
                newBtn.innerText = originalText;
                newBtn.style.opacity = "1";
                newBtn.style.pointerEvents = "auto";
            }
        });
    }

    // Observer to watch for the form appearing in the DOM
    const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
            for (const node of mutation.addedNodes) {
                if (node.nodeType === 1) { // Element
                    if (node.tagName === 'FORM') {
                        patchForm(node);
                    } else {
                        // Check children
                        const forms = node.querySelectorAll('form');
                        forms.forEach(patchForm);
                    }
                }
            }
        }
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    // Initial check in case it's already there
    document.querySelectorAll('form').forEach(patchForm);

})();
