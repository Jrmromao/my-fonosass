'use client';

import DataTableRowActions from '@/components/table/DataTableRowActions';
import FileList from '@/components/table/FileList';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/utils';
import { ActivityWithFiles } from '@/types/activity';
import { ActivityDifficulty, ActivityType, AgeRange } from '@prisma/client';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar, CircleSlash, Volume2 } from 'lucide-react';

// Modern badge variants with more subtle, professional colors
const getDifficultyVariant = (difficulty: ActivityDifficulty) => {
  const variants = {
    BEGINNER:
      'bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800',
    INTERMEDIATE:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    ADVANCED:
      'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
    EXPERT:
      'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
  };

  // Added 'border' class to all variants for consistency with the gray fallback
  return (
    variants[difficulty] ||
    'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
  );
};

const getTypeVariant = (type: ActivityType) => {
  const variants = {
    SPEECH:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    LANGUAGE:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    COGNITIVE:
      'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    MOTOR:
      'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    SOCIAL:
      'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
    OTHER:
      'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700',
    ANIMALS:
      'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800',
    COLOURS:
      'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800',
    MEANS_OF_TRANSPORT:
      'bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800',
    CLOTHING:
      'bg-purple-50 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800',
    PROFESSIONS:
      'bg-red-50 text-red-700 dark:bg-red-900/40 dark:text-red-300 border border-red-200 dark:border-red-800',
    GEOMETRIC_SHAPES:
      'bg-lime-50 text-lime-700 dark:bg-lime-900/40 dark:text-lime-300 border border-lime-200 dark:border-lime-800',
    NUMBERS_AND_LETTERS:
      'bg-cyan-50 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800',
    HUMAN_BODY:
      'bg-pink-50 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300 border border-pink-200 dark:border-pink-800',
    MOTOR_SKILLS:
      'bg-orange-50 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 border border-orange-200 dark:border-orange-800',
  };

  // Added 'border' class to all variants for consistency with the gray fallback
  return variants[type] || variants.OTHER;
};

const getAgeRangeVariant = (ageRange: AgeRange) => {
  const variants = {
    TODDLER:
      'bg-sky-50 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300 border border-sky-200 dark:border-sky-800',
    PRESCHOOL:
      'bg-teal-50 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800',
    CHILD:
      'bg-green-50 text-green-700 dark:bg-green-900/40 dark:text-green-300 border border-green-200 dark:border-green-800',
    TEENAGER:
      'bg-violet-50 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300 border border-violet-200 dark:border-violet-800',
    ADULT:
      'bg-slate-50 text-slate-700 dark:bg-slate-900/40 dark:text-slate-300 border border-slate-200 dark:border-slate-800',
  };

  // Added 'border' class to all variants for consistency with the gray fallback
  return (
    variants[ageRange] ||
    'bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
  );
};

interface ActivitiesColumnsProps {
  onDelete?: (value: ActivityWithFiles) => void;
  onView?: (value: ActivityWithFiles) => void;
  role?: string; // Assuming Role is used in DataTableRowActions
  isPhoneme?: boolean; // Prop to control the phoneme column
}

export const activitiesColumns = ({
  onDelete,
  onView,
  isPhoneme = false, // Default isPhoneme to false
  role,
}: ActivitiesColumnsProps = {}): ColumnDef<ActivityWithFiles>[] => {
  // Define the columns that are always present
  const baseColumns: ColumnDef<ActivityWithFiles>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Nome
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
            {activity.name}
          </div>
        );
      },
    },

    {
      accessorKey: 'difficulty',
      header: 'Dificuldade',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getDifficultyVariant(activity.difficulty)}`}
          >
            {activity.difficulty}
          </div>
        );
      },
    },
    {
      accessorKey: 'ageRange',
      header: 'Faixa Etária',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div
            className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getAgeRangeVariant(activity.ageRange)}`}
          >
            {activity.ageRange}
          </div>
        );
      },
    },
  ];

  // Define the phoneme column separately
  const phonemeColumn: ColumnDef<ActivityWithFiles> = {
    accessorKey: 'phoneme',
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          Fonema
          <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const activity = row.original;
      return activity.phoneme ? (
        <div className="flex items-center">
          <div className="bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400 p-1.5 rounded-md mr-2">
            <Volume2 className="h-3.5 w-3.5" />
          </div>
          <span className="font-medium text-gray-900 dark:text-white">
            {activity.phoneme}
          </span>
        </div>
      ) : (
        <span className="text-gray-500 dark:text-gray-400 flex items-center">
          <CircleSlash className="h-3.5 w-3.5 mr-1.5" />
          Não definido
        </span>
      );
    },
  };

  const activityTypeColumn: ColumnDef<ActivityWithFiles> = {
    accessorKey: 'type',
    header: 'Tipo de Atividade',
    cell: ({ row }) => {
      const activity = row.original;
      return (
        <div
          className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getTypeVariant(activity.type)}`}
        >
          {activity.type}
        </div>
      );
    },
  };

  // Define the trailing columns
  const trailingColumns: ColumnDef<ActivityWithFiles>[] = [
    {
      accessorKey: 'files',
      header: 'Arquivos',
      cell: ({ row }) => {
        const activity = row.original;
        const files = activity.files || [];

        return (
          <FileList
            files={files}
            activityId={activity.id}
            activityName={activity.name}
          />
        );
      },
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            className="font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
          >
            Data
            <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <div className="text-gray-600 dark:text-gray-400 text-sm flex items-center">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
            {formatDateTime(activity.createdAt).dateOnly}
          </div>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const activity = row.original;
        return (
          <DataTableRowActions
            row={row}
            onDelete={onDelete}
            onView={onView}
            role={role}
          />
        );
      },
    },
  ];

  // Build the final columns array
  const finalColumns: ColumnDef<ActivityWithFiles>[] = [...baseColumns];

  if (isPhoneme) {
    // Insert the phoneme column after base columns if needed
    finalColumns.push(phonemeColumn);
  } else {
    finalColumns.push(activityTypeColumn);
  }

  // Add the trailing columns
  finalColumns.push(...trailingColumns);

  return finalColumns;
};
