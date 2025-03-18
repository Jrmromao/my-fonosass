import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const PlanSelectionButton = ({ plan, handlePlanSelect }: {plan: any, handlePlanSelect: (planId: String) => {}}) => {
    const [open, setOpen] = React.useState(false);

    const handleConfirm = () => {
        handlePlanSelect(plan.id);
        setOpen(false);
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    className={`w-full ${
                        plan.highlight
                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                            : 'bg-white text-indigo-600 border-2 border-indigo-600 hover:bg-indigo-50'
                    } transition-all duration-300 text-sm font-medium`}
                >
                    {plan.cta}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Confirm Plan Selection</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to select the {plan.name} plan?
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="flex gap-2 sm:justify-start">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        className="mt-2 sm:mt-0"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        className={`${
                            plan.highlight
                                ? 'bg-indigo-600 hover:bg-indigo-700'
                                : 'bg-indigo-100 hover:bg-indigo-200'
                        } mt-2 sm:mt-0`}
                    >
                        Confirm Selection
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PlanSelectionButton;