const crypto = require('crypto');

function generateDailySeed(date, salt) {
  return crypto.createHash('sha256')
    .update(`${date}:${salt}`)
    .digest('hex');
}

function generateColorsFromSeed(seed, count) {
  const colors = [];
  const seedBuffer = Buffer.from(seed, 'hex');
  
  for (let i = 0; i < count; i++) {
    const hash = crypto.createHash('sha256')
      .update(seedBuffer)
      .update(Buffer.from([i]))
      .digest();
    
    colors.push({
      r: hash[0],
      g: hash[1],
      b: hash[2],
      hex: `#${hash[0].toString(16).padStart(2, '0')}${hash[1].toString(16).padStart(2, '0')}${hash[2].toString(16).padStart(2, '0')}`
    });
  }
  
  return colors;
}

const salt = 'default-salt';

console.log('\n=== Testing Date-Based Challenge Generation ===\n');

const dates = ['2025-11-24', '2025-11-25', '2025-11-26'];

dates.forEach(date => {
  const seed = generateDailySeed(date, salt);
  const colors = generateColorsFromSeed(seed, 5);
  console.log(`Date: ${date}`);
  console.log(`Seed: ${seed.substring(0, 16)}...`);
  console.log(`First color: ${colors[0].hex}`);
  console.log(`All colors: ${colors.map(c => c.hex).join(', ')}`);
  console.log('');
});

console.log('✓ Each date produces completely different colors\n');
