// Test file for ESLint configuration with 'any' and 'unknown' types

// This should trigger an error for 'any' type
const anyValue: any = 'test';

// This should trigger a warning for 'unknown' type
const unknownValue: unknown = 'test';

// This is a properly typed variable
const stringValue: string = 'test';

export { anyValue, unknownValue, stringValue };
