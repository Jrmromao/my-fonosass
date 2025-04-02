import { z } from "zod";
import { createGenericQuery } from "@/hooks/queries/useQueryFactory";
import {
    insert,
    findById,
    getAll,
    remove,
    update,
    UserDto
} from "@/lib/actions/user.action";
import {userSchema} from "@/lib/schema";

export const MODEL_KEY = ["users"] as const;

export function useUserQuery() {
    const genericQuery = createGenericQuery<UserDto, z.infer<typeof userSchema>>(
        MODEL_KEY,
        {
            getAll: async () => await getAll(),
            insert: async (data) => await insert(data),
            delete: async (id: string) => await remove(id),
            update: async (id: string, data: Partial<UserDto>) => await update(id, data),
            findById: async (id: string) => await findById(id),
        },
        {
            successMessage: "User created successfully",
            errorMessage: "Failed to create user",
            staleTime: 5 * 60 * 1000,
        }
    );

    const {
        items: users,
        isLoading,
        error,
        createItem: createUser,
        updateItem: updateUser,
        deleteItem: deleteUser,
        isCreating,
        isUpdating,
        isDeleting,
        refresh,
        findById: queryFindById,
    } = genericQuery();

    return {
        users,
        isLoading,
        error,
        findById: queryFindById,
        createUser,
        updateUser,
        deleteUser,
        isCreating,
        isUpdating,
        isDeleting,
        refresh,
    };
}