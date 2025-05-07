// @ts-ignore
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// A simple test file to check if the application can compile correctly
async function testCompile() {
  console.log('Testing compilation...');
  
  try {
    // Create a Nest application with the AppModule
    const app = await NestFactory.create(AppModule);
    console.log('NestFactory.create successful');
    
    // Initialize the application (without actually starting the server)
    await app.init();
    console.log('App initialization successful');
    
    // Clean up
    await app.close();
    console.log('Test compilation successful!');
  } catch (error) {
    console.error('Compilation test failed:', error);
    throw error;
  }
}

// Execute the test
testCompile()
  .then(() => {
    console.log('Compilation test completed successfully');
    // Use process.exit in a type-safe way
    if (process) (process as any).exit(0);
  })
  .catch(error => {
    console.error('Compilation test failed with error:', error);
    // Use process.exit in a type-safe way
    if (process) (process as any).exit(1);
  });