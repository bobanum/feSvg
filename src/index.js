import './Node.js'; // Import to register custom element
import { NodeEditor } from './NodeEditor.js';

/**
 * Application entry point
 */
class App {
  constructor() {
    this.editor = null;
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  async start() {
    // console.log('🎨 feSvg - Visual SVG Filter Editor');
    // console.log('Starting node editor...');

    // Wait for custom element to be defined
    await customElements.whenDefined('filter-node');

    // Initialize the node editor
    this.editor = new NodeEditor('nodes-container');

    // Expose editor to window for debugging
    window.editor = this.editor;

    // console.log('✅ Editor ready!');
    // console.log('💡 Tips:');
    // console.log('  - Drag nodes by their header');
    // console.log('  - Drag from output ports (right) to input ports (left) to create connections');
    // console.log('  - Click nodes or connections to select them');
    // console.log('  - Press Delete or Backspace to remove selected items');
    // console.log('  - Use editor.exportGraph() in console to export current graph');
  }
}

// Initialize the application
new App();
