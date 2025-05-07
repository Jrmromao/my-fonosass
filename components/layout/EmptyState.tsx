import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const EmptyState: React.FC = () => {
    return (
        <Card className="border-gray-200 dark:border-gray-800">
            <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <svg
                    className="w-12 h-12 text-gray-400 dark:text-gray-500 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                </svg>
                <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">Nenhuma atividade encontrada</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Tente ajustar os filtros ou criar uma nova atividade.
                </p>
            </CardContent>
        </Card>
    );
};

export default EmptyState;