/**
 * UI Component Library
 *
 * This is the main entry point for the UI component library.
 * The library follows atomic design principles with components organized as:
 * - Atoms: Basic building blocks (buttons, inputs, etc.)
 * - Molecules: Groups of atoms (form groups, cards, etc.)
 * - Organisms: Complex UI components (results table, document viewer, etc.)
 * - Templates: Layout templates for different screens
 * - Pages: Full page components (popup, settings, etc.)
 */

// Export components by category
export * from './atoms';
export * from './molecules';
export * from './organisms';
// Templates and pages will be implemented in future iterations
// export * from './templates';
// export * from './pages';

// Import and re-export styles
import './styles/tailwind.css';
