// Global test setup.
const mockRouter = { push: jest.fn(), back: jest.fn(), replace: jest.fn() };

jest.mock('expo-router', () => ({
  useRouter: () => mockRouter,
  Stack: { Screen: () => null },
}));

beforeEach(() => {
  mockRouter.push.mockClear();
  mockRouter.back.mockClear();
  mockRouter.replace.mockClear();
});


jest.mock('react-native-safe-area-context', () => require('react-native-safe-area-context/jest/mock').default);
