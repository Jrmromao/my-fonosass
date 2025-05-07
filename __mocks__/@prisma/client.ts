import { mockDeep } from 'jest-mock-extended';

export const prismaMock = mockDeep<import('@prisma/client').PrismaClient>();

export const Prisma = {
    PrismaClientKnownRequestError: class extends Error {
        code: string;
        constructor(message: string, code: string) {
            super(message);
            this.code = code;
        }
    },
    UserRole: {
        ADMIN: 'ADMIN',
        USER: 'USER'
    }
};

export const PrismaClient = jest.fn(() => prismaMock);