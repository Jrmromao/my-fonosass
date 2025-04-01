'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUserQuery } from '@/hooks/queries/useUserQuery'
import { UserRole } from '@prisma/client'

// Zod schema for user creation matching Prisma UserRole
const createUserSchema = z.object({
    email: z.string().email('Invalid email address'),
    fullName: z.string()
        .min(2, 'Full name must be at least 2 characters')
        .max(50, 'Full name must be less than 50 characters'),
    role: z.nativeEnum(UserRole).optional().default(UserRole.USER),
    username: z.string(),
    clerkUserId: z.string().optional()
})

const CreateUserForm: React.FC<{
    onClose?: () => void
}> = ({ onClose }) => {
    const { createUser, isCreating } = useUserQuery()

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            email: '',
            username: '',
            fullName: '',
            role: UserRole.USER
        }
    })

    const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
        try {
            await createUser(data, {
                onSuccess: () => {
                    reset()
                    onClose?.()
                }
            })
        } catch (error) {
            console.error('User creation failed', error)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Create New User</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email Input */}
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email Address
                    </label>
                    <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                            errors.email
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Enter email address"
                    />
                    {errors.email && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                {/* Full Name Input */}
                <div>
                    <label
                        htmlFor="fullName"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Full Name
                    </label>
                    <input
                        id="fullName"
                        type="text"
                        {...register('fullName')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                            errors.fullName
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Enter full name"
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>
                <div>
                    <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        username
                    </label>
                    <input
                        id="username"
                        type="text"
                        {...register('username')}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${
                            errors.username
                                ? 'border-red-500 focus:ring-red-500'
                                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                        }`}
                        placeholder="Enter full name"
                    />
                    {errors.fullName && (
                        <p className="mt-1 text-sm text-red-600">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>
                {/* Role Selection */}
                <div>
                    <label
                        htmlFor="role"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        User Role
                    </label>
                    <select
                        id="role"
                        {...register('role')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        {Object.values(UserRole).map((role) => (
                            <option key={role} value={role}>
                                {role.charAt(0) + role.slice(1).toLowerCase()}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <div>
                    <button
                        type="submit"
                        disabled={isCreating}
                        className={`w-full py-2 px-4 rounded-md text-white font-semibold transition-colors ${
                            isCreating
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                        }`}
                    >
                        {isCreating ? 'Creating...' : 'Create User'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CreateUserForm