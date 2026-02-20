import React, { useMemo } from 'react';
import ArrayVisualizer from './ArrayVisualizer';
import MatrixVisualizer from './MatrixVisualizer';
import LinkedListVisualizer from './LinkedListVisualizer';
import TreeVisualizer from './TreeVisualizer';
import DictVisualizer from './DictVisualizer';
import SetVisualizer from './SetVisualizer';
import StringVisualizer from './StringVisualizer';
import { Star } from 'lucide-react';

interface VisualizationRouterProps {
    arrays: { [key: string]: any[] };
    matrices: { [key: string]: any[][] };
    strings: { [key: string]: string };
    dicts: { [key: string]: Record<string, any> };
    sets: { [key: string]: any[] };
    linkedListNodes: { [id: string]: { id: string, val: any, next: string | null } };
    linkedListPointers: { [key: string]: string };
    treeNodes: { [id: string]: { id: string, val: any, left: string | null, right: string | null } };
    treePointers: { [key: string]: string };
    pointers: { [key: string]: number };
    focusedObjectId: string | null;
    setFocusedObjectId: (id: string | null) => void;
    watchlist: Set<string>;
    toggleWatchlist: (id: string, e: React.MouseEvent) => void;
}

// Helper types for the sorted list
type VisType = 'array' | 'matrix' | 'string' | 'dict' | 'set' | 'linked_list' | 'tree';

interface VisItem {
    name: string;
    type: VisType;
    data: any;
}

const VisualizationRouter: React.FC<VisualizationRouterProps> = ({
    arrays,
    matrices,
    strings,
    dicts,
    sets,
    linkedListNodes,
    linkedListPointers,
    treeNodes,
    treePointers,
    pointers,
    focusedObjectId,
    setFocusedObjectId,
    watchlist,
    toggleWatchlist
}) => {
    // Collect and sort all visualizable top-level variables alphabetically by name
    const sortedItems = useMemo(() => {
        const items: VisItem[] = [];

        Object.entries(arrays).forEach(([name, data]) => items.push({ name, type: 'array', data }));
        Object.entries(matrices).forEach(([name, data]) => items.push({ name, type: 'matrix', data }));
        Object.entries(strings).forEach(([name, data]) => items.push({ name, type: 'string', data }));
        Object.entries(dicts || {}).forEach(([name, data]) => items.push({ name, type: 'dict', data }));
        Object.entries(sets || {}).forEach(([name, data]) => items.push({ name, type: 'set', data }));

        // Linked Lists and Trees are handled a bit differently since they don't have a single "entry point" variable in our current state yet, 
        // they are collections of nodes. We will render them if they exist as a whole block.
        // For strict alphabetical sorting *with* them, we would need to map the head pointers (e.g. `head`, `root`) 
        // to the node structures. For now, we'll prefix them so they appear at the top or bottom, or just append them.

        // Sort the standard variables alphabetically
        items.sort((a, b) => a.name.localeCompare(b.name));
        return items;
    }, [arrays, matrices, strings, dicts, sets]);

    const hasNodes = Object.keys(linkedListNodes || {}).length > 0;
    const hasTrees = Object.keys(treeNodes || {}).length > 0;

    // Helper for rendering wrapped items
    const renderWrapped = (id: string, child: React.ReactNode) => {
        const isFocused = focusedObjectId === id;
        const isDimmed = focusedObjectId !== null && focusedObjectId !== id;
        const isWatched = watchlist.has(id);

        return (
            <div
                key={`wrapper-${id}`}
                onClick={(e) => {
                    e.stopPropagation();
                    setFocusedObjectId(isFocused ? null : id);
                }}
                className={`
                    relative p-4 rounded-xl transition-all duration-300 cursor-pointer
                    ${isFocused ? 'scale-[1.02] z-elevated bg-bg-secondary/50 shadow-lg ring-1 ring-border-hover' : 'hover:bg-bg-secondary/30'}
                    ${isDimmed ? 'opacity-30 blur-[1px] hover:opacity-60' : 'opacity-100'}
                    ${isWatched ? 'ring-2 ring-accent-warning bg-bg-secondary/20' : ''}
                `}
            >
                {/* Watchlist Toggle Button */}
                <button
                    onClick={(e) => toggleWatchlist(id, e)}
                    className={`absolute top-4 right-4 p-1.5 rounded-md transition-colors ${isWatched
                        ? 'text-accent-warning bg-accent-warning/10 hover:bg-accent-warning/20'
                        : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary opacity-0 group-hover:opacity-100'
                        }`}
                    title={isWatched ? "Remove from watchlist" : "Add to watchlist"}
                >
                    <Star size={16} fill={isWatched ? "currentColor" : "none"} />
                </button>

                {/* Add a subtle group hover for the un-watched star to appear */}
                <div className="group relative w-full h-full">
                    {child}
                </div>
            </div>
        );
    };

    return (
        <React.Fragment>
            {/* Render Graph/Node structures first */}
            {hasNodes && renderWrapped(
                'graph-linked-list',
                <LinkedListVisualizer
                    nodes={linkedListNodes}
                    pointers={linkedListPointers}
                />
            )}

            {hasTrees && renderWrapped(
                'graph-tree',
                <TreeVisualizer
                    nodes={treeNodes}
                    pointers={treePointers}
                />
            )}

            {/* Render standard variables sorted alphabetically */}
            {sortedItems.map((item) => {
                let visualizer = null;
                switch (item.type) {
                    case 'array':
                        visualizer = (
                            <ArrayVisualizer
                                name={item.name}
                                data={item.data}
                                pointers={pointers}
                            />
                        );
                        break;
                    case 'matrix':
                        visualizer = (
                            <MatrixVisualizer
                                name={item.name}
                                data={item.data}
                                pointers={pointers}
                            />
                        );
                        break;
                    case 'string':
                        visualizer = (
                            <StringVisualizer
                                name={item.name}
                                data={item.data}
                                pointers={pointers}
                            />
                        );
                        break;
                    case 'dict':
                        visualizer = (
                            <DictVisualizer
                                name={item.name}
                                data={item.data}
                            />
                        );
                        break;
                    case 'set':
                        visualizer = (
                            <SetVisualizer
                                name={item.name}
                                data={item.data}
                            />
                        );
                        break;
                    default:
                        return null;
                }

                return renderWrapped(`${item.type}-${item.name}`, visualizer);
            })}
        </React.Fragment>
    );
};

export default VisualizationRouter;
