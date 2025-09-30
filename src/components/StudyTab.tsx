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

          const handleProofread = async () => {
              if (!inputText.trim()) return;

              setIsLoading(true);
              setCurrentAction('Proofreading');
              setOutput('');

              try {
                  if (typeof chrome !== 'undefined' && chrome.ai?.proofreader) {
                      const proofreader = await chrome.ai.proofreader.create();
                      const result = await proofreader.proofread(inputText);
                      setOutput(result.corrections);
                  } else {
                      setOutput(`✏️ **Proofread Results** (Demo Mode - Chrome AI not available):\n\nThis is a simulated proofreading of your text.`);
                  }
              } catch (error) {
                  console.error('Proofreading failed:', error);
                  setOutput('❌ **Error**: Unable to proofread text.');
              }

              setIsLoading(false);
              setCurrentAction('');
          };

          const handleSummarize = async () => {
              if (!inputText.trim()) return;

              setIsLoading(true);
              setCurrentAction('Summarizing');
              setOutput('');

              try {
                  if (typeof chrome !== 'undefined' && chrome.ai?.summarizer) {
                      const summarizer = await chrome.ai.summarizer.create();
                      const result = await summarizer.summarize(inputText);
                      setOutput(result.summary);
                  } else {
                      setOutput(`📝 **Summary** (Demo Mode - Chrome AI not available):\n\nThis is a simulated summary.`);
                  }
              } catch (error) {
                  console.error('Summarization failed:', error);
                  setOutput('❌ **Error**: Unable to summarize text.');
              }

              setIsLoading(false);
              setCurrentAction('');
          };

          useEffect(() => {
              if (initialText && contextAction) {
                  if (contextAction === 'summarize') {
                      handleSummarize();
                  } else if (contextAction === 'proofread') {
                      handleProofread();
                  }
              }
          }, [initialText, contextAction]);

          return (
              <div className="p-6 space-y-6 h-full overflow-y-auto">
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

                  <div className="space-y-4">
                      <div>
                          <label className="text-sm font-medium text-foreground mb-2 block">
                              Enter text to analyze
                          </label>
                          <Textarea
                              placeholder="Paste your study material..."
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              className="min-h-[120px] resize-none"
                          />
                      </div>

                      <div className="flex space-x-3">
                          <Button
                              onClick={handleSummarize}
                              disabled={!inputText.trim() || isLoading}
                              className="flex-1"
                              variant="default"
                          >
                              {isLoading && currentAction === 'Summarizing' ? (
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
                              {isLoading && currentAction === 'Proofreading' ? (
                                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                  <CheckCircle className="w-4 h-4 mr-2" />
                              )}
                              Proofread
                          </Button>
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
                      <h3 className="font-medium text-sm">💡 Study Tips</h3>
                      <ul className="text-xs text-muted-foreground space-y-1">
                          <li>• Use summarize for long articles or lecture notes</li>
                          <li>• Use proofread for essays and written assignments</li>
                          <li>• Right-click on any webpage to quickly analyze selected text</li>
                      </ul>
                  </div>
              </div>
          );
      };

      export default StudyTab;