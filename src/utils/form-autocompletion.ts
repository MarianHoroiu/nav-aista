/**
 * Manages filling the "De la" (From) input field with estimated value
 */

// Define interfaces for Angular.js
interface AngularScope {
  $apply: () => void;
  // Using unknown instead of any for better type safety
  // while still allowing for arbitrary properties
  [key: string]: unknown;
}

interface AngularElement {
  scope: () => AngularScope | undefined;
}

interface AngularStatic {
  element: (element: HTMLElement | Element) => AngularElement;
}

// Extend Window interface to include Angular
interface WindowWithAngular extends Window {
  angular?: AngularStatic;
}

class ValueInputFiller {
  private static readonly SELECTORS = {
    // Target the "De la" input specifically
    delaInput: 'input[placeholder="De la "]',
    // Alternative selectors in case the first one fails
    delaInputAlt: 'input[data*="startEstimatedValueRon"]',
    // Container for the value inputs
    valueContainer: '.col-md-3:has(span:contains("Valoare totala estimata"))',
    // Both inputs in the row
    valueInputs: '.row.line-between input[type="text"]',
  };

  private static readonly DEFAULT_VALUE = '20000000';

  /**
   * Finds the "De la" input field on the page
   */
  public static findDelaInput(): HTMLInputElement | null {
    let input = document.querySelector<HTMLInputElement>(this.SELECTORS.delaInput);
    if (input) {
      console.log('✓ Found "De la" input by placeholder');
      return input;
    }

    console.error('✗ Could not find "De la" input field');
    return null;
  }

  /**
   * Finds the value container by looking for the label text
   */
  private static findValueContainer(): HTMLElement | null {
    const labels = document.querySelectorAll<HTMLElement>('label.form-label');

    for (const label of labels) {
      const spanText = label.querySelector('span')?.textContent || '';
      if (spanText.includes('Valoare totala estimata')) {
        const container = label.closest('.col-md-3');
        if (container) {
          console.log('✓ Found value container by label text');
          return container as HTMLElement;
        }
      }
    }

    console.log('✗ Could not find value container');
    return null;
  }

  /**
   * Fills the "De la" input with the specified value
   */
  public static async fillDelaInput(value: string = this.DEFAULT_VALUE): Promise<boolean> {
    try {
      const input = this.findDelaInput();
      if (!input) {
        throw new Error('Could not find "De la" input field');
      }

      console.log(`Filling "De la" input with value: ${value}`);

      // Focus the input first
      input.focus();
      await this.delay(100);

      // Clear existing value
      input.value = '';

      // Set new value
      input.value = value;

      // For AngularJS apps, we need to trigger proper events
      this.triggerAngularEvents(input);

      // Blur to trigger validation/save
      input.blur();

      console.log(`✓ Successfully filled "De la" input with: ${value}`);
      return true;
    } catch (error) {
      console.error('✗ Error filling "De la" input:', error);
      return false;
    }
  }

  /**
   * Triggers events for AngularJS applications
   */
  private static triggerAngularEvents(input: HTMLInputElement): void {
    // Input event (for real-time updates)
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    input.dispatchEvent(inputEvent);

    // Change event (for validation)
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    input.dispatchEvent(changeEvent);

    // Blur event (as specified in the ng-blur attribute)
    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    input.dispatchEvent(blurEvent);

    // KeyUp event (sometimes needed for AngularJS)
    const keyupEvent = new KeyboardEvent('keyup', { bubbles: true, cancelable: true });
    input.dispatchEvent(keyupEvent);

    // For AngularJS, trigger scope digest if available
    try {
      // Check if Angular is available and trigger digest
      const angularElement = (window as WindowWithAngular).angular?.element;
      if (angularElement) {
        const scope = angularElement(input).scope();
        if (scope && scope.$apply) {
          scope.$apply();
          console.log('✓ Triggered AngularJS digest cycle');
        }
      }
    } catch (e) {
      // Ignore errors from Angular scope operations
      console.log(`ℹ️ Could not trigger AngularJS digest (this is usually fine): ${e}`);
    }
  }

  /**
   * Validates that the value was actually set
   */
  public static validateValueSet(expectedValue: string = this.DEFAULT_VALUE): boolean {
    const input = this.findDelaInput();
    if (!input) {
      console.error('✗ Cannot validate - input not found');
      return false;
    }

    const actualValue = input.value;
    const isValid = actualValue === expectedValue;

    if (isValid) {
      console.log(`✓ Validation successful - value is: ${actualValue}`);
    } else {
      console.error(`✗ Validation failed - expected: ${expectedValue}, actual: ${actualValue}`);
    }

    return isValid;
  }

