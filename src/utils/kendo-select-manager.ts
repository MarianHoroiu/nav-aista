interface SelectElementInfo {
  selectElement: HTMLSelectElement;
  triggerElement: HTMLElement;
  label: string;
  isExpanded: boolean;
}

/**
 * Finds and manages Kendo UI ComboBox elements on the page
 */
class KendoSelectManager {
  private static readonly SELECTORS = {
    kendoWrapper: '.k-widget.k-combobox',
    selectElement: 'select[data-role="combobox"]',
    triggerButton: '.k-select',
    dropdownWrap: '.k-dropdown-wrap',
    input: '.k-input',
  };

  private static readonly TARGET_LABELS = [
    'Autoritatea contractanta',
    'Domeniu de activitate',
    'Modalitatea de atribuire',
    'Cod sau denumire CPV ',
  ];

  /**
   * Finds all Kendo ComboBox elements on the page
   */
  public static findKendoSelects(): SelectElementInfo[] {
    const kendoWrappers = document.querySelectorAll<HTMLElement>(this.SELECTORS.kendoWrapper);
    const selectInfos: SelectElementInfo[] = [];

    kendoWrappers.forEach(wrapper => {
      const selectElement = wrapper.querySelector<HTMLSelectElement>(this.SELECTORS.selectElement);
      const triggerElement = wrapper.querySelector<HTMLElement>(this.SELECTORS.triggerButton);

      if (selectElement && triggerElement) {
        // Try to find associated label
        const label = this.findAssociatedLabel(wrapper);

        // Check if dropdown is currently expanded
        const input = wrapper.querySelector<HTMLInputElement>(this.SELECTORS.input);
        const isExpanded = input?.getAttribute('aria-expanded') === 'true';

        selectInfos.push({
          selectElement,
          triggerElement,
          label,
          isExpanded,
        });
      }
    });

    return selectInfos;
  }

  /**
   * Finds only the target Kendo ComboBox elements specified in TARGET_LABELS
   */
  public static findTargetKendoSelects(): SelectElementInfo[] {
    const allSelectInfos = this.findKendoSelects();

    // Filter select elements by target labels (case-insensitive)
    const targetSelectInfos = allSelectInfos.filter(selectInfo =>
      this.TARGET_LABELS.some(
        targetLabel =>
          selectInfo.label.toLowerCase().includes(targetLabel.toLowerCase()) ||
          targetLabel.toLowerCase().includes(selectInfo.label.toLowerCase())
      )
    );

    console.log(
      `Found ${targetSelectInfos.length} target Kendo ComboBox elements out of ${allSelectInfos.length} total`
    );
    console.log(`Target labels: ${this.TARGET_LABELS.join(', ')}`);
    console.log(`Matched elements: ${targetSelectInfos.map(s => s.label).join(', ')}`);

    return targetSelectInfos;
  }

