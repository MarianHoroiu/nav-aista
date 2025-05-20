// This file is for testing ESLint rules for any and unknown types

// This should trigger the no-explicit-any error

const anyValue: any = 'test'; // Error: Unexpected any. Specify a different type

// Unknown type is allowed but not ideal for most cases

const unknownValue: unknown = 'test';

// This is the preferred approach - using specific types

const stringValue: string = 'test';

// Or for truly dynamic values, using a generic type parameter
function processValue<T>(value: T): T {
  return value;
}

// Use the function to avoid unused function warning
export const exportedValue = processValue('test');

// Export the test variables to avoid unused variable errors
export { anyValue, unknownValue, stringValue };