  /**
   * Clears the "De la" input field
   */
  public static async clearDelaInput(): Promise<boolean> {
    try {
      const input = this.findDelaInput();
      if (!input) {
        throw new Error('Could not find "De la" input field');
      }

      console.log('Clearing "De la" input');

      input.focus();
      await this.delay(100);

      input.value = '';

      this.triggerAngularEvents(input);
      input.blur();

      console.log('✓ Successfully cleared "De la" input');
      return true;
    } catch (error) {
      console.error('✗ Error clearing "De la" input:', error);
      return false;
    }
  }

  /**
   * Utility method to create a delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Finds the search/filter button
   */
  public static findSearchButton(): HTMLButtonElement | null {
    // Method 1: Try by ID
    let button = document.querySelector<HTMLButtonElement>('#THE-SEARCH-BUTTON');
    if (button) {
      console.log('✓ Found search button by ID');
      return button;
    }

    // Method 2: Try by ng-click attribute
    button = document.querySelector<HTMLButtonElement>('button[ng-click="vm.search()"]');
    if (button) {
      console.log('✓ Found search button by ng-click attribute');
      return button;
    }

    // Method 3: Try by button text content
    const buttons = document.querySelectorAll<HTMLButtonElement>('button.btn');
    for (const btn of buttons) {
      if (btn.textContent?.includes('FILTREAZA')) {
        console.log('✓ Found search button by text content');
        return btn;
      }
    }

    // Method 4: Try by class combination and text
    button = document.querySelector<HTMLButtonElement>('button.btn-entity');
    if (button && button.textContent?.includes('FILTREAZA')) {
      console.log('✓ Found search button by class and text');
      return button;
    }

    console.error('✗ Could not find search button');
    return null;
  }

  /**
   * Clicks the search/filter button to trigger page filtration
   */
  public static async clickSearchButton(): Promise<boolean> {
    try {
      const button = this.findSearchButton();
      if (!button) {
        throw new Error('Could not find search button');
      }

      // Check if button is disabled
      if (button.disabled || button.hasAttribute('disabled')) {
        console.warn('⚠️ Search button is disabled, attempting to click anyway');
      }

      // Check if there's a loading state
      const isLoading = button.querySelector('.fa-spinner');
      if (isLoading) {
        console.warn('⚠️ Search appears to be in loading state');
      }

      console.log('Clicking search button to trigger filtration...');

      // Focus the button first
      button.focus();
      await this.delay(100);

      // Click the button
      button.click();

      // For AngularJS, also trigger the ng-click manually if needed
      const clickEvent = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window,
      });
      button.dispatchEvent(clickEvent);

      // Trigger AngularJS digest if available
      try {
        const angularElement = (window as WindowWithAngular).angular?.element;
        if (angularElement) {
          const scope = angularElement(button).scope();
          if (scope && scope.$apply) {
            scope.$apply();
            console.log('✓ Triggered AngularJS digest cycle for search button');
          }
        }
      } catch (e) {
        console.log(`ℹ️ Could not trigger AngularJS digest for search button: ${e}`);
      }

      console.log('✓ Successfully clicked search button');
      return true;
    } catch (error) {
      console.error('✗ Error clicking search button:', error);
      return false;
    }
  }

  /**
   * Waits for search button to become available and not in loading state
   */
  public static async waitForSearchButton(timeout: number = 5000): Promise<boolean> {
    const startTime = Date.now();

    return new Promise(resolve => {
      const checkButton = () => {
        const button = this.findSearchButton();

        if (button) {
          // Check if button is not in loading state
          const isLoading = button.querySelector('.fa-spinner');
          const isDisabled = button.disabled || button.hasAttribute('disabled');

          if (!isLoading && !isDisabled) {
            resolve(true);
            return;
          }
        }

        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }

        setTimeout(checkButton, 200);
      };

      checkButton();
    });
  }

  /**
   * Gets information about the value input fields
   */
  public static getValueInputInfo(): { delaValue: string; panaLaValue: string; found: boolean } {
    const container = this.findValueContainer();
    if (!container) {
      return { delaValue: '', panaLaValue: '', found: false };
    }

    const inputs = container.querySelectorAll<HTMLInputElement>(
      '.row.line-between input[type="text"]'
    );

    return {
      delaValue: inputs[0]?.value || '',
      panaLaValue: inputs[1]?.value || '',
      found: inputs.length >= 2,
    };
  }
}

