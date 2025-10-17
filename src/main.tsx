import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Declare the actual Chrome AI APIs that exist in Chrome 138+
declare global {
    interface Window {
        ai?: {
            summarizer?: {
                create: (options?: any) => Promise<any>;
                capabilities: () => Promise<any>;
            };
            languageModel?: {
                create: (options?: any) => Promise<any>;
                capabilities: () => Promise<any>;
            };
            translator?: {
                create: (options?: any) => Promise<any>;
                capabilities: () => Promise<any>;
            };
        };
    }

    // Global Summarizer API (Chrome 138+)
    var Summarizer: {
        create: (options?: any) => Promise<any>;
        availability: () => Promise<string>;
    };

    // Global Proofreader API (Chrome 141+)
    var Proofreader: {
        create: (options?: any) => Promise<any>;
        availability: () => Promise<string>;
    };

    // Global LanguageModel API (Chrome 138+) - The Prompt API
    var LanguageModel: {
        create: (options?: any) => Promise<any>;
        availability: () => Promise<string>;
        params: () => Promise<any>;
    };

    // Global Translator API (Chrome 138+)
    var Translator: {
        create: (options?: any) => Promise<any>;
        availability: (options?: any) => Promise<string>;
    };
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);