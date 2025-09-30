import React, { useState } from 'react';
import { Briefcase, FileText, RefreshCw, Target, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { Textarea } from './ui/Textarea';
import OutputBox from './OutputBox';

const CareerTab: React.FC = () => {
    const [jobDescription, setJobDescription] = useState('');
    const [output, setOutput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentAction, setCurrentAction] = useState<string>('');

    const handleGenerateCoverLetter = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Generating cover letter');
        setOutput('');

        try {
            const prompt = `Create a professional cover letter for this job posting: "${jobDescription}". Make it personalized, highlighting relevant skills and experience.`;

            if (typeof chrome !== 'undefined' && chrome.ai?.writer) {
                const writer = await chrome.ai.writer.create();
                const result = await writer.write(prompt);
                setOutput(result.output);
            } else {
                setOutput(`📄 **Cover Letter** (Demo Mode - Chrome AI not available):\n\nDear Hiring Manager,\n\nI am writing to express my strong interest in the position described in your job posting. Based on the requirements you've outlined, I believe my skills and experience make me an excellent candidate.\n\n**Key Qualifications:**\n• Relevant experience in the field\n• Strong communication and problem-solving skills\n• Passion for the industry and role\n\n**Why I'm Interested:**\nYour job posting mentions: "${jobDescription.substring(0, 100)}${jobDescription.length > 100 ? '...' : ''}"\n\nThis aligns perfectly with my career goals and expertise.\n\nI would welcome the opportunity to discuss how my background can contribute to your team's success.\n\nBest regards,\n[Your Name]`);
            }
        } catch (error) {
            console.error('Cover letter generation failed:', error);
            setOutput('❌ **Error**: Unable to generate cover letter. Make sure Chrome AI features are enabled.');
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    const handleRephraseParagraph = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Rephrasing text');
        setOutput('');

        try {
            if (typeof chrome !== 'undefined' && chrome.ai?.rewriter) {
                const rewriter = await chrome.ai.rewriter.create({ style: 'professional' });
                const result = await rewriter.rewrite(jobDescription);
                setOutput(result.output);
            } else {
                setOutput(`✏️ **Rephrased Text** (Demo Mode - Chrome AI not available):\n\nHere's a professionally rephrased version of your text:\n\n"${jobDescription}"\n\n**Rephrased Version:**\n\nThis is a simulated professional rephrase of your content. In a real Chrome environment with Gemini Nano enabled, this would provide an enhanced, more professional version of your text while maintaining the original meaning and context.`);
            }
        } catch (error) {
            console.error('Rephrasing failed:', error);
            setOutput('❌ **Error**: Unable to rephrase text. Make sure Chrome AI features are enabled.');
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    const handleExtractSkills = async () => {
        if (!jobDescription.trim()) return;

        setIsLoading(true);
        setCurrentAction('Extracting skills');
        setOutput('');

        try {
            const prompt = `Extract and summarize the key skills and requirements from this job posting: "${jobDescription}"`;

            if (typeof chrome !== 'undefined' && chrome.ai?.summarizer) {
                const summarizer = await chrome.ai.summarizer.create();
                const result = await summarizer.summarize(prompt);
                setOutput(result.summary);
            } else {
                const skillsExtracted = [
                    'Technical Skills', 'Communication Skills', 'Problem-solving',
                    'Team Collaboration', 'Project Management', 'Industry Knowledge'
                ];

                setOutput(`🎯 **Skills Summary** (Demo Mode - Chrome AI not available):\n\nBased on the job description:\n"${jobDescription.substring(0, 100)}${jobDescription.length > 100 ? '...' : ''}"\n\n**Key Skills Required:**\n${skillsExtracted.map(skill => `• ${skill}`).join('\n')}\n\n**Experience Level:** Mid to Senior Level\n**Education:** Bachelor's degree preferred\n**Soft Skills:** Leadership, adaptability, critical thinking\n\nThis analysis would be more detailed with Chrome's AI capabilities enabled.`);
            }
        } catch (error) {
            console.error('Skills extraction failed:', error);
            setOutput('❌ **Error**: Unable to extract skills. Make sure Chrome AI features are enabled.');
        }

        setIsLoading(false);
        setCurrentAction('');
    };

    return (
        <div className="p-6 space-y-6 h-full overflow-y-auto">
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

                <div className="grid grid-cols-1 gap-3">
                    <Button
                        onClick={handleGenerateCoverLetter}
                        disabled={!jobDescription.trim() || isLoading}
                        className="w-full"
                        variant="default"
                    >
                        {isLoading && currentAction === 'Generating cover letter' ? (
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
                            {isLoading && currentAction === 'Rephrasing text' ? (
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
                            {isLoading && currentAction === 'Extracting skills' ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Target className="w-4 h-4 mr-2" />
                            )}
                            Extract Skills
                        </Button>
                    </div>
                </div>
            </div>

            {(output || isLoading) && (
                <OutputBox
                    content={output}
                    isLoading={isLoading}
                    loadingText={currentAction ? `${currentAction}...` : 'Processing...'}
                />
            )}

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