/**
 * Manages filling date input fields for publication date range
 */
class DateInputFiller {
  private static readonly SELECTORS = {
    // Target the date inputs specifically
    startDateInput: 'input[placeholder="De la data"]',
    endDateInput: 'input[placeholder="Pana la data"]',
    // Container for the date inputs
    dateContainer: '.col-md-3:has(label:contains("Data publicare"))',
    // Both inputs in the row
    dateInputs: '.row.line-between input[data-role="datepicker"]',
  };

  /**
   * Finds the "De la data" input field on the page
   */
  public static findStartDateInput(): HTMLInputElement | null {
    let input = document.querySelector<HTMLInputElement>(this.SELECTORS.startDateInput);
    if (input) {
      console.log('✓ Found "De la data" input by placeholder');
      return input;
    }

    console.log('✗ Could not find "De la data" input field');
    return null;
  }

  /**
   * Finds the "Pana la data" input field on the page
   */
  public static findEndDateInput(): HTMLInputElement | null {
    let input = document.querySelector<HTMLInputElement>(this.SELECTORS.endDateInput);
    if (input) {
      console.log('✓ Found "Pana la data" input by placeholder');
      return input;
    }

    console.log('✗ Could not find "Pana la data" input field');
    return null;
  }

  /**
   * Finds the date container by looking for the label text
   */
  private static findDateContainer(): HTMLElement | null {
    const labels = document.querySelectorAll<HTMLElement>('label.form-label');

    for (const label of labels) {
      if (label.textContent?.includes('Data publicare')) {
        const container = label.closest('.col-md-3');
        if (container) {
          console.log('✓ Found date container by label text');
          return container as HTMLElement;
        }
      }
    }

    console.log('✗ Could not find date container');
    return null;
  }

  /**
   * Fills the start date input with the specified date
   * @param dateStr Date string in format expected by Kendo datepicker (e.g., 'MM/DD/YYYY')
   */
  public static async fillStartDateInput(dateStr: string): Promise<boolean> {
    try {
      const input = this.findStartDateInput();
      if (!input) {
        throw new Error('Could not find "De la data" input field');
      }

      console.log(`Filling "De la data" input with value: ${dateStr}`);

      // Focus the input first
      input.focus();
      await this.delay(100);

      // Clear existing value
      input.value = '';

      // Set new value
      input.value = dateStr;

      // For Kendo datepicker and AngularJS apps, we need to trigger proper events
      this.triggerKendoAndAngularEvents(input);

      // Blur to trigger validation/save
      input.blur();

      console.log(`✓ Successfully filled "De la data" input with: ${dateStr}`);
      return true;
    } catch (error) {
      console.error('✗ Error filling "De la data" input:', error);
      return false;
    }
  }

  /**
   * Fills the end date input with the specified date
   * @param dateStr Date string in format expected by Kendo datepicker (e.g., 'MM/DD/YYYY')
   */
  public static async fillEndDateInput(dateStr: string): Promise<boolean> {
    try {
      const input = this.findEndDateInput();
      if (!input) {
        throw new Error('Could not find "Pana la data" input field');
      }

      console.log(`Filling "Pana la data" input with value: ${dateStr}`);

      // Focus the input first
      input.focus();
      await this.delay(100);

      // Clear existing value
      input.value = '';

      // Set new value
      input.value = dateStr;

      // For Kendo datepicker and AngularJS apps, we need to trigger proper events
      this.triggerKendoAndAngularEvents(input);

      // Blur to trigger validation/save
      input.blur();

      console.log(`✓ Successfully filled "Pana la data" input with: ${dateStr}`);
      return true;
    } catch (error) {
      console.error('✗ Error filling "Pana la data" input:', error);
      return false;
    }
  }

