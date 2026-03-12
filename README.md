# Quantum Authentication Vault (QAV) v8.0

**Architecture:** Vite + React (TypeScript) | Netlify Serverless Functions | Zero-Knowledge Encryption

---

## 1. Overview

Quantum Authentication Vault (QAV) is a high-assurance credential management system leveraging **AES-256-GCM** client-side encryption. This version is architected for secure, scalable deployment on serverless platforms like Netlify.

All sensitive operations, including database queries and AI interactions, are proxied through secure Netlify Functions, ensuring no API keys or database credentials are ever exposed to the client.

## 2. Tech Stack

- **Frontend:** React 19 (TypeScript), Vite, Tailwind CSS
- **Backend:** Netlify Functions (TypeScript)
- **Database:** NeonDB (PostgreSQL Serverless)
- **AI Engine:** Google Gemini
- **Cryptography:** Web Crypto API (AES-GCM, PBKDF2), `node-forge` (RSA)

---

## 3. Local Development

### Prerequisites
- Node.js v18+
- Netlify CLI (`npm install -g netlify-cli`)

### Setup
1.  **Install Dependencies:**
    ```bash
    npm install
    ```
2.  **Configure Environment:**
    - Create a `.env` file in the root directory.
    - Add your secret keys:
      ```
      VITE_GEMINI_API_KEY="your_gemini_api_key"
      DATABASE_URL="your_neondb_connection_string"
      ```
3.  **Run Development Server:**
    The Netlify CLI will run your Vite server and the serverless functions simultaneously.
    ```bash
    netlify dev
    ```
    The application will be available at `http://localhost:8888`.

---

## 4. Deployment to Netlify

1.  **Connect Your Git Repository:**
    - Link your GitHub/GitLab repository to a new site in the Netlify dashboard.

2.  **Configure Build Settings:**
    - **Build command:** `npm run build`
    - **Publish directory:** `dist`
    - The `netlify.toml` file in this repository will automatically configure the serverless functions.

3.  **Add Environment Variables:**
    - In your Netlify site's "Site configuration" > "Build & deploy" > "Environment" section, add the same `VITE_GEMINI_API_KEY` and `DATABASE_URL` variables.

4.  **Deploy:**
    - Trigger a new deploy from the Netlify UI or by pushing to your main branch.

---

## 5. Project Structure

```
/
├── netlify/
│   └── functions/        # Serverless backend functions
│       ├── db.ts
│       └── gemini.ts
├── public/               # Static assets
├── src/                  # Frontend source code
│   ├── components/
│   ├── contexts/
│   ├── hooks/
│   ├── services/
│   ├── types/
│   ├── App.tsx
│   └── index.tsx
├── netlify.toml          # Netlify deployment config
└── vite.config.ts        # Vite build config
```
