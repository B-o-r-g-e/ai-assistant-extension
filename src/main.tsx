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
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);