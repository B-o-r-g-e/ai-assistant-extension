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

### 2️⃣ Install Dependencies
```bash
npm install
```

### 3️⃣ Build the Extension
```bash
npm run build
```

### 4️⃣ Load into Chrome
- Open Chrome and navigate to `chrome://extensions/`.
- Enable "Developer mode" (top right).
  - Click "Load unpacked" and select the `dist` folder from the project directory.

### 5️⃣ Start Using
- Click the extension icon in the toolbar to open the AI Assistant.

### 5️⃣ Start Using

1. Open any webpage.
2. Highlight the text you want to process and right\-click.
3. Choose an action such as Summarize, Proofread, Rewrite, or Translate.
4. Alternatively, click the extension icon in the toolbar to open the AI Assistant.

## 🧠 What Inspired This Project

The idea came from everyday frustration \— switching between multiple tools for studying, writing, and translating.
The goal was to combine all of them into one lightweight, privacy-focused assistant that works offline using Chrome’s new built-in AI.

## 🧩 Challenges Faced

- Integrating multiple Chrome AI APIs in one extension.
- Ensuring smooth UX and fast response without cloud latency.
- Handling different content types (text, selections, images).

## 🏆 Accomplishments

- Fully functional multi-mode Chrome Extension using Gemini Nano.
- Zero backend \— 100% client-side AI.
- Clean, responsive UI built with React + shadcn/ui.
- Seamless context menu integration for quick actions.

## 🔮 What’s Next

- Add voice command support and speech translation.
- Implement note-saving with Firebase for optional cloud sync.
- Support for multi-tab AI memory (context awareness).
- Launch on Chrome Web Store for public use.

## 🧭 System Architecture

+------------------------------------------------------+
|                Chrome Browser (User Side)            |
|------------------------------------------------------|
|  AI Assistant Extension UI (React + Tailwind + shadcn/ui) |
|         ↓                                              |
|  Chrome Built-in AI APIs (Prompt, Summarizer, etc.)    |
|         ↓                                              |
|  Gemini Nano (Local AI Inference Engine)               |
|         ↓                                              |
|  Output: Summaries, Rewrites, Proofreads, Translations |
+------------------------------------------------------+

Everything happens locally \— no external servers, no data leakage.

## 🎬 Demo Video

▶️ Watch the demo video: YouTube Link Here \- https://youtu.be/nCR3WWzkPUc

## 📜 License

This project is licensed under the MIT License.

## 🤝 Contributing

Contributions are welcome! Fork the repository, make your improvements, and submit a pull request.

## 💡 Author

Oluwapelumi Babalola  
Built for the Google Chrome Built-in AI Challenge 2025  
Follow my journey on GitHub: `https://github.com/B-o-r-g-e` or X: `https://x.com/b_o_r_g_e`
