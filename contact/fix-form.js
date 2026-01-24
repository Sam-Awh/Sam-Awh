
// Fix for Framer Form Submission on Vercel - Super Nuclear Option
// Clones and replaces the ENTIRE FORM element to strip all Framer event listeners.

(function () {
    console.log("Fix-form script loaded - Super Nuclear Mode");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaejekw";

    function patchForm(form) {
        if (form.dataset.patched) return;

        console.log("Patching form (replacing entire element):", form);

        // CLONE THE ENTIRE FORM
        // This removes ALL event listeners attached by React/Framer to the form and its inputs
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        // Mark as patched
        newForm.dataset.patched = "true";
        console.log("Form replaced with clean clone");

        // Attach our own submit listener
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            e.stopPropagation();

            console.log("Clean form submitted. Sending to Formspree...");

            // Find submit button for UI feedback
            const submitBtn = newForm.querySelector('button, input[type="submit"], [role="button"]');
            let originalText = "";

            if (submitBtn) {
                originalText = submitBtn.innerText || submitBtn.value;
                submitBtn.innerText = "Sending...";
                submitBtn.value = "Sending...";
                submitBtn.style.opacity = "0.7";
                submitBtn.style.pointerEvents = "none";
                submitBtn.disabled = true;
            }

            // Gather Data
            const formData = new FormData(newForm);
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
                    newForm.reset();
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
                if (submitBtn) {
                    submitBtn.innerText = originalText;
                    submitBtn.value = originalText;
                    submitBtn.style.opacity = "";
                    submitBtn.style.pointerEvents = "";
                    submitBtn.disabled = false;
                }
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
