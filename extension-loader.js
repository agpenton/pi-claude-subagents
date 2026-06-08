// Extension Loader for Pi.dev
// This file wraps the actual extension code and loads it in Pi.dev context

import * as extensionCode from './dist/index.js';

export default function(api) {
   console.log('Extension loader called');
   console.log('Loading main extension...');
   
   // Call the main extension function
   if (typeof extensionCode.default === 'function') {
      return extensionCode.default(api);
    } else {
      console.error('Extension does not have default export');
      return null;
    }
}
