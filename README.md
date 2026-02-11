# 🏴‍☠️ Piratage Website

A modern full‑stack web application built with TypeScript, Vite, and Node.js — designed to showcase dynamic event management and email notification features.

**Live Site:** https://piratagewebsite.tech

---

## 🚀 About

**Piratage Website** is a scalable web project that demonstrates:

- Modular architecture (client / server / shared)
- Client‑side interface with Vite and TypeScript
- Backend API built with Node.js
- Email template management and automation
- Best practices for maintainability and deployment

It’s structured to support future event management features and integrations.

---

## 🗂️ Project Structure

```
├── api/                   # REST API endpoints
├── client/                # Frontend application (Vite + TypeScript)
├── event_management/      # Event logic & email templates
├── public/                # Static assets
├── server/                # Backend server code
├── shared/                # Reusable types and utilities
├── .gitignore
├── package.json
├── tsconfig.json
├── vite.config.ts
```

---

## 🧩 Tech Stack

| Layer         | Technology |
|---------------|------------|
| Frontend      | Vite, TypeScript, HTML, CSS |
| Backend       | Node.js, TypeScript |
| Email Support | SMTP, Brevo (testing) |
| Build Tools   | Vite, pnpm |
| Deployment    | Vercel / Node.js hosts |

---

## 🛠️ Getting Started

### 📥 Clone the repository

```bash
git clone https://github.com/Biswajitn23/piratagewebsite.git
cd piratagewebsite
```

---

### 📦 Install dependencies

```bash
pnpm install
```

---

### ⚙️ Environment Setup

Create a `.env` file in the project root with:

```
PORT=3000
SMTP_HOST=
SMTP_PORT=
SMTP_USER=
SMTP_PASS=
BREVO_API_KEY=
```

Make sure to replace values with your credentials.

---

### 🚧 Run Locally

**Start the backend server:**

```bash
pnpm server
```

**Start the frontend dev server:**

```bash
pnpm client
```

Open your browser at `http://localhost:5173` (or as shown in your terminal).

---

## 📜 Available Scripts

| Command            | Description |
|-------------------|-------------|
| `pnpm client`      | Starts frontend dev server |
| `pnpm server`      | Starts backend server |
| `pnpm build`       | Builds frontend for production |
| `pnpm test`        | Runs tests (if configured) |
| `pnpm lint`        | Runs linter |

---

## 📧 Email Templates

Email templates for events are available in:

```
/event_management
```

- `EVENT_EMAIL_TEMPLATE.html`
- `email-template-event.html`
- `email-template-welcome.html`

Customize these for your own branding or content.

---

## 🚀 Deployment

You can deploy on any Node.js‑friendly host such as:

- Vercel
- Railway
- Render

Make sure to configure environment variables on your deployment platform.

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch
3. Submit a pull request

---

## 📄 License

This project uses the **MIT License**. See `LICENSE` for details.

---

## 🙌 Thank You!

Thanks for checking out *Piratage Website!*  
Built with love using TypeScript and modern web tooling.
