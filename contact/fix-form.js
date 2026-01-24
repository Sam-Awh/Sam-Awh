
// Fix for Framer Form Submission on Vercel - Aggressive Interception
// Intercepts clicks and submits at the window level during the capture phase.

(function () {
    console.log("Fix-form script loaded - Aggressive Mode v3");

    const FORMSPREE_ENDPOINT = "https://formspree.io/f/xdaejekw";

    async function handleFormSubmission(form) {
        console.log("Handling form submission for:", form);

        // Find the submit button/element to show loading state
        // Framer often uses a div or a specific class for the button
        const submitBtn = form.querySelector('button, [role="button"], input[type="submit"], a[href="#"]');
        let originalText = "";

        if (submitBtn) {
            originalText = submitBtn.innerText || submitBtn.value;
            submitBtn.innerText = "Sending...";
            submitBtn.value = "Sending...";
            submitBtn.style.opacity = "0.7";
            submitBtn.style.pointerEvents = "none";
        }

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        console.log("Form data collected:", data);

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
                const resData = await response.json();
                if (resData.errors) {
                    alert("Error: " + resData.errors.map(error => error.message).join(", "));
                } else {
                    alert("Oops! There was a problem submitting your form");
                }
            }
        } catch (error) {
            console.error("Formspree error:", error);
            alert("Oops! There was a problem submitting your form. Please try again.");
        } finally {
            if (submitBtn) {
                submitBtn.innerText = originalText;
                submitBtn.value = originalText;
                submitBtn.style.opacity = "";
                submitBtn.style.pointerEvents = "";
            }
        }
    }

    // Capture SUBMIT events at the window level (highest priority)
    window.addEventListener('submit', function (e) {
        console.log("Window 'submit' captured", e.target);
        if (e.target.tagName === 'FORM') {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            handleFormSubmission(e.target);
        }
    }, true); // true = Capture phase

    // Capture CLICK events to catch "fake" buttons before Framer sees them
    window.addEventListener('click', function (e) {
        // Check if the clicked element is inside a form and looks like a submit trigger
        const target = e.target;
        const form = target.closest('form');

        if (form) {
            // Check if it's a submit button or the user clicked something intended to submit
            const isSubmitButton = target.matches('button[type="submit"], input[type="submit"]');
            // Also check for Framer specific "button-like" elements if they don't use standard submit types
            // But simpler is safe: if it's a submit button, we MUST stop it.

            if (isSubmitButton) {
                console.log("Window 'click' captured on submit button", target);
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                handleFormSubmission(form);
            }
        }
    }, true);

})();
