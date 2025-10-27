# 🧠 AI Assistant for Everyday Life – Chrome Extension

**Smart. Private. Offline.**  
An all-in-one Chrome Extension powered by **Gemini Nano** and Chrome’s **Built-in AI APIs** that helps users study smarter, write better, and travel easier — all directly in their browser.

---

## 🚀 Overview

**AI Assistant for Everyday Life** transforms how users interact with the web by bringing on-device AI capabilities — summarization, proofreading, rewriting, and translation — right into Chrome.  
Unlike cloud-based tools, all AI features work locally on the user’s device using **Gemini Nano**, ensuring **speed, privacy, and offline access**.

---

## 🎯 Features

### 📚 Study Mode
- Summarize articles, research papers, or any selected web content using the **Summarizer API**.
- Get structured notes, bullet points, and clear takeaways instantly.

### 💼 Career Mode
- Write professional cover letters using the **Writer API**.
- Fix grammar and style errors with the **Proofreader API**.
- Rephrase or improve existing text using the **Rewriter API**.

### 🌍 Travel Mode
- Translate text or images using the **Translator API**.
- Works seamlessly even when offline, thanks to client-side AI processing.

---

## 🧩 Core Technologies

| Category | Technology Used |
|-----------|----------------|
| Frontend | React + TypeScript + Vite |
| UI Library | shadcn/ui + Tailwind CSS |
| Animations | Framer Motion |
| Backend | None (fully client-side) |
| AI APIs | Chrome Built-in AI (Gemini Nano) |
| Browser | Chrome Extension (Manifest V3) |
| Version Control | Git + GitHub |
| Build Tool | Vite |

---

## ⚙️ How It Works

The extension interacts with Chrome’s built-in **AI APIs** directly:
- Uses the **Prompt API** for dynamic context understanding.
- Integrates the **Summarizer**, **Proofreader**, **Rewriter**, **Writer**, and **Translator APIs** for intelligent content processing.
- All requests and responses happen **locally**, ensuring user data never leaves the device.

---

## 🏗️ Project Setup

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/<your-username>/ai-assistant-extension.git
cd ai-assistant-extension

### 2 Install Dependencies
```bash
npm install 

### 3️Build the Project
```bash
npm run build