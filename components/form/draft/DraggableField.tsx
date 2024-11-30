// // components/DraggableField.tsx
// import React, { memo, useRef } from 'react';
// import { Trash2 } from 'lucide-react';
// import {FormField} from "@/types/types";
//
// interface DraggableFieldProps {
//     field: FormField;
//     onUpdate: (id: string, updates: Partial<FormField>) => void;
//     onDelete: (id: string) => void;
//     isSelected: boolean;
//     onSelect: (id: string) => void;
// }
//
// const DraggableField = memo(({
//                                  field,
//                                  onUpdate,
//                                  onDelete,
//                                  isSelected,
//                                  onSelect
//                              }: DraggableFieldProps) => {
//     const elementRef = useRef<HTMLDivElement>(null);
//     const dragStartPosRef = useRef({ x: 0, y: 0 });
//     const resizeStartRef = useRef({ width: 0, height: 0 });
//
//     const handleMouseDown = (e: React.MouseEvent) => {
//         e.preventDefault();
//         const rect = elementRef.current?.getBoundingClientRect();
//         if (!rect) return;
//
//         onSelect(field.id);
//         dragStartPosRef.current = {
//             x: e.clientX - rect.left,
//             y: e.clientY - rect.top
//         };
//
//         const handleMouseMove = (moveEvent: MouseEvent) => {
//             if (!elementRef.current?.parentElement) return;
//
//             const parentRect = elementRef.current.parentElement.getBoundingClientRect();
//             const newX = moveEvent.clientX - parentRect.left - dragStartPosRef.current.x;
//             const newY = moveEvent.clientY - parentRect.top - dragStartPosRef.current.y;
//
//             onUpdate(field.id, {
//                 x: Math.max(0, newX),
//                 y: Math.max(0, newY)
//             });
//         };
//
//         const handleMouseUp = () => {
//             document.removeEventListener('mousemove', handleMouseMove);
//             document.removeEventListener('mouseup', handleMouseUp);
//         };
//
//         document.addEventListener('mousemove', handleMouseMove);
//         document.addEventListener('mouseup', handleMouseUp);
//     };
//
//     const handleResizeStart = (e: React.MouseEvent, direction: string) => {
//         e.preventDefault();
//         e.stopPropagation();
//
//         resizeStartRef.current = {
//             width: field.width,
//             height: field.height
//         };
//
//         const startX = e.clientX;
//         const startY = e.clientY;
//
//         const handleResizeMove = (moveEvent: MouseEvent) => {
//             const deltaX = moveEvent.clientX - startX;
//             const deltaY = moveEvent.clientY - startY;
//             let newWidth = resizeStartRef.current.width;
//             let newHeight = resizeStartRef.current.height;
//
//             // Update dimensions based on resize direction
//             if (direction.includes('e')) newWidth += deltaX;
//             if (direction.includes('w')) newWidth -= deltaX;
//             if (direction.includes('s')) newHeight += deltaY;
//             if (direction.includes('n')) newHeight -= deltaY;
//
//             // Enforce minimum dimensions
//             newWidth = Math.max(50, newWidth);
//             newHeight = Math.max(30, newHeight);
//
//             onUpdate(field.id, {
//                 width: newWidth,
//                 height: newHeight,
//                 // Update position if resizing from top or left
//                 ...(direction.includes('w') && { x: field.x + (resizeStartRef.current.width - newWidth) }),
//                 ...(direction.includes('n') && { y: field.y + (resizeStartRef.current.height - newHeight) })
//             });
//         };
//
//         const handleResizeEnd = () => {
//             document.removeEventListener('mousemove', handleResizeMove);
//             document.removeEventListener('mouseup', handleResizeEnd);
//         };
//
//         document.addEventListener('mousemove', handleResizeMove);
//         document.addEventListener('mouseup', handleResizeEnd);
//     };
//
//     const ResizeHandle = ({ direction }: { direction: string }) => (
//         <div
//             className={`absolute w-3 h-3 bg-white border-2 border-blue-500 rounded-full ${
//                 direction === 'n' || direction === 's' ? 'cursor-ns-resize' :
//                     direction === 'e' || direction === 'w' ? 'cursor-ew-resize' :
//                         `cursor-${direction}-resize`
//             }`}
//             style={{
//                 top: direction.includes('n') ? -4 : 'auto',
//                 bottom: direction.includes('s') ? -4 : 'auto',
//                 left: direction.includes('w') ? -4 : 'auto',
//                 right: direction.includes('e') ? -4 : 'auto',
//                 ...(direction === 'n' || direction === 's' ? { left: '50%', transform: 'translateX(-50%)' } : {}),
//                 ...(direction === 'e' || direction === 'w' ? { top: '50%', transform: 'translateY(-50%)' } : {})
//             }}
//             onMouseDown={(e) => handleResizeStart(e, direction)}
//         />
//     );
//
//     const renderField = (field: FormField) => {
//         const baseClass = "w-full border rounded-md px-2 py-1";
//
//         switch (field.type) {
//             case 'textarea':
//                 return (
//                     <textarea
//                         className={baseClass}
//                         rows={3}
//                     />
//                 );
//             case 'select':
//                 return (
//                     <select className={baseClass}>
//
//                     </select>
//                 );
//             case 'checkbox':
//                 return (
//                     <div className="flex items-center">
//                         <input
//                             type="checkbox"
//                             className="h-4 w-4 rounded border-gray-300"
//                         />
//                         <label className="ml-2 text-sm text-gray-600">
//                             {field.label}
//                         </label>
//                     </div>
//                 );
//             case 'radio':
//                 return (
//                     <div className="space-y-1">
//
//                     </div>
//                 );
//             default:
//                 return (
//                   <div>
//                      
//                   </div>
//                 );
//         }
//     };
//
//     return (
//         <div
//             ref={elementRef}
//             className={`absolute bg-white rounded-md shadow-sm ${
//                 isSelected ? 'border-2 border-blue-500' : 'border border-gray-200'
//             }`}
//             style={{
//                 left: field.x,
//                 top: field.y,
//                 width: field.width,
//                 height: field.height,
//                 cursor: 'move'
//             }}
//             onClick={(e) => {
//                 e.stopPropagation();
//                 onSelect(field.id);
//             }}
//         >
//             <div
//                 className="p-2 bg-gray-50 border-b flex justify-between items-center"
//                 onMouseDown={handleMouseDown}
//             >
//                 <span className="text-sm font-medium">{field.label}</span>
//                 <button
//                     onClick={(e) => {
//                         e.stopPropagation();
//                         onDelete(field.id);
//                     }}
//                     className="p-1 hover:bg-gray-200 rounded"
//                 >
//                     <Trash2 size={16} />
//                 </button>
//             </div>
//             <div className="p-2">
//                 {renderField(field)}
//             </div>
//
//             {isSelected && (
//                 <>
//                     <ResizeHandle direction="n" />
//                     <ResizeHandle direction="e" />
//                     <ResizeHandle direction="s" />
//                     <ResizeHandle direction="w" />
//                     <ResizeHandle direction="ne" />
//                     <ResizeHandle direction="se" />
//                     <ResizeHandle direction="sw" />
//                     <ResizeHandle direction="nw" />
//                 </>
//             )}
//         </div>
//     );
// });
//
// export default DraggableField
// 
import React from 'react'

const DraggableField = () => {
    return (
        <div>DraggableField</div>
    )
}
export default DraggableField
;