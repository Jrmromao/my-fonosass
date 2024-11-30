// app/components/loading-overlay.tsx
'use client'
export function LoadingOverlay() {

    {/* Increased from w-4 h-1 and adjusted translate */}

    return (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 rounded-lg">
            <div className="relative h-32 w-32"> {/* Increased from h-16 w-16 */}
                {[...Array(12)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute w-8 h-2 bg-white rounded-full transform -translate-x-4"
                        style={{
                            left: '50%',
                            top: '50%',
                            transform: `rotate(${i * 30}deg)`,
                            transformOrigin: '0 50%',
                            opacity: 1 - (i * 0.08),
                            animation: `spinFade 1.2s linear ${i * 0.1}s infinite`
                        }}
                    />
                ))}
                <style jsx>{`
                    @keyframes spinFade {
                        0% {
                            opacity: 0.16;
                        }
                        100% {
                            opacity: 1;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}