import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, RefreshCw, Target, Loader2, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import OutputBox from './OutputBox';
import { usePersistedState, clearPersistedState } from '../hooks/usePersistedState';

interface CareerTabProps {
    initialText?: string;
    contextAction?: string;
    onActionProcessed?: () => void;
}

const CareerTab: React.FC<CareerTabProps> = ({ initialText = '', contextAction = '', onActionProcessed }) => {
    const [jobDescription, setJobDescription] = usePersistedState('career_input', initialText);
    const [output, setOutput] = usePersistedState('career_output', '');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
    const [triggerAction, setTriggerAction] = useState<string | null>(null);

    // Check API availability on mount
    useEffect(() => {
        checkAPIAvailability();
    }, []);

    // Auto-run action if context menu was used
    useEffect(() => {
        if (initialText && contextAction) {
            setJobDescription(initialText);
            setTriggerAction(contextAction);
        }
    }, [initialText, contextAction]);

    // Execute action when triggered
    useEffect(() => {
        if (triggerAction && jobDescription) {
            if (triggerAction === 'generate-cover-letter') {
                handleGenerateCoverLetter();
            } else if (triggerAction === 'rephrase') {
                handleRephraseParagraph();
            } else if (triggerAction === 'extract-skills') {
                handleExtractSkills();
            }
            setTriggerAction(null);
        }
    }, [triggerAction, jobDescription]);

    // Listen for new context menu selections
    useEffect(() => {
        const handleStorageChange = (changes: any, area: string) => {
            if (area === 'local' && changes.selectedText && changes.targetTab?.newValue === 'career') {
                const newText = changes.selectedText.newValue;
                const newAction = changes.action?.newValue;

                if (newText && newAction) {
                    setJobDescription(newText);
                    setTriggerAction(newAction);
                }
            }
        };

        if (typeof chrome !== 'undefined' && chrome.storage) {
            chrome.storage.onChanged.addListener(handleStorageChange);
            return () => {
                chrome.storage.onChanged.removeListener(handleStorageChange);
            };
        }
    }, []);

    // Clear all data
    const handleClear = () => {
        setJobDescription('');
        setOutput('');
        clearPersistedState(['career_input', 'career_output']);
    };

    const checkAPIAvailability = async () => {
        try {
            // Check for the global LanguageModel API (Prompt API)
            if (typeof LanguageModel !== 'undefined') {
                const availability = await LanguageModel.availability();
                console.log('LanguageModel availability:', availability);
                setApiAvailable(availability === 'readily' || availability === 'after-download');
            } else if (window.ai?.languageModel) {
                const capabilities = await window.ai.languageModel.capabilities();
                console.log('Language Model capabilities:', capabilities);
                setApiAvailable(capabilities.available === 'readily' || capabilities.available === 'after-download');
            } else {
                console.log('LanguageModel API not found');
                setApiAvailable(false);
            }
        } catch (error) {
            console.error('API check failed:', error);
            setApiAvailable(false);
        }
    };

    // Generate cover letter using LanguageModel API (Prompt API)
    const handleGenerateCoverLetter = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Generating cover letter');
        setOutput('');

        try {
            // Try the global LanguageModel API first (Chrome 138+)
            if (typeof LanguageModel !== 'undefined') {
                console.log('Using LanguageModel API (Prompt API)');

                const availability = await LanguageModel.availability();

                if (availability === 'no') {
                    setOutput('❌ **Error**: LanguageModel API is not available. Enable chrome://flags/#prompt-api-for-gemini-nano');
                    setIsLoading(false);
                    return;
                }

                // Create a session with initial system prompt
                const session = await LanguageModel.create({
                    initialPrompts: [
                        {
                            role: 'system',
                            content: 'You are a professional career advisor and expert cover letter writer. Create compelling, personalized cover letters that highlight relevant skills and demonstrate genuine interest in the role.'
                        }
                    ],
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            console.log(`Downloading model: ${e.loaded}% complete`);
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                // Generate the cover letter
                const prompt = `Write a professional cover letter for this job posting:\n\n${jobDescription}\n\nMake it personalized, highlight relevant skills, show enthusiasm, and keep it concise (around 3-4 paragraphs).`;
                const result = await session.prompt(prompt);

                setOutput(`📄 **Generated Cover Letter:**\n\n${result}`);

                // Clean up the session
                session.destroy();

            } else if (window.ai?.languageModel) {
                // Fallback to window.ai.languageModel
                console.log('Using window.ai.languageModel');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional career advisor who writes compelling cover letters.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const prompt = `Write a professional cover letter for this job posting:\n\n${jobDescription}`;
                const result = await session.prompt(prompt);
                setOutput(`📄 **Generated Cover Letter:**\n\n${result}`);

            } else {
                // Demo mode
                setOutput(`📄 **Cover Letter** (Demo Mode):\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in the position described.\n\n**To use real AI generation:**\n1. Enable chrome://flags/#prompt-api-for-gemini-nano\n2. Go to chrome://components/ and download "Optimization Guide On Device Model"\n3. Restart Chrome\n\n**Your job description:**\n"${jobDescription.substring(0, 100)}${jobDescription.length > 100 ? '...' : ''}"`);
            }
        } catch (error: any) {
            console.error('Cover letter generation failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to generate cover letter.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Rephrase paragraph using LanguageModel
    const handleRephraseParagraph = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Rephrasing text');
        setOutput('');

        try {
            if (typeof LanguageModel !== 'undefined') {
                console.log('Using LanguageModel API for rephrasing');

                const availability = await LanguageModel.availability();

                if (availability === 'no') {
                    setOutput('❌ **Error**: LanguageModel API is not available.');
                    setIsLoading(false);
                    return;
                }

                const session = await LanguageModel.create({
                    initialPrompts: [
                        {
                            role: 'system',
                            content: 'You are a professional writing assistant. Rephrase text to be more professional, clear, and impactful while maintaining the original meaning.'
                        }
                    ],
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(`Please rephrase the following text in a more professional manner:\n\n${jobDescription}`);
                setOutput(`✏️ **Rephrased Text:**\n\n${result}`);

                session.destroy();

            } else if (window.ai?.languageModel) {
                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional writing assistant. Rephrase text to be more professional.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(`Rephrase this professionally:\n\n${jobDescription}`);
                setOutput(`✏️ **Rephrased Text:**\n\n${result}`);

            } else {
                setOutput(`✏️ **Rephrased Text** (Demo Mode):\n\n**Original:**\n"${jobDescription.substring(0, 150)}${jobDescription.length > 150 ? '...' : ''}"\n\n**Enable Chrome AI to see the rephrased version.**`);
            }
        } catch (error: any) {
            console.error('Rephrasing failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to rephrase text.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Extract skills summary using Summarizer or LanguageModel
    const handleExtractSkills = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Extracting skills');
        setOutput('');

        try {
            // Try Summarizer first for better skill extraction
            if (typeof Summarizer !== 'undefined') {
                console.log('Using Summarizer API for skills extraction');

                const availability = await Summarizer.availability();

                if (availability !== 'no') {
                    const summarizer = await Summarizer.create({
                        sharedContext: 'Extract key skills and requirements from this job posting',
                        type: 'key-points',
                        format: 'markdown',
                        length: 'medium',
                        monitor(m: any) {
                            m.addEventListener('downloadprogress', (e: any) => {
                                setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                            });
                        }
                    });

                    const summary = await summarizer.summarize(jobDescription, {
                        context: 'Focus on technical skills, soft skills, experience requirements, and qualifications'
                    });
                    setOutput(`🎯 **Skills Summary:**\n\n${summary}`);
                    setIsLoading(false);
                    setCurrentAction('');
                    return;
                }
            }

            // Fallback to LanguageModel
            if (typeof LanguageModel !== 'undefined') {
                console.log('Using LanguageModel API for skills extraction');

                const session = await LanguageModel.create({
                    initialPrompts: [
                        {
                            role: 'system',
                            content: 'You are an expert at analyzing job descriptions. Extract and categorize key skills, requirements, and qualifications in a clear, bulleted format.'
                        }
                    ],
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const prompt = `Analyze this job description and extract:\n- Technical skills required\n- Soft skills needed\n- Experience level\n- Key qualifications\n\nJob Description:\n${jobDescription}`;
                const result = await session.prompt(prompt);
                setOutput(`🎯 **Skills Summary:**\n\n${result}`);

                session.destroy();

            } else if (window.ai?.languageModel) {
                const session = await window.ai.languageModel.create({
                    systemPrompt: 'Extract and categorize skills from job descriptions.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(`Extract skills from:\n${jobDescription}`);
                setOutput(`🎯 **Skills Summary:**\n\n${result}`);

            } else {
                setOutput(`🎯 **Skills Summary** (Demo Mode):\n\n**Key Skills Required:**\n• Technical Skills\n• Communication Skills\n• Problem-solving\n\n**Enable Chrome AI for detailed analysis.**`);
            }
        } catch (error: any) {
            console.error('Skills extraction failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to extract skills.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <Briefcase className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Career Mode</h2>
                    <p className="text-sm text-muted-foreground">
                        Generate cover letters and analyze job opportunities
                    </p>
                </div>
            </div>

            {/* API Status Indicator */}
            {apiAvailable !== null && (
                <div className={`p-3 rounded-lg text-sm ${
                    apiAvailable
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'
                        : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                }`}>
                    {apiAvailable ? (
                        <span>✅ Chrome AI is available and ready</span>
                    ) : (
                        <span>⚠️ Chrome AI not available - using demo mode</span>
                    )}
                </div>
            )}

            {/* Input Section */}
            <div className="space-y-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-foreground">
                            Job Description
                        </label>
                        {(jobDescription || output) && (
                            <Button
                                onClick={handleClear}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear
                            </Button>
                        )}
                    </div>
                    <Textarea
                        placeholder="Paste the job description or requirements you want to work with..."
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3">
                    <Button
                        onClick={handleGenerateCoverLetter}
                        disabled={!jobDescription.trim() || isLoading}
                        className="w-full"
                        variant="default"
                    >
                        {isLoading && currentAction.includes('cover letter') ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <FileText className="w-4 h-4 mr-2" />
                        )}
                        Generate Cover Letter
                    </Button>

                    <div className="grid grid-cols-2 gap-3">
                        <Button
                            onClick={handleRephraseParagraph}
                            disabled={!jobDescription.trim() || isLoading}
                            variant="outline"
                        >
                            {isLoading && currentAction.includes('Rephrasing') ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <RefreshCw className="w-4 h-4 mr-2" />
                            )}
                            Rephrase
                        </Button>

                        <Button
                            onClick={handleExtractSkills}
                            disabled={!jobDescription.trim() || isLoading}
                            variant="outline"
                        >
                            {isLoading && currentAction.includes('Extracting') ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Target className="w-4 h-4 mr-2" />
                            )}
                            Extract Skills
                        </Button>
                    </div>
                </div>
            </div>

            {/* Output Section */}
            {(output || isLoading) && (
                <OutputBox
                    content={output}
                    isLoading={isLoading}
                    loadingText={currentAction ? `${currentAction}...` : 'Processing...'}
                />
            )}

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-sm">💼 Career Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Paste complete job postings for better cover letter generation</li>
                    <li>• Use "Rephrase" to make your own text more professional</li>
                    <li>• "Extract Skills" helps identify key requirements to highlight</li>
                    <li>• Always customize the generated content for your specific situation</li>
                </ul>
            </div>
        </div>
    );
};

export default CareerTab;