  /**
   * Triggers a single Kendo ComboBox to open and load options
   */
  public static async triggerKendoSelect(selectInfo: SelectElementInfo): Promise<boolean> {
    try {
      const { triggerElement, selectElement } = selectInfo;

      // Don't trigger if already expanded
      if (selectInfo.isExpanded) {
        console.log(`ComboBox "${selectInfo.label}" is already expanded`);
        return true;
      }

      // Method 1: Click the trigger button
      if (triggerElement) {
        triggerElement.click();

        // Wait a bit for the dropdown to load
        await this.waitForOptions(selectElement, 2000);
        return true;
      }

      // Method 2: Trigger focus and keydown events as fallback
      const input = selectInfo.triggerElement
        .closest('.k-widget')
        ?.querySelector<HTMLInputElement>('.k-input');
      if (input) {
        input.focus();

        // Simulate Alt+Down arrow to open dropdown
        const keydownEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          altKey: true,
          bubbles: true,
          cancelable: true,
        });

        input.dispatchEvent(keydownEvent);
        await this.waitForOptions(selectElement, 2000);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error triggering select "${selectInfo.label}":`, error);
      return false;
    }
  }

  /**
   * Closes a Kendo ComboBox dropdown
   */
  public static async closeKendoSelect(selectInfo: SelectElementInfo): Promise<boolean> {
    try {
      const { triggerElement } = selectInfo;

      // Check if it's currently expanded
      const input = triggerElement
        .closest('.k-widget')
        ?.querySelector<HTMLInputElement>('.k-input');
      const isExpanded = input?.getAttribute('aria-expanded') === 'true';

      if (!isExpanded) {
        return true; // Already closed
      }

      // Method 1: Click the trigger button to close
      if (triggerElement) {
        triggerElement.click();
        await this.delay(200); // Wait for close animation
        return true;
      }

      // Method 2: Use Escape key as fallback
      if (input) {
        const escapeEvent = new KeyboardEvent('keydown', {
          key: 'Escape',
          bubbles: true,
          cancelable: true,
        });
        input.dispatchEvent(escapeEvent);
        await this.delay(200);
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error closing select "${selectInfo.label}":`, error);
      return false;
    }
  }

  /**
   * Triggers the target Kendo ComboBox elements (open -> wait -> close)
   */
  public static async triggerTargetKendoSelects(): Promise<SelectElementInfo[]> {
    const targetSelectInfos = this.findTargetKendoSelects();
    const results: SelectElementInfo[] = [];

    for (const selectInfo of targetSelectInfos) {
      console.log(`Processing: ${selectInfo.label}`);

      // Open the select
      const openSuccess = await this.triggerKendoSelect(selectInfo);
      if (openSuccess) {
        console.log(`✓ Opened: ${selectInfo.label}`);

        // Wait 1 second for data to load
        await this.delay(1000);

        // Close the select
        const closeSuccess = await this.closeKendoSelect(selectInfo);
        if (closeSuccess) {
          console.log(`✓ Closed: ${selectInfo.label}`);
          results.push(selectInfo);
        } else {
          console.log(`✗ Failed to close: ${selectInfo.label}`);
        }
      } else {
        console.log(`✗ Failed to open: ${selectInfo.label}`);
      }

      // Small delay between elements
      await this.delay(300);
    }

    console.log(
      `Successfully processed ${results.length} out of ${targetSelectInfos.length} target elements`
    );
    return results;
  }

  /**
   * Waits for options to be loaded in a select element
   */
  private static async waitForOptions(
    selectElement: HTMLSelectElement,
    timeout: number = 2000
  ): Promise<boolean> {
    const startTime = Date.now();
    const initialOptionCount = selectElement.options.length;

    return new Promise(resolve => {
      const checkOptions = () => {
        const currentOptionCount = selectElement.options.length;
        const hasNewOptions = currentOptionCount > initialOptionCount;
        const hasNonEmptyOptions = Array.from(selectElement.options).some(
          option => option.value && option.value !== 'null'
        );

        if (hasNewOptions || hasNonEmptyOptions) {
          resolve(true);
          return;
        }

        if (Date.now() - startTime > timeout) {
          resolve(false);
          return;
        }

        setTimeout(checkOptions, 100);
      };

      checkOptions();
    });
  }

  /**
   * Finds the associated label for a Kendo ComboBox wrapper
   */
  private static findAssociatedLabel(wrapper: HTMLElement): string {
    // Look for label in the same parent container
    const parentDiv = wrapper.closest('.col-md-3, .form-group, .field-wrapper');
    if (parentDiv) {
      const label = parentDiv.querySelector<HTMLLabelElement>('label, .form-label');
      if (label) {
        return label.textContent?.trim() || 'Unknown';
      }
    }

    // Look for preceding label
    let previousElement = wrapper.previousElementSibling;
    while (previousElement) {
      if (previousElement.tagName === 'LABEL' || previousElement.classList.contains('form-label')) {
        return previousElement.textContent?.trim() || 'Unknown';
      }
      previousElement = previousElement.previousElementSibling;
    }

    return 'Unknown';
  }

  /**
   * Utility method to create a delay
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Gets the current options from a select element
   */
  public static getSelectOptions(
    selectElement: HTMLSelectElement
  ): Array<{ value: string; text: string }> {
    return Array.from(selectElement.options)
      .map(option => ({
        value: option.value,
        text: option.textContent || '',
      }))
      .filter(option => option.value && option.value !== 'null');
  }
}

// Export functions for use in Chrome extension

/**
 * Main function to trigger target Kendo selects and return their data
 */
export async function processTargetKendoSelects(): Promise<{
  [label: string]: Array<{ value: string; text: string }>;
}> {
  try {
    const triggeredSelects = await KendoSelectManager.triggerTargetKendoSelects();
    const selectData: { [label: string]: Array<{ value: string; text: string }> } = {};

    triggeredSelects.forEach(selectInfo => {
      const options = KendoSelectManager.getSelectOptions(selectInfo.selectElement);
      selectData[selectInfo.label] = options;
    });

    return selectData;
  } catch (error) {
    console.error('Error processing target Kendo selects:', error);
    return {};
  }
}

/**
 * Simple function to trigger target selects (for Chrome extension content script)
 */
export async function triggerTargetSelectsAndWait(): Promise<void> {
  await KendoSelectManager.triggerTargetKendoSelects();
  console.log('All target Kendo ComboBox elements have been processed');
}

/**
 * Function to get list of available target labels
 */
export function getTargetLabels(): string[] {
  return [
    'Autoritatea contractanta',
    'Domeniu de activitate',
    'Modalitatea de atribuire',
    'Cod sau denumire CPV ',
  ];
}
