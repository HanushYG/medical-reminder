#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🔧 MongoDB Atlas Setup Helper\n');

rl.question('Enter your MongoDB Atlas password: ', (password) => {
  if (!password || password.trim() === '') {
    console.log('❌ Password cannot be empty!');
    rl.close();
    return;
  }

  // Read the current config
  const configPath = path.join(__dirname, 'config.env');
  let config = fs.readFileSync(configPath, 'utf8');
  
  // Replace the password placeholder
  config = config.replace('YOUR_PASSWORD', password.trim());
  
  // Write back the config
  fs.writeFileSync(configPath, config);
  
  console.log('✅ MongoDB password configured successfully!');
  console.log('🚀 You can now start the server with: npm start');
  
  rl.close();
});


