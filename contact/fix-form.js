
// Fix for Framer Form Submission on Vercel
// Uses event capturing to intercept submission before Framer sees it.

(function () {
    console.log("Fix-form script loaded");

    document.addEventListener('submit', async function (e) {
        // We only care about forms
        if (e.target.tagName !== 'FORM') return;

        console.log("Form submission intercepted via capture phase");

        // Stop Framer from seeing this event
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn ? submitBtn.innerText : "Send";

        if (submitBtn) {
            submitBtn.innerText = "Sending...";
            submitBtn.disabled = true;
        }

        const formData = new FormData(form);

        try {
            const response = await fetch("https://formspree.io/f/xdaejekw", {
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
                    alert(data.errors.map(error => error.message).join(", "));
                } else {
                    alert("Oops! There was a problem submitting your form");
                }
            }
        } catch (error) {
            console.error("Formspree error:", error);
            alert("Oops! There was a problem submitting your form");
        } finally {
            if (submitBtn) {
                submitBtn.innerText = originalBtnText;
                submitBtn.disabled = false;
            }
        }

    }, true); // true = Capture phase (happens before bubbling to React handlers)
})();