  /**
   * Triggers events for Kendo datepicker and AngularJS applications
   */
  private static triggerKendoAndAngularEvents(input: HTMLInputElement): void {
    // Input event (for real-time updates)
    const inputEvent = new Event('input', { bubbles: true, cancelable: true });
    input.dispatchEvent(inputEvent);

    // Change event (for validation)
    const changeEvent = new Event('change', { bubbles: true, cancelable: true });
    input.dispatchEvent(changeEvent);

    // For Kendo datepicker, trigger k-change event
    try {
      // Find the Kendo widget
      const kendoWidget = input.closest('.k-datepicker');
      if (kendoWidget) {
        // Create and dispatch Kendo specific events
        const kendoChangeEvent = new CustomEvent('k-change', {
          bubbles: true,
          cancelable: true,
          detail: { value: input.value },
        });
        kendoWidget.dispatchEvent(kendoChangeEvent);
      }
    } catch (e) {
      console.log(`ℹ️ Could not trigger Kendo events (this may be fine): ${e}`);
    }

    // Blur event
    const blurEvent = new Event('blur', { bubbles: true, cancelable: true });
    input.dispatchEvent(blurEvent);

    // For AngularJS, trigger scope digest if available
    try {
      const angularElement = (window as WindowWithAngular).angular?.element;
      if (angularElement) {
        const scope = angularElement(input).scope();
        if (scope && scope.$apply) {
          scope.$apply();
          console.log('✓ Triggered AngularJS digest cycle');
        }
      }
    } catch (e) {
      console.log(`ℹ️ Could not trigger AngularJS digest (this is usually fine): ${e}`);
    }
  }

  /**
   * Validates that the date value was actually set
   */
  public static validateStartDateSet(expectedValue: string): boolean {
    const input = this.findStartDateInput();
    if (!input) {
      console.error('✗ Cannot validate - start date input not found');
      return false;
    }

    const actualValue = input.value;
    const isValid = actualValue === expectedValue;

    if (isValid) {
      console.log(`✓ Validation successful - start date value is: ${actualValue}`);
    } else {
      console.error(`✗ Validation failed - expected: ${expectedValue}, actual: ${actualValue}`);
    }

    return isValid;
  }

  /**
   * Validates that the end date value was actually set
   */
  public static validateEndDateSet(expectedValue: string): boolean {
    const input = this.findEndDateInput();
    if (!input) {
      console.error('✗ Cannot validate - end date input not found');
      return false;
    }

    const actualValue = input.value;
    const isValid = actualValue === expectedValue;

    if (isValid) {
      console.log(`✓ Validation successful - end date value is: ${actualValue}`);
    } else {
      console.error(`✗ Validation failed - expected: ${expectedValue}, actual: ${actualValue}`);
    }

    return isValid;
  }

  /**
   * Clears the start date input field
   */
  public static async clearStartDateInput(): Promise<boolean> {
    try {
      const input = this.findStartDateInput();
      if (!input) {
        throw new Error('Could not find "De la data" input field');
      }

      console.log('Clearing "De la data" input');

      // Find and click the clear button if available
      const container = input.closest('.col-md-6');
      const clearButton = container?.querySelector<HTMLButtonElement>('.date-remove-btn');

      if (clearButton) {
        clearButton.click();
        console.log('✓ Successfully clicked clear button for "De la data" input');
        return true;
      }

      // Manual clearing as fallback
      input.focus();
      await this.delay(100);
      input.value = '';
      this.triggerKendoAndAngularEvents(input);
      input.blur();

      console.log('✓ Successfully cleared "De la data" input');
      return true;
    } catch (error) {
      console.error('✗ Error clearing "De la data" input:', error);
      return false;
    }
  }

  /**
   * Clears the end date input field
   */
  public static async clearEndDateInput(): Promise<boolean> {
    try {
      const input = this.findEndDateInput();
      if (!input) {
        throw new Error('Could not find "Pana la data" input field');
      }

      console.log('Clearing "Pana la data" input');

      // Find and click the clear button if available
      const container = input.closest('.col-md-6');
      const clearButton = container?.querySelector<HTMLButtonElement>('.date-remove-btn');

      if (clearButton) {
        clearButton.click();
        console.log('✓ Successfully clicked clear button for "Pana la data" input');
        return true;
      }

      // Manual clearing as fallback
      input.focus();
      await this.delay(100);
      input.value = '';
      this.triggerKendoAndAngularEvents(input);
      input.blur();

      console.log('✓ Successfully cleared "Pana la data" input');
      return true;
    } catch (error) {
      console.error('✗ Error clearing "Pana la data" input:', error);
      return false;
    }
  }

  /**
   * Utility method to create a delay
   */
  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets information about the date input fields
   */
  public static getDateInputInfo(): { startDate: string; endDate: string; found: boolean } {
    const container = this.findDateContainer();
    if (!container) {
      return { startDate: '', endDate: '', found: false };
    }

    const inputs = container.querySelectorAll<HTMLInputElement>('input[data-role="datepicker"]');

    return {
      startDate: inputs[0]?.value || '',
      endDate: inputs[1]?.value || '',
      found: inputs.length >= 2,
    };
  }
}

