/**
 * DOM Analyzer utility for analyzing form elements
 * This is a testing implementation to identify dropdown elements and their options
 */

export class DOMAnalyzer {
  /**
   * Find all SELECT elements in the document and analyze them
   * @returns An array of analyzed dropdown objects
   */
  static findAllDropdowns(): DropdownAnalysis[] {
    const selectElements = document.querySelectorAll('select');
    return Array.from(selectElements).map(select =>
      this.analyzeDropdown(select as HTMLSelectElement)
    );
  }

  /**
   * Analyze a single SELECT element
   * @param selectElement The SELECT element to analyze
   * @returns Analysis object with title and options
   */
  private static analyzeDropdown(selectElement: HTMLSelectElement): DropdownAnalysis {
    const id = selectElement.id;
    const name = selectElement.name;

    // Try to find a label for this dropdown
    let title = '';

    // Check for a label that references this select by ID
    if (id) {
      const labelForId = document.querySelector(`label[for="${id}"]`);
      if (labelForId) {
        title = labelForId.textContent?.trim() || '';
      }
    }

    // If no label found, look for a label wrapping the select
    if (!title) {
      const parentLabel = selectElement.closest('label');
      if (parentLabel) {
        // Exclude the text of the select itself
        const clone = parentLabel.cloneNode(true) as HTMLElement;
        const selectInClone = clone.querySelector('select');
        if (selectInClone) {
          selectInClone.remove();
        }
        title = clone.textContent?.trim() || '';
      }
    }

    // If still no title, check for preceding elements that might be labels
    if (!title) {
      // Try to find nearby elements that might be labels
      let prevElement = selectElement.previousElementSibling;
      if (
        prevElement &&
        (prevElement.tagName === 'LABEL' ||
          prevElement.tagName === 'SPAN' ||
          prevElement.tagName === 'DIV')
      ) {
        title = prevElement.textContent?.trim() || '';
      }
    }

    // Fallback to name or id if no title found
    if (!title) {
      title = name || id || 'Unnamed Dropdown';
    }

    // Get all options
    const options = Array.from(selectElement.options).map(option => ({
      value: option.value,
      text: option.text,
      selected: option.selected,
    }));

    return {
      element: selectElement,
      title,
      id,
      name,
      options,
    };
  }

  /**
   * Log analysis of all dropdowns to console
   * Useful for testing
   */
  static logDropdownAnalysis(): void {
    const dropdowns = this.findAllDropdowns();
    console.group('Dropdown Analysis');
    console.log(`Found ${dropdowns.length} dropdowns`);

    dropdowns.forEach((dropdown, index) => {
      console.group(`Dropdown #${index + 1}: ${dropdown.title}`);
      console.log(`ID: ${dropdown.id || 'none'}`);
      console.log(`Name: ${dropdown.name || 'none'}`);
      console.log(`Options (${dropdown.options.length}):`);

      dropdown.options.forEach((option, optIdx) => {
        console.log(
          `  ${optIdx + 1}. ${option.text} (value: "${option.value}")${option.selected ? ' [SELECTED]' : ''}`
        );
      });

      console.groupEnd();
    });

    console.groupEnd();
  }
}

/**
 * Interface representing the analysis of a dropdown element
 */
export interface DropdownAnalysis {
  element: HTMLSelectElement;
  title: string;
  id: string | null;
  name: string;
  options: {
    value: string;
    text: string;
    selected: boolean;
  }[];
}
