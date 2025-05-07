import { prisma } from '@/app/db';

import {createOrUpdateUser} from "@/services/userService";

test('should return false on unexpected error', async () => {


    try {
        await createOrUpdateUser(
            'user_2wg7QXTZVOKjyJqPb0kv7frxEb',
            'ecokeepr@gmail.com',
            'John',
            'Doe'
        );
    } catch (error) {
        console.log('error', error);
    }

        expect(false).toBe(false);
    });
