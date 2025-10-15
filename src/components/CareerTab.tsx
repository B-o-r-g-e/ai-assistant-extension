import React, { useState, useEffect } from 'react';
import { Briefcase, FileText, RefreshCw, Target, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import OutputBox from './OutputBox';

const CareerTab: React.FC = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');
    const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);

    // Check API availability on mount
    useEffect(() => {
        checkAPIAvailability();
    }, []);

    const checkAPIAvailability = async () => {
        try {
            if (window.ai?.languageModel) {
                const capabilities = await window.ai.languageModel.capabilities();
                setApiAvailable(capabilities.available === 'readily' || capabilities.available === 'after-download');
            } else {
                setApiAvailable(false);
            }
        } catch (error) {
            console.error('API check failed:', error);
            setApiAvailable(false);
        }
    };

    // Generate cover letter using Language Model API
    const handleGenerateCoverLetter = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Generating cover letter');
        setOutput('');

        try {
            if (window.ai?.languageModel) {
                console.log('Using Language Model API for cover letter');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional career advisor who writes compelling cover letters. Create personalized, professional cover letters that highlight relevant skills and experience.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const prompt = `Write a professional cover letter for this job posting:\n\n${jobDescription}\n\nMake it personalized, highlight relevant skills, and express genuine interest in the role.`;
                const result = await session.prompt(prompt);
                setOutput(result);

            } else {
                // Demo mode
                setOutput(`📄 **Cover Letter** (Demo Mode):\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in the position described. Based on your job posting:\n\n"${jobDescription.substring(0, 100)}${jobDescription.length > 100 ? '...' : ''}"\n\nI believe my skills and experience make me an excellent candidate.\n\n**To use real AI generation:**\n1. Enable chrome://flags/#prompt-api-for-gemini-nano\n2. Download model from chrome://components/\n3. Restart Chrome\n\nBest regards,\n[Your Name]`);
            }
        } catch (error: any) {
            console.error('Cover letter generation failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to generate cover letter.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Rephrase paragraph using Language Model
    const handleRephraseParagraph = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Rephrasing text');
        setOutput('');

        try {
            if (window.ai?.languageModel) {
                console.log('Using Language Model API for rephrasing');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are a professional writing assistant. Rephrase text to be more professional, clear, and impactful while maintaining the original meaning.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const prompt = `Please rephrase the following text in a more professional manner:\n\n${jobDescription}`;
                const result = await session.prompt(prompt);
                setOutput(result);

            } else {
                // Demo mode
                setOutput(`✏️ **Rephrased Text** (Demo Mode):\n\n**Original:**\n"${jobDescription.substring(0, 150)}${jobDescription.length > 150 ? '...' : ''}"\n\n**Rephrased version would appear here with Chrome AI enabled.**\n\nEnable AI at chrome://flags/#prompt-api-for-gemini-nano`);
            }
        } catch (error: any) {
            console.error('Rephrasing failed:', error);
            setOutput(`❌ **Error**: ${error.message || 'Unable to rephrase text.'}`);
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    // Extract skills summary using Summarizer or Language Model
    const handleExtractSkills = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Extracting skills');
        setOutput('');

        try {
            // Try Summarizer first for better skill extraction
            if (typeof Summarizer !== 'undefined') {
                console.log('Using Summarizer API for skills extraction');

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

            } else if (window.ai?.languageModel) {
                console.log('Using Language Model API for skills extraction');

                const session = await window.ai.languageModel.create({
                    systemPrompt: 'You are an expert at analyzing job descriptions. Extract and categorize key skills, requirements, and qualifications.',
                    monitor(m: any) {
                        m.addEventListener('downloadprogress', (e: any) => {
                            setCurrentAction(`Downloading AI model: ${Math.round(e.loaded * 100)}%`);
                        });
                    }
                });

                const prompt = `Analyze this job description and extract:\n1. Technical skills required\n2. Soft skills needed\n3. Experience level\n4. Key qualifications\n\nJob Description:\n${jobDescription}`;
                const result = await session.prompt(prompt);
                setOutput(`🎯 **Skills Summary:**\n\n${result}`);

            } else {
                // Demo mode
                setOutput(`🎯 **Skills Summary** (Demo Mode):\n\n**Key Skills Required:**\n• Technical Skills\n• Communication Skills\n• Problem-solving\n• Team Collaboration\n\n**Experience Level:** Mid to Senior Level\n\n**Enable Chrome AI for detailed analysis:**\nchrome://flags/#prompt-api-for-gemini-nano`);
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
                    <label className="text-sm font-medium text-foreground mb-2 block">
                        Job Description
                    </label>
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