// Export functions for Chrome extension

/**
 * Main function to fill the "De la" input with default value (200000)
 */
export async function fillEstimatedValueFrom(): Promise<boolean> {
  try {
    console.log('🎯 Starting to fill "De la" input...');
    const success = await ValueInputFiller.fillDelaInput();

    if (success) {
      // Validate the value was set correctly
      await ValueInputFiller.delay(500); // Wait a bit for Angular to process
      const isValid = ValueInputFiller.validateValueSet();

      if (isValid) {
        console.log('✅ Successfully filled and validated "De la" input');
        return true;
      } else {
        console.log('⚠️ Value was set but validation failed');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in fillEstimatedValueFrom:', error);
    return false;
  }
}

/**
 * Fill "De la" input and automatically trigger search
 */
export async function fillEstimatedValueFromAndSearch(): Promise<boolean> {
  try {
    console.log('🎯 Starting to fill "De la" input and trigger search...');

    // First fill the input
    const fillSuccess = await ValueInputFiller.fillDelaInput();

    if (fillSuccess) {
      // Validate the value was set correctly
      await ValueInputFiller.delay(500);
      const isValid = ValueInputFiller.validateValueSet();

      if (isValid) {
        console.log('✅ Successfully filled "De la" input, now triggering search...');

        // Wait for search button to be ready
        const buttonReady = await ValueInputFiller.waitForSearchButton(3000);
        if (!buttonReady) {
          console.warn('⚠️ Search button not ready, attempting to click anyway...');
        }

        // Click the search button
        const searchSuccess = await ValueInputFiller.clickSearchButton();

        if (searchSuccess) {
          console.log('✅ Successfully filled input and triggered search');
          return true;
        } else {
          console.log('⚠️ Filled input but failed to trigger search');
          return false;
        }
      } else {
        console.log('⚠️ Value was set but validation failed');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in fillEstimatedValueFromAndSearch:', error);
    return false;
  }
}

/**
 * Fill with custom value
 */
export async function fillEstimatedValueFromCustom(value: string): Promise<boolean> {
  try {
    console.log(`🎯 Starting to fill "De la" input with custom value: ${value}...`);
    const success = await ValueInputFiller.fillDelaInput(value);

    if (success) {
      await ValueInputFiller.delay(500);
      const isValid = ValueInputFiller.validateValueSet(value);

      if (isValid) {
        console.log(`✅ Successfully filled and validated "De la" input with: ${value}`);
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in fillEstimatedValueFromCustom:', error);
    return false;
  }
}

/**
 * Fill with custom value and automatically trigger search
 */
export async function fillEstimatedValueFromCustomAndSearch(value: string): Promise<boolean> {
  try {
    console.log(
      `🎯 Starting to fill "De la" input with custom value: ${value} and trigger search...`
    );

    const fillSuccess = await ValueInputFiller.fillDelaInput(value);

    if (fillSuccess) {
      await ValueInputFiller.delay(500);
      const isValid = ValueInputFiller.validateValueSet(value);

      if (isValid) {
        console.log(
          `✅ Successfully filled "De la" input with: ${value}, now triggering search...`
        );

        const buttonReady = await ValueInputFiller.waitForSearchButton(3000);
        if (!buttonReady) {
          console.warn('⚠️ Search button not ready, attempting to click anyway...');
        }

        const searchSuccess = await ValueInputFiller.clickSearchButton();

        if (searchSuccess) {
          console.log(`✅ Successfully filled input with ${value} and triggered search`);
          return true;
        } else {
          console.log(`⚠️ Filled input with ${value} but failed to trigger search`);
          return false;
        }
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in fillEstimatedValueFromCustomAndSearch:', error);
    return false;
  }
}

/**
 * Just trigger the search button (without filling input)
 */
export async function triggerSearch(): Promise<boolean> {
  try {
    console.log('🔍 Triggering search...');

    const buttonReady = await ValueInputFiller.waitForSearchButton(3000);
    if (!buttonReady) {
      console.warn('⚠️ Search button not ready, attempting to click anyway...');
    }

    const success = await ValueInputFiller.clickSearchButton();

    if (success) {
      console.log('✅ Successfully triggered search');
    }

    return success;
  } catch (error) {
    console.error('❌ Error in triggerSearch:', error);
    return false;
  }
}

/**
 * Clear the "De la" input
 */
export async function clearEstimatedValueFrom(): Promise<boolean> {
  try {
    console.log('🧹 Clearing "De la" input...');
    const success = await ValueInputFiller.clearDelaInput();

    if (success) {
      console.log('✅ Successfully cleared "De la" input');
    }

    return success;
  } catch (error) {
    console.error('❌ Error in clearEstimatedValueFrom:', error);
    return false;
  }
}

/**
 * Get current values in both input fields
 */
export function getEstimatedValues(): { delaValue: string; panaLaValue: string; found: boolean } {
  return ValueInputFiller.getValueInputInfo();
}

/**
 * Fill the "De la data" (start date) input with a specific date
 * Default date is the start of the current month
 */
export async function fillPublicationStartDate(dateStr?: string): Promise<boolean> {
  try {
    // If no date provided, use first day of current month
    if (!dateStr) {
      const today = new Date();
      // Set to first day of current month
      today.setDate(1);
      // Format as MM/DD/YYYY (default Kendo format)
      dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    }

    console.log(`🗓️ Starting to fill "De la data" input with date: ${dateStr}...`);
    const success = await DateInputFiller.fillStartDateInput(dateStr);

    if (success) {
      // Validate the value was set correctly
      await DateInputFiller.delay(500); // Wait a bit for Angular to process
      const isValid = DateInputFiller.validateStartDateSet(dateStr);

      if (isValid) {
        console.log('✅ Successfully filled and validated "De la data" input');
        return true;
      } else {
        console.log('⚠️ Date was set but validation failed');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in fillPublicationStartDate:', error);
    return false;
  }
}

/**
 * Fill the "Pana la data" (end date) input with a specific date
 * Default date is today
 */
export async function fillPublicationEndDate(dateStr?: string): Promise<boolean> {
  try {
    // If no date provided, use today
    if (!dateStr) {
      const today = new Date();
      // Format as MM/DD/YYYY (default Kendo format)
      dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
    }

    console.log(`🗓️ Starting to fill "Pana la data" input with date: ${dateStr}...`);
    const success = await DateInputFiller.fillEndDateInput(dateStr);

    if (success) {
      // Validate the value was set correctly
      await DateInputFiller.delay(500); // Wait a bit for Angular to process
      const isValid = DateInputFiller.validateEndDateSet(dateStr);

      if (isValid) {
        console.log('✅ Successfully filled and validated "Pana la data" input');
        return true;
      } else {
        console.log('⚠️ Date was set but validation failed');
        return false;
      }
    }

    return false;
  } catch (error) {
    console.error('❌ Error in fillPublicationEndDate:', error);
    return false;
  }
}

/**
 * Fill both publication date inputs with default values
 * Start date: First day of current month
 * End date: Today
 */
export async function fillPublicationDateRange(): Promise<boolean> {
  try {
    console.log('🗓️ Starting to fill publication date range...');

    // Get the first day of current month for start date
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    // Format dates as MM/DD/YYYY (default Kendo format)
    const startDateStr = `${firstDay.getMonth() + 1}/${firstDay.getDate()}/${firstDay.getFullYear()}`;
    const endDateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;

    // Fill start date
    const startSuccess = await DateInputFiller.fillStartDateInput(startDateStr);
    if (!startSuccess) {
      console.log('⚠️ Failed to fill start date');
      return false;
    }

    // Fill end date
    const endSuccess = await DateInputFiller.fillEndDateInput(endDateStr);
    if (!endSuccess) {
      console.log('⚠️ Failed to fill end date');
      return false;
    }

    console.log(`✅ Successfully filled publication date range: ${startDateStr} to ${endDateStr}`);
    return true;
  } catch (error) {
    console.error('❌ Error in fillPublicationDateRange:', error);
    return false;
  }
}

/**
 * Clear both publication date inputs
 */
export async function clearPublicationDateRange(): Promise<boolean> {
  try {
    console.log('🧹 Clearing publication date inputs...');

    // Clear start date
    const startSuccess = await DateInputFiller.clearStartDateInput();
    if (!startSuccess) {
      console.log('⚠️ Failed to clear start date');
      return false;
    }

    // Clear end date
    const endSuccess = await DateInputFiller.clearEndDateInput();
    if (!endSuccess) {
      console.log('⚠️ Failed to clear end date');
      return false;
    }

    console.log('✅ Successfully cleared publication date range');
    return true;
  } catch (error) {
    console.error('❌ Error in clearPublicationDateRange:', error);
    return false;
  }
}

/**
 * Get current values in both date input fields
 */
export function getPublicationDates(): { startDate: string; endDate: string; found: boolean } {
  return DateInputFiller.getDateInputInfo();
}
