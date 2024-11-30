import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";

interface CalendarHeaderProps {
    currentMonth: Date;
    onMonthSelect: (date: Date) => void;
    onYearSelect: (year: number) => void;
    minDate?: Date;
    maxDate?: Date;
}

const CalendarHeader = ({
                            currentMonth,
                            onMonthSelect,
                            onYearSelect,
                            minDate,
                            maxDate,
                        }: CalendarHeaderProps) => {
    const startYear = minDate ? minDate.getFullYear() : 1900;
    const endYear = maxDate ? maxDate.getFullYear() : 2100;
    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    return (
        <div className="flex justify-center items-center gap-1 px-1">
            <Select
                value={currentMonth.getMonth().toString()}
                onValueChange={(value) => {
                    const newDate = new Date(currentMonth);
                    newDate.setMonth(parseInt(value));
                    onMonthSelect(newDate);
                }}
            >
                <SelectTrigger className="w-28 h-8 text-sm">
                    <SelectValue>{monthNames[currentMonth.getMonth()]}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {monthNames.map((month, index) => (
                        <SelectItem key={index} value={index.toString()}>
                            {month}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <Select
                value={currentMonth.getFullYear().toString()}
                onValueChange={(value) => onYearSelect(parseInt(value))}
            >
                <SelectTrigger className="w-20 h-8 text-sm">
                    <SelectValue>{currentMonth.getFullYear()}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {Array.from(
                        { length: endYear - startYear + 1 },
                        (_, i) => startYear + i
                    ).map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                            {year}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="flex gap-1">
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.preventDefault();
                        const prevMonth = new Date(currentMonth);
                        prevMonth.setMonth(prevMonth.getMonth() - 1);
                        onMonthSelect(prevMonth);
                    }}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                        e.preventDefault();
                        const nextMonth = new Date(currentMonth);
                        nextMonth.setMonth(nextMonth.getMonth() + 1);
                        onMonthSelect(nextMonth);
                    }}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};

interface DateTimeInputProps {
    value?: Date;
    onChange?: (date: Date | undefined) => void;
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    required?: boolean;
    minDate?: Date;
    maxDate?: Date;
    clearable?: boolean;
    className?: string;
}

const DateTimeInput = ({
                           value,
                           onChange,
                           label,
                           placeholder = "Pick a date",
                           disabled = false,
                           required = false,
                           minDate,
                           maxDate,
                           clearable = true,
                           className
                       }: DateTimeInputProps) => {
    const [isOpen, setIsOpen] = React.useState(false);
    const [currentMonth, setCurrentMonth] = React.useState<Date>(value || new Date());

    const handleClear = (e: React.MouseEvent) => {
        e.stopPropagation();
        onChange?.(undefined);
    };

    const handleSelect = (date: Date | undefined) => {
        onChange?.(date);
        if (date) setIsOpen(false);
    };

    return (
        <div className="flex flex-col gap-2">
            {label && (
                <div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </div>
            )}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className={[
                            "w-full justify-start text-left font-normal",
                            !value && "text-muted-foreground",
                            className
                        ].filter(Boolean).join(' ')}
                        disabled={disabled}
                    >
            <span className="grow">
              {value ? value.toLocaleDateString() : placeholder}
            </span>
                        <span className="flex shrink-0 items-center gap-2">
              {clearable && value && (
                  <X
                      className="h-4 w-4 opacity-50 hover:opacity-100 transition-opacity"
                      onClick={handleClear}
                  />
              )}
                            <CalendarIcon className="h-4 w-4 opacity-50" />
            </span>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <div className="p-3">
                        <DayPicker
                            mode="single"
                            selected={value}
                            onSelect={handleSelect}
                            month={currentMonth}
                            fromDate={minDate}
                            toDate={maxDate}
                            classNames={{
                                months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                                month: "space-y-4",
                                caption: "flex justify-center pt-1 relative items-center",
                                caption_label: "text-sm font-medium",
                                nav: "space-x-1 flex items-center",
                                nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                                nav_button_previous: "absolute left-1",
                                nav_button_next: "absolute right-1",
                                table: "w-full border-collapse space-y-1",
                                head_row: "flex",
                                head_cell: "text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
                                row: "flex w-full mt-2",
                                cell: "text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                day: "h-8 w-8 p-0 font-normal aria-selected:opacity-100",
                                day_selected:
                                    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                                day_today: "bg-accent text-accent-foreground",
                                day_outside: "text-muted-foreground opacity-50",
                                day_disabled: "text-muted-foreground opacity-50",
                                day_range_middle:
                                    "aria-selected:bg-accent aria-selected:text-accent-foreground",
                                day_hidden: "invisible",
                            }}
                            components={{
                                Caption: ({ displayMonth }) => (
                                    <CalendarHeader
                                        currentMonth={displayMonth}
                                        onMonthSelect={setCurrentMonth}
                                        onYearSelect={(year) => {
                                            const newDate = new Date(currentMonth);
                                            newDate.setFullYear(year);
                                            setCurrentMonth(newDate);
                                        }}
                                        minDate={minDate}
                                        maxDate={maxDate}
                                    />
                                )
                            }}
                        />
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};

export default DateTimeInput;