export const PageBoundaryIndicator: React.FC = () => {
    return (
        <div className="absolute left-0 right-0 border-b-2 border-dashed border-red-300 pointer-events-none">
            <div className="absolute right-0 -top-6 bg-red-100 px-2 py-1 rounded text-xs text-red-600">
                Page Break
            </div>
        </div>
    );
};