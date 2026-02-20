import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Bot, User, Sparkles } from 'lucide-react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import type { Insight } from '../hooks/useInsightEngine';

interface ChatPanelProps {
    isOpen: boolean;
    onClose: () => void;
    context: {
        code: string;
        currentLine?: number;
        locals: Record<string, any>;
        insights: Insight[];
        pattern?: string;
    };
}

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ isOpen, onClose, context }) => {
    const [messages, setMessages] = useState<Message[]>([
        { role: 'assistant', content: 'Hi! I am your AI coding assistant. Ask me anything about the current execution state, variables, or the algorithm itself.' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (text: string = input) => {
        if (!text.trim() || isLoading) return;

        const userMsg = { role: 'user' as const, content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try {
            // Package payload for /api/chat endpoint
            const payload = {
                message: text,
                code: context.code,
                snapshot: {
                    line: context.currentLine,
                    func_name: "<unknown>", // Not strictly available without tracing logic upfront
                    stack: [{
                        line: context.currentLine,
                        name: "<unknown>",
                        locals: context.locals
                    }]
                },
                annotations: context.insights.map(i => i.message)
            };

            const response = await axios.post('http://127.0.0.1:8000/api/chat', payload);

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: response.data.response
            }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: 'Sorry, I encountered an error connecting to the AI brain.'
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleQuickAction = (actionText: string) => {
        handleSend(actionText);
    };

    if (!isOpen) return null;

    return (
        <aside className="w-96 flex flex-col bg-bg-secondary border-l border-border-default h-full absolute right-0 top-0 z-panel shadow-2xl animate-in slide-in-from-right duration-300 pointer-events-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border-default bg-bg-primary">
                <div className="flex items-center gap-2">
                    <Sparkles size={18} className="text-accent-primary" />
                    <h3 className="font-semibold text-text-primary text-sm tracking-wide">AI Assistant</h3>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, i) => (
                    <div
                        key={i}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`p-1.5 rounded-full h-fit border shadow-sm ${msg.role === 'user'
                            ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary'
                            : 'bg-bg-tertiary border-border-subtle text-text-secondary'
                            }`}>
                            {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm leading-relaxed ${msg.role === 'user'
                            ? 'bg-accent-primary text-white rounded-tr-sm'
                            : 'bg-bg-tertiary border border-border-subtle text-text-primary rounded-tl-sm'
                            }`}>
                            {msg.role === 'assistant' ? (
                                <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-headings:my-2 prose-headings:text-text-primary prose-strong:text-text-primary prose-code:text-accent-primary prose-code:bg-bg-primary prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-pre:bg-bg-primary prose-pre:rounded-lg prose-pre:p-3 prose-li:my-0.5 prose-ul:my-1 prose-ol:my-1">
                                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                                </div>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="p-1.5 rounded-full h-fit border border-border-subtle bg-bg-tertiary text-text-secondary shadow-sm">
                            <Bot size={14} />
                        </div>
                        <div className="px-4 py-3 rounded-2xl bg-bg-tertiary border border-border-subtle rounded-tl-sm flex gap-1 items-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-1.5 h-1.5 rounded-full bg-text-muted animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-bg-primary border-t border-border-default space-y-3">

                {/* Quick Actions */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {['Explain this step', 'What are the variables?', 'Why did the pointer move?'].map(action => (
                        <button
                            key={action}
                            onClick={() => handleQuickAction(action)}
                            className="whitespace-nowrap px-3 py-1.5 text-xs font-medium rounded-full bg-bg-tertiary border border-border-subtle text-text-secondary hover:text-text-primary hover:border-border-default transition-colors flex-shrink-0"
                        >
                            {action}
                        </button>
                    ))}
                </div>

                <div className="relative">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                        placeholder="Ask about the execution..."
                        className="w-full bg-bg-tertiary border border-border-default rounded-xl pl-4 pr-12 py-3 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-primary focus:ring-1 focus:ring-accent-primary resize-none scrollbar-hide"
                        rows={1}
                        style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || isLoading}
                        className="absolute right-2 bottom-2 p-1.5 rounded-lg text-white bg-accent-primary hover:bg-accent-secondary disabled:opacity-50 disabled:hover:bg-accent-primary transition-colors"
                    >
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default ChatPanel;
