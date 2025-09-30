import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../utils/cn';
import type {TabType} from '../App';

interface Tab {
    id: TabType;
    label: string;
    icon: React.ReactNode;
    component: React.ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: TabType;
    onTabChange: (tab: TabType) => void;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange }) => {
    {console.log('working')}
    return (
        <div className="border-b border-border bg-card">
            <div className="flex">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onTabChange(tab.id)}
                        className={cn(
                            "flex-1 flex items-center justify-center space-x-2 px-4 py-3 text-sm font-medium transition-colors relative",
                            "hover:text-foreground hover:bg-muted/50",
                            activeTab === tab.id
                                ? "text-foreground bg-background border-b-2 border-primary"
                                : "text-muted-foreground bg-transparent"
                        )}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>

                        {/* Active tab indicator */}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                                initial={false}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30
                                }}
                            />
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default Tabs;