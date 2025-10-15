import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import OutputBox from './OutputBox';

interface StudyTabProps {
    initialText?: string;
    contextAction?: string;
}

const StudyTab: React.FC<StudyTabProps> = ({ initialText = '', contextAction = '' }) => {
    const [inputText, setInputText] = useState(initialText);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

    // Check API availability on mount
    useEffect(() => {
        checkAPIAvailability();
    }, []);

    // Auto-run action if context menu was used
    useEffect(() => {
        if (initialText && contextAction) {
            if (contextAction === 'summarize') {
                handleSummarize();
            } else if (contextAction === 'proofread') {
                handleProofread();
            }
        }
    }, [initialText, contextAction]);

    const checkAPIAvailability = async () => {
        try {
            // Check for both Summarizer and Proofreader APIs
            const summarizerAvailable = typeof Summarizer !== 'undefined' ? await Summarizer.availability() : 'no';
            const proofreaderAvailable = typeof Proofreader !== 'undefined' ? await Proofreader.availability() : 'no';

            console.log('Summarizer availability:', summarizerAvailable);
            console.log('Proofreader availability:', proofreaderAvailable);

            const isAvailable = (summarizerAvailable === 'readily' || summarizerAvailable === 'after-download') ||
                (proofreaderAvailable === 'readily' || proofreaderAvailable === 'after-download');

            setApiAvailable(isAvailable || !!window.ai?.languageModel);
        } catch (error) {
            console.error('API check failed:', error);
            setApiAvailable(false);
        }
    };

    // Use the actual Summarizer API from Chrome 138+
    const handleSummarize = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setCurrentAction('Summarizing');
        setOutput('');

        try {
            // Try the actual Summarizer API first
            if (typeof Summarizer !== 'undefined') {
                console.log('Using Summarizer API');

                const availability = await Summarizer.availability();

                if (availability === 'no') {
                    setOutput('❌ **Error**: Summarizer API is not available on this device. Check hardware requirements.');
                    setIsLoading(false);
                    return;
                }

                // Create summarizer with options
                const summarizer = await Summarizer.create({
                    type: 'key-points',
                    format: 'markdown',
                    length: 'medium',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            console.log(`Downloading model: ${e.loaded}% complete`);
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                // Get the summary
                const summary = await summarizer.summarize(inputText);
                setOutput(summary);

            } else if (window.ai?.languageModel) {
                // Fallback to Language Model API
                console.log('Using Language Model API');
                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a helpful assistant that summarizes text into key points.'
                });

                const result = await session.prompt(`Please summarize the following text into key points:\n\n${inputText}`);
                setOutput(result);

            } else {
                // Demo mode
                setOutput(`📝 **Summary** (Demo Mode - Chrome AI not available):\n\nThis is a simulated summary. To use real AI:\n\n1. Use Chrome 138+ or Chrome Canary\n2. Go to chrome://flags and enable:\n   - #optimization-guide-on-device-model\n   - #prompt-api-for-gemini-nano\n3. Go to chrome://components/ and download "Optimization Guide On Device Model"\n4. Restart Chrome\n\n**Your text:** "${inputText.substring(0, 100)}${inputText.length > 100 ? '...' : ''}"`);
            }
        } catch (error: any) {
            console.error('Summarization failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to summarize text. Make sure Chrome AI features are enabled and the model is downloaded.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Proofread using the actual Proofreader API (Chrome 141+)
    const handleProofread = async () => {
        if (!inputText.trim()) return;

        setIsLoading(true);
        setCurrentAction('Proofreading');
        setOutput('');

        try {
            // Try the actual Proofreader API first
            if (typeof Proofreader !== 'undefined') {
                console.log('Using Proofreader API');

                const availability = await Proofreader.availability();

                if (availability === 'no') {
                    setOutput('❌ **Error**: Proofreader API is not available on this device. Try enabling chrome://flags/#proofreader-api-for-gemini-nano');
                    setIsLoading(false);
                    return;
                }

                // Create proofreader with options
                const proofreader = await Proofreader.create({
                    expectedInputLanguages: ['en'],
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            console.log(`Downloading model: ${e.loaded}% complete`);
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                // Get the proofreading result
                const proofreadResult = await proofreader.proofread(inputText);

                // Format the output with corrections
                let outputText = `✏️ **Proofread Results:**\n\n`;

                if (proofreadResult.corrections && proofreadResult.corrections.length > 0) {
                    outputText += `**Corrected Text:**\n${proofreadResult.corrected}\n\n`;
                    outputText += `**Corrections Found (${proofreadResult.corrections.length}):**\n\n`;

                    proofreadResult.corrections.forEach((correction: any, index: number) => {
                        const originalText = inputText.substring(correction.startIndex, correction.endIndex);
                        outputText += `${index + 1}. "${originalText}" → "${correction.replacement}"\n`;
                        if (correction.type) {
                            outputText += `   Type: ${correction.type}\n`;
                        }
                        if (correction.explanation) {
                            outputText += `   ${correction.explanation}\n`;
                        }
                        outputText += `\n`;
                    });
                } else {
                    outputText += `✅ **No corrections needed!**\n\nYour text looks good.`;
                }

                setOutput(outputText);

            } else if (window.ai?.languageModel) {
                // Fallback to Language Model
                console.log('Using Language Model for proofreading');

                const capabilities = await window.ai.languageModel.capabilities();

                if (capabilities.available === 'no') {
                    setOutput('❌ **Error**: Language Model is not available on this device.');
                    setIsLoading(false);
                    return;
                }

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional proofreader. Review the text for grammar, spelling, punctuation, and style issues. Provide corrections and suggestions.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            console.log(`Downloading model: ${e.loaded}% complete`);
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(`Please proofread the following text and provide corrections:\n\n${inputText}`);
                setOutput(result);

            } else {
                // Demo mode
                setOutput(`✏️ **Proofread Results** (Demo Mode - Chrome AI not available):\n\nThis is a simulated proofreading. To use real AI:\n\n1. Use Chrome 141+ or Chrome Canary\n2. Enable chrome://flags/#proofreader-api-for-gemini-nano\n3. Download the model from chrome://components/\n\n**Your text:** "${inputText.substring(0, 100)}${inputText.length > 100 ? '...' : ''}"\n\n**Suggestions:**\n• Check for proper punctuation\n• Consider sentence variety\n• Verify subject-verb agreement`);
            }
        } catch (error: any) {
            console.error('Proofreading failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to proofread text.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Study Mode</h2>
                    <p className="text-sm text-muted-foreground">
                        Summarize and proofread your study materials
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
                        <span>⚠️ Chrome AI not available - using demo mode. Enable at chrome://flags</span>
                    )}
                </div>
            )}

            {/* Input Section */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Enter text to analyze
                    </label>
                    <Textarea
                        placeholder="Paste your study material, notes, or any text you want to summarize or proofread..."
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="min-h-[120px] resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                    <Button
                        onClick={handleSummarize}
                        disabled={!inputText.trim() || isLoading}
                        className="flex-1"
                        variant="default"
                    >
                        {isLoading && currentAction.includes('Summarizing') ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <BookOpen className="w-4 h-4 mr-2" />
                        )}
                        Summarize
                    </Button>

                    <Button
                        onClick={handleProofread}
                        disabled={!inputText.trim() || isLoading}
                        className="flex-1"
                        variant="outline"
                    >
                        {isLoading && currentAction.includes('Proofreading') ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <CheckCircle className="w-4 h-4 mr-2" />
                        )}
                        Proofread
                    </Button>
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
                <h3 className="font-medium text-sm">💡 Study Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Use summarize for long articles or lecture notes</li>
                    <li>• Use proofread for essays and written assignments</li>
                    <li>• Make sure Chrome AI is enabled (see status above)</li>
                    <li>• First use may take time to download the AI model (~1-2GB)</li>
                </ul>
            </div>
        </div>
    );
};

export default StudyTab;