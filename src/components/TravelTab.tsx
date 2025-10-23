import React, { useState, useRef, useEffect } from 'react';
import { Plane, Upload, Globe, Image as ImageIcon, Loader2, X, Trash2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import OutputBox from './OutputBox';
import { usePersistedState, clearPersistedState } from '../hooks/usePersistedState';

interface TravelTabProps {
    initialText?: string;
    contextAction?: string;
    onActionProcessed?: () => void;
}

const TravelTab: React.FC<TravelTabProps> = ({ initialText = '', contextAction = '', onActionProcessed }) => {
    const [textInput, setTextInput] = usePersistedState('travel_input', initialText);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [output, setOutput] = usePersistedState('travel_output', '');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
    const [triggerAction, setTriggerAction] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check API availability on mount
    useEffect(() => {
        checkAPIAvailability();
    }, []);

    // Auto-run action if context menu was used
    useEffect(() => {
        if (initialText && contextAction) {
            setTextInput(initialText);
            setTriggerAction(contextAction);
        }
    }, [initialText, contextAction]);

    // Execute action when triggered
    useEffect(() => {
        if (triggerAction && textInput) {
            if (triggerAction === 'translate') {
                handleTranslateText();
            } else if (triggerAction === 'travel-insights') {
                handleExplainContent();
            }
            setTriggerAction(null);
        }
    }, [triggerAction, textInput]);

    // Listen for new context menu selections
    useEffect(() => {
        const handleStorageChange = (changes: any, area: string) => {
            if (area === 'local' && changes.selectedText && changes.targetTab?.newValue === 'travel') {
                const newText = changes.selectedText.newValue;
                const newAction = changes.action?.newValue;

                if (newText && newAction) {
                    setTextInput(newText);
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
        setTextInput('');
        setOutput('');
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        clearPersistedState(['travel_input', 'travel_output']);
    };

    const checkAPIAvailability = async () => {
        try {
            if (typeof LanguageModel !== 'undefined') {
                const availability = await LanguageModel.availability();
                console.log('LanguageModel availability:', availability);
                setApiAvailable(availability === 'readily' || availability === 'after-download');
            } else if (typeof Translator !== 'undefined') {
                console.log('Translator API found');
                setApiAvailable(true);
            } else if (window.ai?.languageModel) {
                const capabilities = await window.ai.languageModel.capabilities();
                setApiAvailable(capabilities.available === 'readily' || capabilities.available === 'after-download');
            } else {
                console.log('No translation APIs found');
                setApiAvailable(false);
            }
        } catch (error) {
            console.error('API check failed:', error);
            setApiAvailable(false);
        }
    };

    // Handle image file selection
    const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedImage(file);

            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    // Remove selected image
    const handleRemoveImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Translate text
    const handleTranslateText = async () => {
        if (!textInput.trim() && !selectedImage) return;

        setIsLoading(true);
        setCurrentAction('Translating to English');
        setOutput('');

        try {
            if (selectedImage && !textInput.trim()) {
                setOutput('📸 **Note**: Please add the text you want to translate in the text box. Image OCR is not yet supported.');
                setIsLoading(false);
                setCurrentAction('');
                return;
            }

            const textToTranslate = textInput;

            // Try LanguageModel first (best for auto-detection)
            if (typeof LanguageModel !== 'undefined') {
                console.log('Using LanguageModel API for translation');

                const availability = await LanguageModel.availability();
                if (availability === 'no') {
                    throw new Error('LanguageModel not available');
                }

                const session = await LanguageModel.create({
                    initialPrompts: [
                        {
                            role: 'system',
                            content: 'You are a professional translator. Translate any text to English accurately. Only output the translation, nothing else.'
                        }
                    ],
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(textToTranslate);
                setOutput(`🌍 **Translation to English:**\n\n**Original:**\n"${textToTranslate}"\n\n**Translated:**\n"${result.trim()}"`);
                session.destroy();

            } else if (window.ai?.languageModel) {
                console.log('Using window.ai.languageModel for translation');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional translator. Translate to English accurately.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(`Translate to English:\n\n${textToTranslate}`);
                setOutput(`🌍 **Translation to English:**\n\n**Original:**\n"${textToTranslate}"\n\n**Translated:**\n"${result.trim()}"`);

            } else {
                setOutput(`🌍 **Translation** (Demo Mode):\n\n**Original:**\n"${textToTranslate.substring(0, 100)}${textToTranslate.length > 100 ? '...' : ''}"\n\n**Enable Chrome AI:**\n1. chrome://flags/#prompt-api-for-gemini-nano\n2. chrome://components/ - Download model\n3. Restart Chrome`);
            }
        } catch (error: any) {
            console.error('Translation failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to translate text.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Get travel insights
    const handleExplainContent = async () => {
        if (!textInput.trim() && !selectedImage) return;

        setIsLoading(true);
        setCurrentAction('Analyzing content');
        setOutput('');

        try {
            let prompt = '';

            if (selectedImage && textInput) {
                prompt = `I have an image (${selectedImage.name}) and this text: "${textInput}". Provide helpful travel information, cultural context, and explanations.`;
            } else if (selectedImage) {
                prompt = `I have an image (${selectedImage.name}). Provide general travel tips for dealing with menus, signs, and documents in foreign countries.`;
            } else {
                prompt = `Provide helpful travel information and cultural context about: ${textInput}`;
            }

            if (typeof LanguageModel !== 'undefined') {
                console.log('Using LanguageModel API for travel insights');

                const availability = await LanguageModel.availability();
                if (availability === 'no') {
                    throw new Error('LanguageModel not available');
                }

                const session = await LanguageModel.create({
                    initialPrompts: [
                        {
                            role: 'system',
                            content: 'You are a knowledgeable travel assistant. Provide helpful information about locations, cultural context, travel tips, and practical advice.'
                        }
                    ],
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(prompt);
                setOutput(`🧭 **Travel Insights:**\n\n${result}`);
                session.destroy();

            } else if (window.ai?.languageModel) {
                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a knowledgeable travel assistant.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(prompt);
                setOutput(`🧭 **Travel Insights:**\n\n${result}`);

            } else {
                setOutput(`🧭 **Travel Insights** (Demo Mode):\n\n${selectedImage ? '📸 Image: ' + selectedImage.name + '\n\n' : ''}**Text:** "${textInput || 'None'}"\n\n**Enable Chrome AI for real insights.**`);
            }
        } catch (error: any) {
            console.error('Content analysis failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to analyze content.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
            {/* Header */}
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Plane className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Travel Mode</h2>
                    <p className="text-sm text-muted-foreground">
                        Translate text and get travel assistance
                    </p>
                </div>
            </div>

            {/* API Status */}
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

            {/* Image Upload */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Upload Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        {imagePreview ? (
                            <div className="space-y-3">
                                <div className="relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="max-h-32 rounded-lg shadow-sm" />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground">{selectedImage?.name}</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Upload a menu, sign, or travel-related image
                                    </p>
                                    <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm">
                                        <Upload className="w-4 h-4 mr-2" />
                                        Choose Image
                                    </Button>
                                </div>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleImageSelect}
                            className="hidden"
                        />
                    </div>
                </div>

                {/* Text Input */}
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-medium text-foreground">
                            Text to Translate or Context
                        </label>
                        {(textInput || output || selectedImage) && (
                            <Button
                                onClick={handleClear}
                                variant="ghost"
                                size="sm"
                                className="h-7 text-xs"
                            >
                                <Trash2 className="w-3 h-3 mr-1" />
                                Clear All
                            </Button>
                        )}
                    </div>
                    <Textarea
                        placeholder="Enter text in any language, or provide context about your travel needs..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3">
                    <Button
                        onClick={handleTranslateText}
                        disabled={!textInput.trim() || isLoading}
                        className="w-full"
                        variant="default"
                    >
                        {isLoading && currentAction.includes('Translating') ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <Globe className="w-4 h-4 mr-2" />
                        )}
                        Translate to English
                    </Button>

                    <Button
                        onClick={handleExplainContent}
                        disabled={(!textInput.trim() && !selectedImage) || isLoading}
                        variant="outline"
                        className="w-full"
                    >
                        {isLoading && currentAction.includes('Analyzing') ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <ImageIcon className="w-4 h-4 mr-2" />
                        )}
                        Get Travel Insights
                    </Button>
                </div>
            </div>

            {/* Output */}
            {(output || isLoading) && (
                <OutputBox
                    content={output}
                    isLoading={isLoading}
                    loadingText={currentAction ? `${currentAction}...` : 'Processing...'}
                />
            )}

            {/* Tips */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <h3 className="font-medium text-sm">✈️ Travel Tips</h3>
                <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Enter text in any language to translate to English</li>
                    <li>• Upload images for visual reference (OCR coming soon)</li>
                    <li>• Get cultural context and travel advice</li>
                    <li>• First use may take time to download the AI model</li>
                </ul>
            </div>
        </div>
    );
};

export default TravelTab;