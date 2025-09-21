// Mock for Clerk modules to avoid ESM parsing issues
module.exports = {
  ClerkProvider: ({ children }) => children,
  useUser: () => ({
    isLoaded: true,
    isSignedIn: true,
    user: {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'test@example.com' }],
      firstName: 'Test',
      lastName: 'User',
    },
  }),
  useAuth: () => ({
    isLoaded: true,
    isSignedIn: true,
    userId: 'user_123',
  }),
  auth: jest.fn(),
  currentUser: jest.fn(),
  SignInButton: ({ children }) => children,
  SignUpButton: ({ children }) => children,
  UserButton: () => null,
  SignIn: () => null,
  SignUp: () => null,
};
