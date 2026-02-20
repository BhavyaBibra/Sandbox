import React from 'react';
import { Panel, Group, Separator } from 'react-resizable-panels';
import { GripVertical } from 'lucide-react';

interface SandboxLayoutProps {
    sidebar: React.ReactNode;
    mainContent: React.ReactNode;
}

const SandboxLayout: React.FC<SandboxLayoutProps> = ({ sidebar, mainContent }) => {
    return (
        <div className="h-screen w-screen bg-zinc-950 text-zinc-100 font-sans overflow-hidden flex flex-col">
            {/* Header (Minimal) */}
            <header className="h-12 border-b border-zinc-800 flex items-center px-4 bg-zinc-900/50 justify-between">
                <div className="flex items-center gap-4">
                    <span className="font-bold text-zinc-100 tracking-tight">Sandbox</span>
                    <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">v2.1</span>
                </div>
            </header>

            <div className="flex-1 overflow-hidden">
                <Group orientation="horizontal">
                    <Panel defaultSize={35} minSize={20} className="bg-zinc-900 flex flex-col">
                        {sidebar}
                    </Panel>

                    <Separator className="w-1 bg-zinc-800 hover:bg-indigo-500 transition-colors flex items-center justify-center cursor-col-resize z-elevated relative">
                        <div className="absolute top-1/2 -translate-y-1/2 z-dropdown">
                            <GripVertical size={12} className="text-zinc-500" />
                        </div>
                    </Separator>

                    <Panel defaultSize={65} minSize={30} className="bg-zinc-950 flex flex-col relative shadow-inner shadow-black/50">
                        {mainContent}
                    </Panel>
                </Group>
            </div>
        </div>
    );
};

export default SandboxLayout;
