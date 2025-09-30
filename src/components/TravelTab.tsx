import React, { useState, useRef } from 'react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

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

    // Translate text using Chrome AI Translator API
    const handleTranslateText = async () => {
        if (!textInput.trim() && !selectedImage) return;

        setIsLoading(true);
        setCurrentAction('Translating to English');
        setOutput('');

        try {
            let textToTranslate = textInput;

            // If there's an image but no text, we'd need to extract text from image first
            if (selectedImage && !textInput.trim()) {
                // This would typically involve OCR, but for demo we'll simulate
                textToTranslate = "Text extracted from image (simulated)";
            }

            if (typeof chrome !== 'undefined' && chrome.ai?.translator) {
                const translator = await chrome.ai.translator.create({ targetLanguage: 'en' });
                const result = await translator.translate(textToTranslate);
                setOutput(result.translations);
            } else {
                // Fallback for development/testing
                setOutput(`🌍 **Translation to English** (Demo Mode - Chrome AI not available):\n\n**Original Text:**\n"${textToTranslate}"\n\n**Translated:**\nThis is a simulated translation to English. In a real Chrome environment with Gemini Nano enabled, this would provide accurate translations from various languages.\n\n**Detected Language:** Auto-detected\n**Confidence:** High\n\n${selectedImage ? '📸 **Note:** Translation includes text extracted from the uploaded image.' : ''}`);
            }
        } catch (error) {
            console.error('Translation failed:', error);
            setOutput('❌ **Error**: Unable to translate text. Make sure Chrome AI features are enabled.');
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Generate explanation from image/text using Chrome AI Prompt API
    const handleExplainContent = async () => {
        if (!textInput.trim() && !selectedImage) return;

        setIsLoading(true);
        setCurrentAction('Analyzing content');
        setOutput('');

        try {
            let prompt = '';
            let imageBlob: Blob | undefined = undefined;

            if (selectedImage) {
                prompt = `Explain what you see in this image and provide helpful travel information about it. ${textInput ? `Additional context: ${textInput}` : ''}`;
                imageBlob = selectedImage;
            } else {
                prompt = `Provide helpful travel information and explanation about: ${textInput}`;
            }

            if (typeof chrome !== 'undefined' && chrome.ai?.prompt) {
                const session = await chrome.ai.prompt.create({ multimodal: true });
                const result = await session.prompt({ text: prompt, image: imageBlob });
                setOutput(result.output);
            } else {
                // Fallback for development/testing
                setOutput(`🧭 **Content Analysis** (Demo Mode - Chrome AI not available):\n\n**Analysis:**\nThis is a simulated explanation of your content. In a real Chrome environment with Gemini Nano enabled, this would provide detailed insights about:\n\n${selectedImage ? '📸 **Image Analysis:**\n• Visual elements and landmarks\n• Cultural context and significance\n• Travel tips and recommendations\n\n' : ''}**Text Analysis:**\n"${textInput || 'No additional text provided'}"\n\n**Travel Insights:**\n• Location information\n• Cultural tips\n• Language assistance\n• Local recommendations\n\n**Helpful Suggestions:**\n• Best times to visit\n• What to expect\n• Cultural etiquette tips`);
            }
        } catch (error) {
            console.error('Content analysis failed:', error);
            setOutput('❌ **Error**: Unable to analyze content. Make sure Chrome AI features are enabled.');
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
                        Translate text and analyze images for travel assistance
                    </p>
                </div>
            </div>

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
                                        Upload a menu, sign, or any image with text
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
                        Text to Translate or Analyze (Optional)
                    </label>
                    <Textarea
                        placeholder="Enter text in any language, or provide additional context for your image..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        className="min-h-[100px] resize-none"
                    />
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 gap-3">
                    <Button
                        onClick={handleTranslateText}
                        disabled={(!textInput.trim() && !selectedImage) || isLoading}
                        className="w-full"
                        variant="default"
                    >
                        {isLoading && currentAction === 'Translating to English' ? (
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
                        {isLoading && currentAction === 'Analyzing content' ? (
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : (
                            <ImageIcon className="w-4 h-4 mr-2" />
                        )}
                        Explain Content
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
                    <li>• Upload photos of menus, signs, or documents to translate</li>
                    <li>• Add context text to get better explanations</li>
                    <li>• Works with multiple languages automatically</li>
                    <li>• Great for understanding local culture and customs</li>
                </ul>
            </div>
        </div>
    );
};

export default TravelTab;