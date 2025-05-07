// @ts-ignore
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';

// @ts-ignore - Ignore all type errors in this test file
async function testSimple() {
  console.log('Testing simple imports...');
  // @ts-ignore
  const configService = new ConfigService();
  // @ts-ignore
  const jwtService = new JwtService({});
  // Other services...
  
  // Test ConfigService methods with generic parameters
  // @ts-ignore
  const value: string = configService.get<string>('test', 'default');
  console.log('Value:', value);
  
  // Test JwtService methods
  // @ts-ignore
  const token = jwtService.sign({ id: 1 });
  // @ts-ignore
  const verified = await jwtService.verifyAsync(token);
  console.log('Token:', token);
  console.log('Verified:', verified);
}

// Execute the test
testSimple().catch(error => {
  console.error('Test failed with error:', error);
});