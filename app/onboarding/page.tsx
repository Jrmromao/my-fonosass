// app/onboarding/page.tsx
"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@clerk/nextjs';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {useToast} from "@/hooks/use-toast";
import {useUserRole} from "@/hooks/useUserRole";

// Form schema
const onboardingSchema = z.object({
    fullName: z.string().min(2, {
        message: "Full name must be at least 2 characters.",
    }),
    displayName: z.string().min(2, {
        message: "Display name must be at least 2 characters.",
    }),
    jobTitle: z.string().optional(),
    department: z.string().optional(),
    bio: z.string().max(160).optional(),
    role: z.enum(["ADMIN", "USER"]),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { user, isLoaded: userLoaded } = useUser();
    const { isLoaded: authLoaded, userId } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const userRole = useUserRole();

    // Redirect if not logged in after auth is loaded
    useEffect(() => {
        if (authLoaded && !userId) {
            // If they're on the onboarding page but not authenticated,
            // they likely need to complete the sign-up process from the invitation
            router.push('/sign-up?redirect_url=/onboarding');
        }
    }, [authLoaded, userId, router]);

    // Default values based on Clerk user data
    const defaultValues: Partial<OnboardingFormValues> = {
        fullName: user?.fullName || '',
        displayName: user?.firstName || '',
        role: 'USER',
    };

    const form = useForm<OnboardingFormValues>({
        resolver: zodResolver(onboardingSchema),
        defaultValues,
    });

    // Update form when user data loads
    useEffect(() => {
        if (userLoaded && user) {
            form.setValue('fullName', user.fullName || '');
            form.setValue('displayName', user.firstName || '');
        }
    }, [userLoaded, user, form]);

    async function onSubmit(data: OnboardingFormValues) {
        try {
            setIsSubmitting(true);

            const response = await fetch('/api/onboarding', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to save onboarding data');
            }

            toast({
                title: "Onboarding complete!",
                description: "Your account has been successfully set up.",
            });

            // Redirect to dashboard after successful onboarding
            router.push('/dashboard');
        } catch (error) {
            console.error('Onboarding error:', error);
            toast({
                title: "Something went wrong",
                description: error instanceof Error ? error.message : "There was an error completing your onboarding. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    // Show loading state while user data is loading
    if (!userLoaded || !authLoaded) {
        return (
            <div className="container flex items-center justify-center min-h-screen py-12">
                <Card className="w-full max-w-md p-8">
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-8 h-8 border-t-2 border-b-2 border-gray-900 rounded-full animate-spin"></div>
                        <p className="text-center text-muted-foreground">Loading your profile...</p>
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="container flex items-center justify-center min-h-screen py-12">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Welcome aboard!</CardTitle>
                    <CardDescription>
                        Complete your profile to get started with the application.
                    </CardDescription>

                </CardHeader>
                <CardContent>



                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="fullName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Full Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="John Doe" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />


                            <FormField
                                control={form.control}
                                name="displayName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Display Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="How you want to be called" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="jobTitle"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Job Title</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="department"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Department</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Optional" {...field} value={field.value || ''} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="bio"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Short Bio</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Tell us a little about yourself"
                                                className="resize-none"
                                                {...field}
                                                value={field.value || ''}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="role"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Role</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="USER">User</SelectItem>
                                                <SelectItem value="ADMIN">Administrator</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Setting up your account..." : "Complete Setup"}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-center text-sm text-muted-foreground">
                    You can update these details later in your profile settings.
                </CardFooter>
            </Card>
        </div>
    );
}