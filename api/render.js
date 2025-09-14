import { createRequire } from 'module';
import { join } from 'path';

// Use createRequire to handle dynamic imports in Vercel environment
const require = createRequire(import.meta.url);

let angularAppFn;

export default async function render(req, res) {
  try {
    // Lazy load the Angular server function
    if (!angularAppFn) {
      // Try multiple possible paths for the server file
      const possiblePaths = [
        join(process.cwd(), 'spicy-fairytales', 'dist', 'spicy-fairytales', 'server', 'server.mjs'),
        join(process.cwd(), 'dist', 'spicy-fairytales', 'server', 'server.mjs'),
        './spicy-fairytales/dist/spicy-fairytales/server/server.mjs'
      ];
      
      let serverModule;
      for (const serverPath of possiblePaths) {
        try {
          serverModule = await import(serverPath);
          break;
        } catch (err) {
          continue;
        }
      }
      
      if (!serverModule) {
        throw new Error('Angular server module not found');
      }
      
      // Extract the app function from the Angular server
      angularAppFn = serverModule.app || serverModule.default;
      
      if (typeof angularAppFn !== 'function') {
        throw new Error('Angular server module does not export a function');
      }
    }

    // Call the Angular SSR function directly
    return angularAppFn(req, res);
    
  } catch (error) {
    console.error('Angular SSR Error:', error);
    
    // Return a simple error response
    res.status(500).json({
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'production' 
        ? 'Something went wrong' 
        : error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}