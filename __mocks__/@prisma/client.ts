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
    USER: 'USER',
  },
};

export const PrismaClient = jest.fn(() => prismaMock);

// Enums used at runtime (e.g. z.nativeEnum in lib/actions/activity.action.ts).
// Values must match prisma/schema.prisma.
const toEnum = <T extends string>(values: readonly T[]) =>
  Object.fromEntries(values.map((v) => [v, v])) as { [K in T]: K };

export const ActivityType = toEnum([
  'ANIMALS',
  'COLOURS',
  'MEANS_OF_TRANSPORT',
  'CLOTHING',
  'LANGUAGE',
  'PROFESSIONS',
  'GEOMETRIC_SHAPES',
  'NUMBERS_AND_LETTERS',
  'MOTOR_SKILLS',
  'HUMAN_BODY',
  'ALPHABET',
  'OTHER',
  'SPEECH',
  'COGNITIVE',
  'MOTOR',
  'SOCIAL',
] as const);
export const $Enums = { ActivityType };
