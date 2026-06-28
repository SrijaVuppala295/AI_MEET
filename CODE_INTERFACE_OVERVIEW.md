# Code-Level Interface Overview

This document explains the interfaces and component-level structure used in the codebase for the UI of the project.

---

## 1. Main UI Component Structure

The project uses React components to separate the interface into reusable parts.

### Main components
- Header
- Footer
- HomePage
- AuthForm
- Agent
- AIChatbot
- InterviewCard
- ProfileUI
- DisplayTechIcons

Each component represents a part of the user interface and is composed together to build pages.

---

## 2. Interface of the Main Components

### 2.1 Header Component
**Purpose:** Navigation bar for the app.

**Typical interface responsibilities:**
- show app logo or name
- navigate between pages
- show auth-related actions
- show user profile access

### 2.2 Footer Component
**Purpose:** Bottom section of the application.

**Typical interface responsibilities:**
- display app information
- show links or credits
- improve overall page completeness

### 2.3 HomePage Component
**Purpose:** Landing page UI.

**Typical interface responsibilities:**
- welcome section
- feature summary
- buttons to start using the product
- links to interview, quiz, or prep hub

### 2.4 AuthForm Component
**Purpose:** Handles sign-in and sign-up interface.

**Typical interface responsibilities:**
- email input
- password input
- submit button
- toggle between sign-in and sign-up
- validation error display

### 2.5 Agent Component
**Purpose:** Voice interview interface or Vapi interaction wrapper.

**Typical interface responsibilities:**
- start or stop interview button
- display AI interview status
- connect the voice agent
- manage microphone-related states

### 2.6 AIChatbot Component
**Purpose:** Chat window for AI support.

**Typical interface responsibilities:**
- message input field
- send button
- chat bubble display
- conversation history handling
- loading indicator while waiting for response

### 2.7 InterviewCard Component
**Purpose:** Shows interview summaries or history cards.

**Typical interface responsibilities:**
- interview title or topic
- score display
- date/time
- feedback summary
- link to detailed session view

### 2.8 ProfileUI Component
**Purpose:** User profile and analytics interface.

**Typical interface responsibilities:**
- user information display
- interview history summary
- quiz history
- progress analytics
- profile settings or action buttons

### 2.9 DisplayTechIcons Component
**Purpose:** Visual representation of technologies used.

**Typical interface responsibilities:**
- render icons for frameworks or tools
- show tech stack visually

---

## 3. Reusable UI Primitive Interfaces

The project also uses reusable interface components from the ui folder.

### Examples
- Button
- Card
- Input
- Label
- Form
- Dialog
- Select
- Progress
- Badge
- Separator

These components act as building blocks for the screens and provide consistent styling and behavior.

---

## 4. Page-Level Interface Flow

### Authentication Page
- AuthForm is rendered inside the auth layout
- user can sign in or sign up

### Main App Page
- Header and Footer are shown globally
- HomePage or dashboard content is displayed based on route

### Interview Page
- Interview configuration form is shown
- Agent component handles the voice interaction experience
- Feedback is shown after completion

### Prep Hub Page
- Resume upload input and JD input are shown
- Analysis output is displayed as cards or sections

### Quiz Page
- Quiz question cards and answer options are rendered
- scoring and explanation panels are shown

### Profile Page
- ProfileUI displays analytics and user history

---

## 5. Interface Design Pattern Used

The code follows a component-based interface design pattern:
- each page is composed of smaller reusable components,
- UI logic is separated from business logic,
- shared styling is handled through Tailwind-based primitives,
- and the app uses modular components for easier maintenance.

---

## 6. Summary
The code-level interface of this project is built using reusable React components and shared UI primitives. The interface is organized into clear sections such as authentication, home, interviews, prep hub, quiz, chatbot, and profile. This modular approach makes the project easier to develop, maintain, and extend.
