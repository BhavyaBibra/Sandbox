import { Panel, Group, Separator } from 'react-resizable-panels';

interface WorkspaceLayoutProps {
    topBar: React.ReactNode;
    statusBar: React.ReactNode;
    timelineScrubber?: React.ReactNode;
    editorPane: React.ReactNode;
    visualizationPane: React.ReactNode;
    testCasesPane?: React.ReactNode;
    chatPanel?: React.ReactNode;
}

const WorkspaceLayout: React.FC<WorkspaceLayoutProps> = ({
    topBar,
    statusBar,
    editorPane,
    timelineScrubber,
    visualizationPane,
    testCasesPane,
    chatPanel
}) => {
    return (
        <div className="h-screen w-screen bg-bg-primary text-text-primary font-sans overflow-hidden flex flex-col">
            {/* Top Bar */}
            {topBar}

            {/* Timeline Scrubber */}
            {timelineScrubber}

            {/* Main Workspace (Split Pane) */}
            <div className="flex-1 overflow-hidden relative flex">
                <Group orientation="horizontal" id="main-group">
                    {/* Left Pane: Editor */}
                    <Panel
                        id="left-panel"
                        defaultSize={35}
                        minSize={10}
                        className="bg-bg-secondary border-r border-border-default flex flex-col transition-[flex-grow] duration-300 ease-in-out"
                    >
                        {editorPane}
                    </Panel>

                    {/* Divider Handle */}
                    <Separator className="w-1.5 bg-bg-primary hover:bg-accent-primary/50 transition-colors duration-200 flex items-center justify-center cursor-col-resize z-elevated -ml-[3px] -mr-[3px] relative outline-none focus:bg-accent-primary group">
                        <div className="h-8 w-1 rounded-full bg-border-hover group-hover:bg-accent-primary transition-all duration-300 group-hover:h-12 group-hover:w-1.5 shadow-sm" />
                    </Separator>

                    {/* Right Pane: Visualization & Test Cases */}
                    <Panel
                        id="right-panel"
                        defaultSize={65}
                        minSize={10}
                        className="bg-bg-canvas flex flex-col relative shadow-[inset_10px_0_20px_-10px_rgba(0,0,0,0.5)] transition-[flex-grow] duration-300 ease-in-out"
                    >
                        {testCasesPane ? (
                            <Group orientation="vertical">
                                <Panel defaultSize={80} minSize={20} className="flex flex-col relative">
                                    {visualizationPane}
                                </Panel>
                                <Separator className="h-1.5 bg-bg-primary hover:bg-accent-primary/50 transition-colors duration-200 flex items-center justify-center cursor-row-resize z-elevated -mt-[3px] -mb-[3px] relative outline-none focus:bg-accent-primary group">
                                    <div className="w-8 h-1 rounded-full bg-border-hover group-hover:bg-accent-primary transition-all duration-300 group-hover:w-12 group-hover:h-1.5 shadow-sm" />
                                </Separator>
                                <Panel defaultSize={20} minSize={5} collapsible={true} className="flex flex-col bg-bg-secondary relative border-t border-border-default">
                                    {testCasesPane}
                                </Panel>
                            </Group>
                        ) : (
                            visualizationPane
                        )}
                    </Panel>
                </Group>

                {/* Chat Panel Overlay */}
                {chatPanel}
            </div>

            {/* Status Bar */}
            {statusBar}
        </div>
    );
};

export default WorkspaceLayout;
