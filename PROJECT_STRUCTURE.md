# Project Structure and File Explanation

This document explains the project structure in a visualization-style format, similar to how it is shown in a folder tree or architecture diagram.

---

## 1. Project Structure Tree

```text
AI-InterviewAgent/
├── app/
│   ├── (auth)/
│   │   ├── layout.tsx
│   │   ├── sign-in/
│   │   │   └── page.tsx
│   │   └── sign-up/
│   │       └── page.tsx
│   ├── (root)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── interview/
│   │   │   ├── page.tsx
│   │   │   └── [sessionId]/
│   │   │       ├── page.tsx
│   │   │       └── feedback/
│   │   ├── prep-hub/
│   │   │   └── page.tsx
│   │   ├── quiz/
│   │   │   └── page.tsx
│   │   ├── questions/
│   │   │   └── page.tsx
│   │   ├── profile/
│   │   │   └── page.tsx
│   │   ├── sign-out/
│   │   │   └── route.ts
│   │   └── api/
│   │       ├── prep-hub/
│   │       │   ├── analyze/
│   │       │   └── sessions/
│   │       ├── quiz/
│   │       │   ├── generate/
│   │       │   ├── save/
│   │       │   ├── sessions/
│   │       │   └── stats/
│   ├── api/
│   │   ├── chatbot/
│   │   │   └── route.ts
│   │   ├── interview/
│   │   │   ├── end/
│   │   │   ├── feedback/
│   │   │   └── sessions/
│   │   └── vapi/
│   │       └── webhook/
│   │           └── route.ts
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── Agent.tsx
│   ├── AIChatbot.tsx
│   ├── AuthForm.tsx
│   ├── DisplayTechIcons.tsx
│   ├── Footer.tsx
│   ├── Header.tsx
│   ├── HomePage.tsx
│   ├── InterviewCard.tsx
│   ├── ProfileUI.tsx
│   └── ui/
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── form.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── progress.tsx
│       ├── select.tsx
│       ├── separator.tsx
│       └── sonner.tsx
│
├── constants/
│   ├── index.ts
│   └── interview.ts
│
├── data/
│   ├── category-questions.json
│   └── company-questions.json
│
├── firebase/
│   ├── admin.ts
│   └── client.ts
│
├── lib/
│   ├── actions/
│   │   ├── auth.action.ts
│   │   ├── general.action.ts
│   │   └── history.action.ts
│   ├── key-rotator.ts
│   ├── utils.ts
│   └── vapi.sdk.ts
│
├── public/
│   └── covers/
│
├── types/
│   ├── index.d.ts
│   ├── interview.ts
│   └── vapi.d.ts
│
├── recap/
├── TECH_WORKFLOWS/
├── package.json
├── tsconfig.json
├── next.config.ts
├── eslint.config.mjs
├── components.json
├── postcss.config.mjs
├── firebase.json
├── netlify.toml
├── README.md
└── next-env.d.ts
```

---

## 2. Explanation of Each Main Area

### app/
This is the main application layer of the project. It contains:
- pages and layouts,
- route groups for authentication and main app contents,
- and all backend API routes.

### components/
This contains reusable user interface components that build the frontend screens.

### lib/
This houses the project logic and utility modules, including server actions and helper functions.

### firebase/
This contains Firebase client and admin setup used for authentication and database access.

### constants/
This stores shared constants used by the application.

### data/
This contains static question-bank content for interview practice.

### public/
This stores static assets such as images and covers.

### types/
This contains TypeScript types for a structured and safer development experience.

### recap/ and TECH_WORKFLOWS/
These folders contain documentation, notes, and workflow explanations for the project.

---

## 3. Root Level Files Explanation

### package.json
Defines dependencies and scripts like development, build, and lint.

### tsconfig.json
Configures TypeScript compiler options.

### next.config.ts
Sets Next.js behavior and deployment settings.

### firebase.json
Used for Firebase hosting and project settings.

### netlify.toml
Used for Netlify deployment configuration.

### README.md
Main documentation file for the project.

---

## 4. How the Structure is Organized

The project follows a standard full-stack web application structure:
- frontend pages and routes are under app/
- reusable UI is under components/
- business logic is under lib/
- data and configuration are placed in separate folders for clarity

This makes the project easier to understand, scale, and maintain.

### package.json
Contains all project dependencies and scripts used to run, build, and lint the application.

### tsconfig.json
TypeScript configuration file that defines compiler options and project settings.

### next.config.ts
Configuration file for Next.js, including app behavior and deployment-related settings.

### eslint.config.mjs
Configuration for ESLint to enforce coding standards and quality checks.

### components.json
Configuration for the UI component setup used by shadcn/ui.

