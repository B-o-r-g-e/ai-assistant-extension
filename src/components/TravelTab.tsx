import React, { useState, useRef, useEffect } from 'react';
import { Plane, Upload, Globe, Image as ImageIcon, Loader2, X } from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import OutputBox from './OutputBox';

const TravelTab: React.FC = () => {
    const [textInput, setTextInput] = useState('');
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Check API availability on mount
    useEffect(() => {
        checkAPIAvailability();
    }, []);

    const checkAPIAvailability = async () => {
        try {
            if (window.ai?.languageModel) {
                const capabilities = await window.ai.languageModel.capabilities();
                setApiAvailable(capabilities.available === 'readily' || capabilities.available === 'after-download');
            } else if (window.ai?.translator) {
                const capabilities = await window.ai.translator.capabilities();
                setApiAvailable(capabilities.available === 'readily' || capabilities.available === 'after-download');
            } else {
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

            // Create preview
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

    // Translate text using Language Model
    const handleTranslateText = async () => {
        if (!textInput.trim() && !selectedImage) return;

        setIsLoading(true);
        setCurrentAction('Translating to English');
        setOutput('');

        try {
            let textToTranslate = textInput;

            // If there's an image, inform user we need text extracted first
            if (selectedImage && !textInput.trim()) {
                setOutput('📸 **Note**: Please add the text you want to translate in the text box. Image OCR is not yet supported in this version.');
                setIsLoading(false);
                setCurrentAction('');
                return;
            }

            // Try the Translator API first (if available)
            if (window.ai?.translator) {
                console.log('Using Translator API');

                const translator = await window.ai.translator.create({
                    sourceLanguage: 'auto', // Auto-detect source language
                    targetLanguage: 'en',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await translator.translate(textToTranslate);
                setOutput(`🌍 **Translation to English:**\n\n${result}`);

            } else if (window.ai?.languageModel) {
                // Fallback to Language Model
                console.log('Using Language Model API for translation');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional translator. Translate text to English accurately while preserving the original meaning and context.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const prompt = `Translate the following text to English:\n\n${textToTranslate}`;
                const result = await session.prompt(prompt);
                setOutput(`🌍 **Translation to English:**\n\n${result}`);

            } else {
                // Demo mode
                setOutput(`🌍 **Translation to English** (Demo Mode):\n\n**Original Text:**\n"${textToTranslate.substring(0, 100)}${textToTranslate.length > 100 ? '...' : ''}"\n\n**Translated text would appear here with Chrome AI enabled.**\n\nEnable AI at chrome://flags/#prompt-api-for-gemini-nano`);
            }
        } catch (error: any) {
            console.error('Translation failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to translate text.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Generate explanation from image/text using Language Model
    const handleExplainContent = async () => {
        if (!textInput.trim() && !selectedImage) return;

        setIsLoading(true);
        setCurrentAction('Analyzing content');
        setOutput('');

        try {
            let prompt = '';

            if (selectedImage && textInput) {
                prompt = `I have an image (${selectedImage.name}) and this text: "${textInput}". Please provide helpful travel information, cultural context, and explanations about this content.`;
            } else if (selectedImage) {
                prompt = `I have an image of what appears to be a travel-related item (${selectedImage.name}). Please provide general travel tips and advice for dealing with menus, signs, and documents in foreign countries.`;
            } else {
                prompt = `Provide helpful travel information and cultural context about: ${textInput}`;
            }

            if (window.ai?.languageModel) {
                console.log('Using Language Model API for content explanation');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a knowledgeable travel assistant. Provide helpful information about locations, cultural context, travel tips, and practical advice.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const result = await session.prompt(prompt);
                setOutput(`🧭 **Travel Insights:**\n\n${result}`);

            } else {
                // Demo mode
                setOutput(`🧭 **Content Analysis** (Demo Mode):\n\n${selectedImage ? '📸 **Image provided:** ' + selectedImage.name + '\n\n' : ''}**Text Analysis:**\n"${textInput || 'No text provided'}"\n\n**Detailed travel insights would appear here with Chrome AI enabled.**\n\nEnable AI at chrome://flags/#prompt-api-for-gemini-nano`);
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

            {/* Image Upload Section */}
            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Upload Image (Optional)
                    </label>
                    <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                        {imagePreview ? (
                            <div className="space-y-3">
                                <div className="relative inline-block">
                                    <img
                                        src={imagePreview}
                                        alt="Preview"
                                        className="max-h-32 rounded-lg shadow-sm"
                                    />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/80"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {selectedImage?.name}
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                <ImageIcon className="w-8 h-8 text-muted-foreground mx-auto" />
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">
                                        Upload a menu, sign, or any travel-related image
                                    </p>
                                    <Button
                                        onClick={() => fileInputRef.current?.click()}
                                        variant="outline"
                                        size="sm"
                                    >
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

                {/* Text Input Section */}
                <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Text to Translate or Context
                    </label>
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