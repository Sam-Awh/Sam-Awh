/**
 * Saraj Design - Main JavaScript
 * Migrated from Framer to vanilla JS
 * Vercel-compatible static site
 */

// =====================================================
// Lenis Smooth Scrolling
// =====================================================
class SmoothScroll {
    constructor() {
        this.lenis = null;
        this.init();
    }

    init() {
        // Check if Lenis is available
        if (typeof Lenis !== 'undefined') {
            this.lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                orientation: 'vertical',
                gestureOrientation: 'vertical',
                smoothWheel: true,
                wheelMultiplier: 1,
                touchMultiplier: 2,
                infinite: false
            });

            this.raf();
        }
    }

    raf() {
        const animate = (time) => {
            this.lenis.raf(time);
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }

    scrollTo(target, options = {}) {
        if (this.lenis) {
            this.lenis.scrollTo(target, options);
        }
    }
}

// =====================================================
// Animate On Scroll (AOS)
// =====================================================
class AnimateOnScroll {
    constructor() {
        this.elements = [];
        this.init();
    }

    init() {
        this.elements = document.querySelectorAll('.aos');

        if (this.elements.length === 0) return;

        // Create Intersection Observer
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                root: null,
                rootMargin: '0px 0px -50px 0px',
                threshold: 0.1
            }
        );

        this.elements.forEach((el) => observer.observe(el));
    }
}

// =====================================================
// Mobile Menu Toggle
// =====================================================
class MobileMenu {
    constructor() {
        this.toggle = document.querySelector('.navbar-menu-toggle');
        this.menu = document.querySelector('.navbar-menu-items');
        this.isOpen = false;
        this.init();
    }

    init() {
        if (!this.toggle) return;

        this.toggle.addEventListener('click', () => this.handleToggle());

        // Close menu on link click
        if (this.menu) {
            this.menu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => this.close());
            });
        }

        // Close menu on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }

    handleToggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        this.toggle.textContent = 'Close';
        if (this.menu) {
            this.menu.style.display = 'flex';
        }
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        this.toggle.textContent = 'Menu';
        if (this.menu) {
            this.menu.style.display = '';
        }
        document.body.style.overflow = '';
    }
}

// =====================================================
// Contact Form Handler
// =====================================================
class ContactForm {
    constructor() {
        this.form = document.querySelector('.contact-form');
        this.init();
    }

    init() {
        if (!this.form) return;

        this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }

    async handleSubmit(e) {
        e.preventDefault();

        const formData = new FormData(this.form);
        const submitButton = this.form.querySelector('.form-submit');
        const originalText = submitButton.textContent;

        // Disable button and show loading state
        submitButton.disabled = true;
        submitButton.textContent = 'Sending...';

        try {
            // You can replace this with your actual form endpoint
            // For now, we'll simulate a form submission
            const response = await this.submitForm(formData);

            if (response.ok) {
                this.showSuccess();
                this.form.reset();
            } else {
                this.showError('Failed to send message. Please try again.');
            }
        } catch (error) {
            this.showError('An error occurred. Please try again later.');
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }

    async submitForm(formData) {
        // If you have a form endpoint (e.g., Formspree, Netlify Forms, etc.)
        // Replace this URL with your actual endpoint
        const formAction = this.form.getAttribute('action');

        if (formAction) {
            return fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });
        }

        // Simulate successful submission for demo purposes
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ ok: true });
            }, 1000);
        });
    }

    showSuccess() {
        alert('Thank you! Your message has been sent.');
    }

    showError(message) {
        alert(message);
    }
}

// =====================================================
// Initialize All Components
// =====================================================
document.addEventListener('DOMContentLoaded', () => {
    // Initialize smooth scrolling
    const smoothScroll = new SmoothScroll();

    // Initialize animations
    new AnimateOnScroll();

    // Initialize mobile menu
    new MobileMenu();

    // Initialize contact form
    new ContactForm();

    // Add loaded class to body for any initial animations
    document.body.classList.add('loaded');
});

// =====================================================
// Utility Functions
// =====================================================

// Debounce function for performance
function debounce(func, wait = 100) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
