import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure Chrome AI APIs are available
declare global {
    interface Window {
        ai?: {
            summarizer?: {
                create: () => Promise<{
                    summarize: (text: string) => Promise<{ summary: string }>;
                }>;
            };
            proofreader?: {
                create: () => Promise<{
                    proofread: (text: string) => Promise<{ corrections: string }>;
                }>;
            };
            translator?: {
                create: (options: { targetLanguage: string }) => Promise<{
                    translate: (text: string) => Promise<{ translations: string }>;
                }>;
            };
            writer?: {
                create: () => Promise<{
                    write: (prompt: string) => Promise<{ output: string }>;
                }>;
            };
            rewriter?: {
                create: (options: { style: string }) => Promise<{
                    rewrite: (text: string) => Promise<{ output: string }>;
                }>;
            };
            prompt?: {
                create: (options: { multimodal?: boolean }) => Promise<{
                    prompt: (input: { text: string; image?: Blob }) => Promise<{ output: string }>;
                }>;
            };
        };
    }

    namespace chrome {
        namespace ai {
            const summarizer: {
                create: () => Promise<{
                    summarize: (text: string) => Promise<{ summary: string }>;
                }>;
            };
            const proofreader: {
                create: () => Promise<{
                    proofread: (text: string) => Promise<{ corrections: string }>;
                }>;
            };
            const translator: {
                create: (options: { targetLanguage: string }) => Promise<{
                    translate: (text: string) => Promise<{ translations: string }>;
                }>;
            };
            const writer: {
                create: () => Promise<{
                    write: (prompt: string) => Promise<{ output: string }>;
                }>;
            };
            const rewriter: {
                create: (options: { style: string }) => Promise<{
                    rewrite: (text: string) => Promise<{ output: string }>;
                }>;
            };
            const prompt: {
                create: (options: { multimodal?: boolean }) => Promise<{
                    prompt: (input: { text: string; image?: Blob }) => Promise<{ output: string }>;
                }>;
            };
        }
    }
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);