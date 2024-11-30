// import {
//     Bold,
//     Italic,
//     Underline,
//     AlignLeft,
//     AlignCenter,
//     AlignRight,
//     Type,
//     Plus,
//     Minus,
//     Save,
//     Upload,
//     Undo,
//     Redo,
//     Grid, LucideProps
// } from 'lucide-react';
//
//
// interface ToolbarProps {
//     onFormatText: (format: string) => void;
//     onAddPage: () => void;
//     onRemovePage: () => void;
//     currentPage: number;
//     totalPages: number;
//     onUndo: () => void;
//     onRedo: () => void;
//     canUndo: boolean;
//     canRedo: boolean;
//     onToggleGrid: () => void;
//     isGridEnabled: boolean;
//     onSave: () => void;
//     onLoad: () => void;
//     activeFormats: Set<string>;
// }
//
// function ToolbarButton(props: {
//     icon: React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>,
//     onClick: () => void,
//     disabled: boolean,
//     tooltip: string
// }) {
//     return null;
// }
//
// const Toolbar: React.FC<ToolbarProps> = ({
//                                              onFormatText,
//                                              onAddPage,
//                                              onRemovePage,
//                                              currentPage,
//                                              totalPages,
//                                              onUndo,
//                                              onRedo,
//                                              canUndo,
//                                              canRedo,
//                                              onToggleGrid,
//                                              isGridEnabled,
//                                              onSave,
//                                              onLoad,
//                                              activeFormats
//                                          }) => {
//     return (
//         <div className="flex items-center gap-2 h-12 px-4 bg-white border-b">
//             {/* History Controls */}
//             <div className="flex items-center gap-1 border-r pr-2">
//                 <ToolbarButton
//                     icon={Undo}
//                     onClick={onUndo}
//                     disabled={!canUndo}
//                     tooltip="Undo"
//                 />
//                 <ToolbarButton
//                     icon={Redo}
//                     onClick={onRedo}
//                     disabled={!canRedo}
//                     tooltip="Redo"
//                 />
//             </div>
//
//             {/* Text Formatting */}
//             <div className="flex items-center gap-1 border-r pr-2">
//                 <ToolbarButton
//                     icon={Bold}
//                     isActive={true}
//                     onClick={() => onFormatText('bold')}
//                     tooltip="Bold"
//                 />
//                 <ToolbarButton
//                     icon={Italic}
//                     isActive={activeFormats.has('italic')}
//                     onClick={() => onFormatText('italic')}
//                     tooltip="Italic"
//                 />
//                 <ToolbarButton
//                     icon={Underline}
//                     isActive={activeFormats.has('underline')}
//                     onClick={() => onFormatText('underline')}
//                     tooltip="Underline"
//                 />
//             </div>
//
//             {/* Alignment */}
//             <div className="flex items-center gap-1 border-r pr-2">
//                 <ToolbarButton
//                     icon={AlignLeft}
//                     isActive={activeFormats.has('alignLeft')}
//                     onClick={() => onFormatText('alignLeft')}
//                     tooltip="Align Left"
//                 />
//                 <ToolbarButton
//                     icon={AlignCenter}
//                     isActive={activeFormats.has('alignCenter')}
//                     onClick={() => onFormatText('alignCenter')}
//                     tooltip="Align Center"
//                 />
//                 <ToolbarButton
//                     icon={AlignRight}
//                     isActive={activeFormats.has('alignRight')}
//                     onClick={() => onFormatText('alignRight')}
//                     tooltip="Align Right"
//                 />
//             </div>
//
//             {/* Page Controls */}
//             <div className="flex items-center gap-2 border-r pr-2">
//                 <ToolbarButton
//                     icon={Plus}
//                     onClick={onAddPage}
//                     tooltip="Add Page"
//                 />
//                 <ToolbarButton
//                     icon={Minus}
//                     onClick={onRemovePage}
//                     disabled={totalPages <= 1}
//                     tooltip="Remove Page"
//                 />
//                 <span className="text-sm text-gray-600">
//           Page {currentPage} of {totalPages}
//         </span>
//             </div>
//
//             {/* Grid and Save Controls */}
//             <div className="flex items-center gap-1">
//                 <ToolbarButton
//                     icon={Grid}
//                     isActive={isGridEnabled}
//                     onClick={onToggleGrid}
//                     tooltip="Toggle Grid"
//                 />
//                 <ToolbarButton
//                     icon={Save}
//                     onClick={onSave}
//                     tooltip="Save Layout"
//                 />
//                 <ToolbarButton
//                     icon={Upload}
//                     onClick={onLoad}
//                     tooltip="Load Layout"
//                 />
//             </div>
//         </div>
//     );
// };
//
// export default Toolbar

import React from 'react'

const Toolbar = () => {
    return (
        <div>Toolbar</div>
    )
}
export default Toolbar
