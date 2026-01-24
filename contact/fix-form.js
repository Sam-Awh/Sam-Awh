
// Fix for Framer Form Submission on Vercel
// Intercepts the form submission and prevents the default Framer action (which fails).

document.addEventListener("DOMContentLoaded", () => {
    // Wait a bit for Framer hydration to render the form
    const checkForForm = setInterval(() => {
        const forms = document.querySelectorAll("form");
        if (forms.length > 0) {
            clearInterval(checkForForm);
            forms.forEach(form => {
                // Clone the form to remove existing event listeners attached by Framer
                const newForm = form.cloneNode(true);
                form.parentNode.replaceChild(newForm, form);

                // Add own event listener
                newForm.addEventListener("submit", async (e) => {
                    e.preventDefault();

                    const submitBtn = newForm.querySelector('button[type="submit"]');
                    const originalBtnText = submitBtn ? submitBtn.innerText : "Send";
                    if (submitBtn) {
                        submitBtn.innerText = "Sending...";
                        submitBtn.disabled = true;
                    }

                    // Collect form data
                    const formData = new FormData(newForm);

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
                            newForm.reset();
                        } else {
                            const data = await response.json();
                            if (data.errors) {
                                alert(data.errors.map(error => error.message).join(", "));
                            } else {
                                alert("Oops! There was a problem submitting your form");
                            }
                        }
                    } catch (error) {
                        alert("Oops! There was a problem submitting your form");
                        console.error(error);
                    } finally {
                        if (submitBtn) {
                            submitBtn.innerText = originalBtnText;
                            submitBtn.disabled = false;
                        }
                    }
                });

                console.log("Framer form submission intercepted and patched.");
            });
        }
    }, 500); // Check every 500ms
});
