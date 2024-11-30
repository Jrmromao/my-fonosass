// components/form/PagePreview.tsx
import {A4_HEIGHT, A4_WIDTH} from "@/config/formFields";
import {Page} from "@/types/types";

interface PagePreviewProps {
    page: Page;
    index: number;
    currentPage: number;
    onClick: (index: number) => void;
}

export const PagePreview: React.FC<PagePreviewProps> = ({ page, index, currentPage, onClick }) => {
    return (
        <div
            onClick={() => onClick(index)}
            className={`
        relative w-32 h-44 cursor-pointer border-2 mb-2 bg-white
        ${currentPage === index ? 'border-blue-500' : 'border-gray-200'}
        hover:border-blue-300 transition-colors
      `}
        >
            {/* Miniature preview of the page */}
            <div className="absolute inset-1 overflow-hidden">
                {page.fields.map((field) => (
                    <div
                        key={field.id}
                        className="absolute bg-gray-100"
                        style={{
                            left: `${(field.x / A4_WIDTH) * 100}%`,
                            top: `${(field.y / A4_HEIGHT) * 100}%`,
                            width: `${(field.width / A4_WIDTH) * 100}%`,
                            height: `${(field.height / A4_HEIGHT) * 100}%`,
                        }}
                    />
                ))}
            </div>
            <div className="absolute bottom-0 left-0 right-0 text-center text-xs py-1 bg-gray-50">
                Page {index + 1}
            </div>
        </div>
    );
};