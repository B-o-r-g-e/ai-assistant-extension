import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Tabs from './components/Tabs';
import StudyTab from './components/StudyTab';
import CareerTab from './components/CareerTab';
import TravelTab from './components/TravelTab';
import { BookOpen, Briefcase, Plane } from 'lucide-react';

export type TabType = 'study' | 'career' | 'travel';

interface Tab {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
}

function App() {
    const [activeTab, setActiveTab] = useState<TabType>('study');
    const [selectedText, setSelectedText] = useState<string>('');
    const [contextAction, setContextAction] = useState<string>('');

    // Check for context menu selections on load
    useEffect(() => {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' }, (response) => {
                if (response?.selectedText) {
                    setSelectedText(response.selectedText);
                    setContextAction(response.action || '');
                    // Switch to study tab if text was selected for AI processing
                    if (response.action) {
                        setActiveTab('study');
                    }
                }
            });
        }
    }, []);

    const tabs: Tab[] = [
        {
            id: 'study',
            label: 'Study',
            icon: <BookOpen className="w-4 h-4" />,
            component: <StudyTab initialText={selectedText} contextAction={contextAction} />
        },
        {
            id: 'career',
            label: 'Career',
            icon: <Briefcase className="w-4 h-4" />,
            component: <CareerTab />
        },
        {
            id: 'travel',
            label: 'Travel',
            icon: <Plane className="w-4 h-4" />,
            component: <TravelTab />
        }
    ];

    const activeTabData = tabs.find(tab => tab.id === activeTab);

    return (
        <div className="w-full h-full min-h-[600px] bg-background text-foreground">
            {/* Header */}
            <div className="border-b border-border bg-card">
                <div className="p-4">
                    <h1 className="text-lg font-semibold text-foreground">
                        AI Assistant for Everyday Life
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Powered by Chrome's built-in Gemini Nano
                    </p>
                </div>
            </div>

            {/* Tab Navigation */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{
                            duration: 0.3,
                            ease: [0.4, 0, 0.2, 1]
                        }}
                        className="h-full"
                    >
                        {activeTabData?.component}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="border-t border-border bg-card p-3">
                <div className="flex items-center justify-center text-xs text-muted-foreground">
                    <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>AI running locally in Chrome</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;