# Libraries and Dependencies Documentation

This file explains the main libraries used in the AI Interview Agent project and why they were chosen.

## 1. Framework and Core Libraries

| Library | Version | Purpose |
|---|---:|---|
| next | 15.5.3 | Main React framework for server-rendered web application and API routes |
| react | 19.1.0 | UI library for building interactive components |
| react-dom | 19.1.0 | Rendering React components in the browser |
| typescript | 5 | Adds static typing for safer and more maintainable code |

## 2. UI and Styling Libraries

| Library | Version | Purpose |
|---|---:|---|
| tailwindcss | 4 | Utility-first CSS framework for fast styling |
| tailwind-merge | 3.5.0 | Merges Tailwind CSS class names efficiently |
| tailwindcss-animate | 1.0.7 | Adds animation utilities for Tailwind |
| lucide-react | 0.544.0 | Icon library for UI elements |
| next-themes | 0.4.6 | Theme switching support such as dark/light mode |
| shadcn | 4.0.5 | UI component setup using reusable and accessible components |
| @radix-ui/react-label | 2.1.7 | Accessible form label primitives |
| @radix-ui/react-slot | 1.2.3 | Utility for composing components in Radix UI patterns |
| clsx | 2.1.1 | Helps conditionally combine class names |
| class-variance-authority | 0.7.1 | Handles dynamic variant-based styling |

## 3. Form and Validation Libraries

| Library | Version | Purpose |
|---|---:|---|
| react-hook-form | 7.63.0 | Manages forms with less boilerplate |
| @hookform/resolvers | 5.2.2 | Integrates validation libraries with React Hook Form |
| zod | 4.1.11 | Schema-based validation for form and API input |

## 4. Firebase and Backend Libraries

| Library | Version | Purpose |
|---|---:|---|
| firebase | 12.10.0 | Client-side Firebase SDK for authentication and Firestore access |
| firebase-admin | 13.7.0 | Server-side Firebase SDK for admin operations and Firestore access |

## 5. AI and API Libraries

| Library | Version | Purpose |
|---|---:|---|
| @ai-sdk/google | 3.0.43 | Google AI SDK for AI-based integrations |
| @google/generative-ai | 0.24.1 | Google Generative AI SDK used for AI features |
| ai | 6.0.116 | General AI SDK utilities for model integration |
| @vapi-ai/web | 2.5.2 | Voice AI SDK for handling Vapi-based interview sessions |
| react-markdown | 10.1.0 | Renders markdown content from AI responses |

## 6. File Handling and Utilities

| Library | Version | Purpose |
|---|---:|---|
| mammoth | 1.11.0 | Extracts text from DOCX files |
| pdf-parse-fork | 1.2.0 | Parses PDF files for resume and job description text extraction |
| uuid | 13.0.0 | Generates unique IDs for sessions and records |
| dayjs | 1.11.18 | Lightweight date formatting and manipulation |
| recharts | 3.8.0 | Charting library for quiz analytics and progress visualization |
| sonner | 2.0.7 | Toast notifications for better user feedback |

## 7. Development and Tooling Libraries

| Library | Version | Purpose |
|---|---:|---|
| eslint | 9 | Linting for code quality |
| eslint-config-next | 15.5.3 | Recommended ESLint rules for Next.js |
| @eslint/eslintrc | 3 | ESLint configuration support |
| @tailwindcss/postcss | 4 | Tailwind integration for PostCSS |
| @types/node | 20 | TypeScript definitions for Node.js |
| @types/react | 19 | TypeScript definitions for React |
| @types/react-dom | 19 | TypeScript definitions for React DOM |
| @types/uuid | 10.0.0 | TypeScript definitions for UUID |
| @types/pdf-parse | 1.1.5 | TypeScript definitions for PDF parsing |
| tw-animate-css | 1.4.0 | CSS animations support for Tailwind |
| @netlify/plugin-nextjs | 5.15.9 | Netlify deployment plugin for Next.js |

## 8. Why These Libraries Were Chosen

- Next.js was chosen because the project is a full-stack web app with both frontend pages and backend API routes.
- React and TypeScript were used for a modern, scalable, and maintainable UI.
- Tailwind CSS and shadcn UI helped build a clean and responsive interface quickly.
- Firebase was selected for authentication and database integration.
- AI libraries were added to power chatbot, quiz generation, resume analysis, and feedback generation.
- Recharts and Sonner improve analytics and user experience.

## 9. Summary
These libraries together make the project fast to develop, visually polished, AI-enabled, and suitable for deployment as a modern web application.
