import 'dotenv/config';
import fs from 'fs';
import dotenv from 'dotenv';

function parseEnvExample(): string[] {
  const envExample = fs.readFileSync('.env.example', 'utf8');
  const envVars = dotenv.parse(envExample);
  return Object.keys(envVars);
}

function checkEnvVariables(requiredVars: string[]): boolean {
  console.log(requiredVars);
  console.log(process.env);
  const missingVars = requiredVars.filter((varName) => !process.env[varName]);

  if (missingVars.length > 0) {
    console.error('Missing required environment variables:');
    missingVars.forEach((varName) => console.error(`- ${varName}`));
    return false;
  }

  return true;
}

function main() {
  const requiredVars = parseEnvExample();
  const allVarsPresent = checkEnvVariables(requiredVars);

  if (!allVarsPresent) {
    process.exit(1);
  }
}

main();
