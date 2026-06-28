# 🔐 Authentication Workflow: Technical Deep Dive

The **Authentication System** in AI MEET is built to provide a secure, seamless, and persistent user experience. It leverages **Firebase Authentication** for identity management and **Next.js Server Actions** for session persistence.

---

## 🛠️ Technology Stack
| Component | Technology | Role |
| :--- | :--- | :--- |
| **Identity Provider** | Firebase Auth | Handles email/password, Google, and GitHub logins. |
| **Session Management** | Next.js Cookies | Stores an `httpOnly` session cookie for persistent login. |
| **Backend Validation** | Firebase Admin SDK | Verifies session cookies on the server side. |
| **Database** | Firestore | Stores additional user metadata (name, email, join date). |
| **Validation** | Zod + React Hook Form | Ensures user input is valid before submission. |

---

## 🚀 End-to-End Workflow

### 1. User Interaction (Frontend)
- The user interacts with the `AuthForm` component (`/sign-in` or `/sign-up`).
- **Validation**: As the user types, **Zod** validates the fields (e.g., email format, password length).
- **Social Login**: If the user clicks Google/GitHub, the `signInWithPopup` method from Firebase Client SDK is triggered.

### 2. Authentication (Firebase Client)
- For email/password: `signInWithEmailAndPassword` or `createUserWithEmailAndPassword` is called.
- Firebase returns a **User Credential** object containing a unique `uid` and a short-lived `idToken`.

### 3. Session Creation (Server Action)
- The `idToken` is sent to the server via the `signIn` or `signUp` Server Action.
- **Admin Verification**: The server uses the **Firebase Admin SDK** to verify the `idToken`.
- **Session Cookie**: The server calls `auth.createSessionCookie()`, creating a secure, 7-day session token.
- **Set Cookie**: This token is stored in the browser as an `httpOnly` cookie named `session`. This is "invisible" to client-side JavaScript, protecting it from XSS attacks.

### 4. Database Sync
- On first sign-up, the `signUp` action creates a document in the Firestore `users` collection using the user's `uid`.
- This document stores the user's name and email for use throughout the platform.

### 5. Persistent Authentication
- Every time the user visits a page, the `getCurrentUser()` helper is called.
- It reads the `session` cookie and verifies it with the Admin SDK.
- If valid, the user's profile is loaded; if not, the cookie is cleared and the user is redirected to the login page.

---

## 📡 API Interaction & Responses

### Request: `POST /lib/actions/auth.action/signIn`
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `email` | String | User's email address. |
| `idToken` | String | Temporary token from Firebase Client SDK. |

### Response: `Success`
```json
{
  "success": true,
  "message": "Signed in successfully."
}
```

### Response: `Error`
```json
{
  "success": false,
  "message": "Invalid email or password."
}
```

---

## 💡 Why this approach?
- **Security**: Using `httpOnly` cookies instead of `localStorage` prevents tokens from being stolen by malicious scripts.
- **Speed**: Server Actions allow us to handle auth logic without creating separate API endpoints, keeping the code clean.
- **Scalability**: Firebase handles the heavy lifting of password hashing and social provider integrations.
