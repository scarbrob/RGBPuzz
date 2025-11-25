const express = require('express');
const cors = require('cors');
const { generateDailySeed, generateColorsFromSeed, createColorToken, rgbToValue } = require('./dist/utils/colorGenerator');

const app = express();
const PORT = 7071;

app.use(cors());
app.use(express.json());

// GET /api/daily-challenge
app.get('/api/daily-challenge', (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colorCount = 5;
    
    const seed = generateDailySeed(today, salt);
    const colors = generateColorsFromSeed(seed, colorCount);
    
    const colorTokens = colors.map((color, index) => ({
      id: `color-${index}`,
      hash: createColorToken(color, index, salt),
      hex: `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`,
    }));
    
    const shuffled = [...colorTokens].sort(() => Math.random() - 0.5);
    
    res.json({
      date: today,
      colorTokens: shuffled,
      maxAttempts: colorCount,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/validate-solution
app.post('/api/validate-solution', (req, res) => {
  try {
    const { date, orderedTokenIds } = req.body;
    
    if (!date || !orderedTokenIds || !Array.isArray(orderedTokenIds)) {
      return res.status(400).json({ error: 'Invalid request body' });
    }
    
    const salt = process.env.DAILY_CHALLENGE_SALT || 'default-salt';
    const colorCount = 5;
    
    const seed = generateDailySeed(date, salt);
    const colors = generateColorsFromSeed(seed, colorCount);
    
    const correctOrder = colors
      .map((color, index) => ({ id: `color-${index}`, value: rgbToValue(color) }))
      .sort((a, b) => a.value - b.value)
      .map(item => item.id);
    
    const correct = JSON.stringify(orderedTokenIds) === JSON.stringify(correctOrder);
    
    const correctPositions = orderedTokenIds
      .map((id, index) => correctOrder[index] === id ? index : -1)
      .filter(index => index !== -1);
    
    res.json({
      correct,
      correctPositions,
      solved: correct,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`\n🎨 RGBPuzz API running at http://localhost:${PORT}`);
  console.log(`   GET  http://localhost:${PORT}/api/daily-challenge`);
  console.log(`   POST http://localhost:${PORT}/api/validate-solution\n`);
});
