# Saraj Design

A modern portfolio website built with vanilla HTML, CSS, and JavaScript.

## 🚀 Live Demo

Deployed on Vercel: [sarajdesign.vercel.app](https://sarajdesign.vercel.app)

## 📁 Project Structure

```
Sam-Awh/
├── index.html           # Home page
├── contact/
│   └── index.html       # Contact page with form
├── 404/
│   └── index.html       # Custom 404 error page
├── css/
│   └── styles.css       # All styles
├── js/
│   └── main.js          # JavaScript (smooth scroll, animations, form)
├── assets/
│   └── favicon.svg      # Site favicon
├── vercel.json          # Vercel deployment config
└── README.md            # This file
```

## ✨ Features

- **Dark Theme**: Sleek dark design with purple-gold gradient accents
- **Responsive**: Optimized for desktop (1200px), tablet (810px), and mobile (<810px)
- **Smooth Scrolling**: Lenis smooth scroll library
- **Animations**: CSS animations with intersection observer
- **Contact Form**: Ready for form backend integration
- **SEO Optimized**: Open Graph and Twitter meta tags

## 🎨 Design Tokens

| Token | Value |
|-------|-------|
| Background | `#141517` |
| Primary Text | `#ffffff` |
| Secondary Text | `rgba(255, 255, 255, 0.7)` |
| Gradient | Purple (#8800ff) to Gold (#ffc157) |
| Font | Inter (400, 500, 600, 700) |

## 🛠️ Development

This is a static site - no build process required!

1. Clone the repository
2. Open `index.html` in your browser
3. Or use a local server: `npx serve`

## 📦 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Deploy with zero configuration

### Other Platforms

Works with any static hosting:
- Netlify
- GitHub Pages
- Cloudflare Pages
- Firebase Hosting

## 📝 Form Integration

The contact form is ready for backend integration. Options:

1. **Formspree**: Add `action="https://formspree.io/f/YOUR_ID"` to the form
2. **Netlify Forms**: Add `netlify` attribute to the form tag
3. **Custom API**: Update the `submitForm` function in `js/main.js`

## 📄 License

All rights reserved © 2026 Saraj Design