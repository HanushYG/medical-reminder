const jwt = require('jsonwebtoken');

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OGUxNjJhNzVlMThiZjMyZTRkZmYzZWQiLCJpYXQiOjE3NTk2MDIzMjQsImV4cCI6MTc1OTY4ODcyNH0.Udxq2X_tCF0SSYluVFdfT67mm60YeVymWIxC1PCi58Q';

try {
  const decoded = jwt.decode(token);
  console.log('Decoded token:', JSON.stringify(decoded, null, 2));
} catch (error) {
  console.error('Error decoding token:', error);
}
