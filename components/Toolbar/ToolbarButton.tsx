// components/form/toolbar.tsx
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Plus,
    Minus,
    Save,
    Upload,
    Undo,
    Redo,
    Grid
} from 'lucide-react';

export interface ToolbarProps {
    onFormatText: (format: string) => void;
    onAddPage: () => void;
    onRemovePage: () => void;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onLoad: () => void;
    onToggleGrid: () => void;
    currentPage: number;
    totalPages: number;
    canUndo: boolean;
    canRedo: boolean;
    isGridEnabled: boolean;
    activeFormats: Set<string>;
}

export const Toolbar: React.FC<ToolbarProps> = ({
                                                    onFormatText,
                                                    onAddPage,
                                                    onRemovePage,
                                                    onUndo,
                                                    onRedo,
                                                    onSave,
                                                    onLoad,
                                                    onToggleGrid,
                                                    currentPage,
                                                    totalPages,
                                                    canUndo,
                                                    canRedo,
                                                    isGridEnabled,
                                                    activeFormats
                                                }) => {
    return (
        <div className="flex items-center gap-2 h-12 px-4 bg-white border-b">
            <div className="flex items-center gap-1 border-r pr-2">
                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                    <Undo size={16} />
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                    <Redo size={16} />
                </button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2">
                <button
                    onClick={() => onFormatText('bold')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${activeFormats.has('bold') ? 'bg-blue-100' : ''}`}
                >
                    <Bold size={16} />
                </button>
                <button
                    onClick={() => onFormatText('italic')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${activeFormats.has('italic') ? 'bg-blue-100' : ''}`}
                >
                    <Italic size={16} />
                </button>
                <button
                    onClick={() => onFormatText('underline')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${activeFormats.has('underline') ? 'bg-blue-100' : ''}`}
                >
                    <Underline size={16} />
                </button>
            </div>

            <div className="flex items-center gap-1 border-r pr-2">
                <button
                    onClick={() => onFormatText('alignLeft')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${activeFormats.has('alignLeft') ? 'bg-blue-100' : ''}`}
                >
                    <AlignLeft size={16} />
                </button>
                <button
                    onClick={() => onFormatText('alignCenter')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${activeFormats.has('alignCenter') ? 'bg-blue-100' : ''}`}
                >
                    <AlignCenter size={16} />
                </button>
                <button
                    onClick={() => onFormatText('alignRight')}
                    className={`p-1.5 rounded hover:bg-gray-100 ${activeFormats.has('alignRight') ? 'bg-blue-100' : ''}`}
                >
                    <AlignRight size={16} />
                </button>
            </div>

            <div className="flex items-center gap-2 border-r pr-2">
                <button
                    onClick={onAddPage}
                    className="p-1.5 rounded hover:bg-gray-100"
                >
                    <Plus size={16} />
                </button>
                <button
                    onClick={onRemovePage}
                    disabled={totalPages <= 1}
                    className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
                >
                    <Minus size={16} />
                </button>
                <span className="text-sm text-gray-600">
                    Page {currentPage} of {totalPages}
                </span>
            </div>

            <div className="flex items-center gap-1">
                <button
                    onClick={onToggleGrid}
                    className={`p-1.5 rounded hover:bg-gray-100 ${isGridEnabled ? 'bg-blue-100' : ''}`}
                >
                    <Grid size={16} />
                </button>
                <button
                    onClick={onSave}
                    className="p-1.5 rounded hover:bg-gray-100"
                >
                    <Save size={16} />
                </button>
                <button
                    onClick={onLoad}
                    className="p-1.5 rounded hover:bg-gray-100"
                >
                    <Upload size={16} />
                </button>
            </div>
        </div>
    );
};