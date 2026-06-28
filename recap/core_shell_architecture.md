# 🏗️ Core Shell & Project Architecture: The Final Layer

This document covers the "Glue" of the AI-InterviewAgent—the global layout, shared navigation components, and the structural configurations that allow the 7 core features to operate as one unified platform.

---

## 🚀 1. The Global Shell (Root Layout)
*   **[app/layout.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/layout.tsx)**: The absolute entry point.
    *   **Typography**: Configures `Geist` and `Mona_Sans` as the global font variables.
    *   **Styling**: Imports `globals.css` and the "dot pattern" background.
    *   **Feedback**: Injects the `Sonner Toaster` for high-performance notification popups.
*   **[app/globals.css](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/app/globals.css)**: The custom CSS layer. Defines the gradients, animations, and the "dark-themed" design system tokens.

---

## 🧭 2. Global Navigation System
*   **[components/Header.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/Header.tsx)**: The premium Navbar.
    *   **Feature Dropdown**: Dynamically checks if the user is authenticated; if not, it redirects "Feature" clicks to the Login page.
    *   **Auth State**: Changes from "Sign In/Up" buttons to a Profile Avatar once logged in.
    *   **Scroll Logic**: Transitions from transparent to blurred white as the user scrolls down.
*   **[components/Footer.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/Footer.tsx)**: Consistent branding and legal links at the bottom of every page.

---

## 🏠 3. The Front Door (Landing Page)
*   **[components/HomePage.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/HomePage.tsx)**: The main landing page.
    *   **Hero Section**: Sells the concept of "Mastering your Interview."
    *   **Feature Showcase**: Provides visual entry points into the Interview, Prep, and Quiz modules.

---

## 🛠️ 4. Shared Atoms & Utilities
*   **[lib/utils.ts](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/lib/utils.ts)**: Home to the `cn` (class merging) function, the backbone of the project's Tailwind styling.
*   **[components/FormField.tsx](file:///c:/Users/Manikanta/OneDrive/Documents/SRIJA/OM_NAMA_SHIVAYA/PROJECTS/AI-InterviewAgent/components/FormField.tsx)**: A reusable wrapper for input fields that handles validation errors and styling consistently across the platform.

---

## 🧹 5. Maintenance Scripts (Root Folder)
These `.js` files are "Helper Scripts" used by the development team to polish the app:
*   **`fix-auth-ui.js`**: Batch-updates authentication styling.
*   **`fix-dark-theme-all.js`**: Ensures proper high-contrast colors across all modules.
*   **`tmp-replace-gradients.js`**: Standardizes the "Indigo-to-Purple" gradients used throughout the UI.

---

## 🛣️ Learning Roadmap: The Final Connection
1.  **Global Vision**: Start at `layout.tsx` to see how the app is initialized.
2.  **Navigation Flow**: Study `Header.tsx` to understand how the user travels between modules.
3.  **Styling Standard**: Open `lib/utils.ts` to see how we manage dynamic CSS classes.