### postcss.config.mjs
PostCSS configuration for processing styles, mainly used with Tailwind CSS.

### firebase.json
Firebase project configuration for deployment and hosting-related setup.

### netlify.toml
Deployment configuration for Netlify hosting.

### README.md
Project overview and documentation for the repository.

---

## 2. app/ Folder
This is the main Next.js App Router folder. It contains the pages, layouts, and server-side API routes.

### app/layout.tsx
The root layout file that applies the global layout and shared UI structure to the application.

### app/globals.css
Global stylesheet containing base styles, theme variables, and shared CSS rules.

### app/page.tsx
The home page of the application.

### app/(auth)/
Contains authentication-related pages such as sign-in and sign-up.

### app/(root)/
Contains the main authenticated application pages such as:
- home dashboard
- interview page
- prep hub page
- quiz page
- profile page
- sign-out route
- protected API routes

### app/api/
Contains public backend API routes such as:
- chatbot endpoint
- interview feedback endpoint
- Vapi webhook endpoint

### app/(root)/api/
Contains protected or authenticated API routes for:
- interview flow
- quiz generation and save
- prep-hub analysis
- session history

---

## 3. components/ Folder
This folder contains reusable React UI components used across the application.

### components/Agent.tsx
Handles the voice interview agent UI or Vapi-related interaction logic.

### components/AIChatbot.tsx
The floating or embedded AI chatbot component used in the app.

### components/AuthForm.tsx
Reusable form for sign-in and sign-up.

### components/Header.tsx
Top navigation bar for the application.

### components/Footer.tsx
Footer component shown across the app.

### components/HomePage.tsx
Main landing or home page UI block.

### components/InterviewCard.tsx
Displays interview history or summary cards.

### components/ProfileUI.tsx
UI for the user profile and analytics dashboard.

### components/DisplayTechIcons.tsx
Renders technology stack icons in the UI.

### components/ui/
Contains reusable UI primitives such as button, card, input, dialog, badge, separator, and progress components.

---

## 4. lib/ Folder
This folder contains utility logic and server-side functions.

### lib/utils.ts
Common helper functions used across the app.

### lib/key-rotator.ts
Helps manage API keys for AI providers in a more robust way.

### lib/vapi.sdk.ts
Utility wrapper or integration logic for the Vapi voice AI service.

### lib/actions/
Contains server actions and backend logic for important features.

#### lib/actions/auth.action.ts
Handles authentication-related server actions such as session cookie management and user lookup.

#### lib/actions/general.action.ts
Contains general backend helper functions for feedback or other shared operations.

#### lib/actions/history.action.ts
Used to fetch and manage user history such as interview sessions, quiz history, and prep sessions.

---

## 5. firebase/ Folder
Contains Firebase configuration files.

### firebase/client.ts
Client-side Firebase initialization for frontend usage.

### firebase/admin.ts
Server-side Firebase Admin SDK initialization used for secured backend operations.

---

## 6. constants/ Folder
Stores constant values used throughout the app.

### constants/index.ts
General constants.

### constants/interview.ts
Interview-related constants such as interview types, assistant mappings, and role-based values.

---

## 7. data/ Folder
Contains static JSON data used by the project.

### data/category-questions.json
Question bank content grouped by category.

### data/company-questions.json
Company-related interview questions.

---

## 8. public/ Folder
Used for static assets such as images, logos, and covers.

### public/covers/
Stores image assets used by the UI.

---

## 9. types/ Folder
Contains TypeScript type definitions used across the app.

### types/index.d.ts
General shared types.

### types/interview.ts
Types related to interview sessions and feedback.

### types/vapi.d.ts
Types related to Vapi integration.

---

## 10. recap/ Folder
Contains project documentation and feature summaries created during development.

### recap/*.md
Useful notes and summaries explaining major features of the project.

---

## 11. TECH_WORKFLOWS/ Folder
Contains workflow documentation for different modules.

### TECH_WORKFLOWS/README.md
Index of the workflow documents.

### TECH_WORKFLOWS/*.md
Each file explains one workflow in detail, such as authentication, mock interviews, prep hub, chatbot, quiz, and interview matrix.

---

## Why This Structure Is Good

The project is organized in a clean modular way:
- app/ handles routing and pages
- components/ handles UI building blocks
- lib/ handles logic and utilities
- firebase/ handles backend database/auth integration
- data/ stores content and question data
- types/ keeps the project strongly typed

This structure makes the project easier to scale, maintain, and understand.

---

## Simple Summary
The project is divided into clear sections:
- frontend pages and routes in app/
- reusable UI in components/
- business logic in lib/
- Firebase integration in firebase/
- static content in data/
- type definitions in types/

This separation helps keep the application organized and easier to extend in future updates.
