const {
  FLOURS,
  CHART_COLORS,
  getAvgByFlour,
  getLeaderboard,
  getInsights,
  createRating,
  ratingsToCSV,
  getUniqueFlourIds,
  getFlourById
} = require('./logic');

// ---- Test helpers ----
function makeRating(flour, crispiness, softness, chewiness, taster) {
  return {
    id: Date.now() + Math.random(),
    taster: taster || 'Tester',
    flour,
    flourName: FLOURS.find(f => f.id === flour).name,
    crispiness,
    softness,
    chewiness,
    timestamp: new Date().toISOString()
  };
}

// ---- FLOURS data ----
describe('FLOURS data', () => {
  test('contains exactly 6 flour types', () => {
    expect(FLOURS).toHaveLength(6);
  });

  test('each flour has required fields', () => {
    FLOURS.forEach(f => {
      expect(f).toHaveProperty('id');
      expect(f).toHaveProperty('name');
      expect(f).toHaveProperty('emoji');
      expect(f).toHaveProperty('color');
      expect(f).toHaveProperty('fact');
      expect(f).toHaveProperty('science');
      expect(f).toHaveProperty('image');
    });
  });

  test('flour IDs are unique', () => {
    const ids = FLOURS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test('all expected flour types are present', () => {
    const ids = FLOURS.map(f => f.id);
    expect(ids).toContain('almond');
    expect(ids).toContain('whole-wheat');
    expect(ids).toContain('gluten-free');
    expect(ids).toContain('cake');
    expect(ids).toContain('bread');
    expect(ids).toContain('all-purpose');
  });
});

// ---- CHART_COLORS ----
describe('CHART_COLORS', () => {
  test('has an entry for every flour', () => {
    FLOURS.forEach(f => {
      expect(CHART_COLORS).toHaveProperty(f.id);
      expect(CHART_COLORS[f.id]).toHaveProperty('bg');
      expect(CHART_COLORS[f.id]).toHaveProperty('border');
    });
  });
});

// ---- getFlourById ----
describe('getFlourById', () => {
  test('returns correct flour for valid id', () => {
    const flour = getFlourById('bread');
    expect(flour).not.toBeNull();
    expect(flour.name).toBe('Bread Flour');
  });

  test('returns null for invalid id', () => {
    expect(getFlourById('nonexistent')).toBeNull();
  });
});

// ---- getUniqueFlourIds ----
describe('getUniqueFlourIds', () => {
  test('returns 6 ids', () => {
    expect(getUniqueFlourIds()).toHaveLength(6);
  });
});

// ---- getAvgByFlour ----
describe('getAvgByFlour', () => {
  test('returns zeros for empty ratings', () => {
    const result = getAvgByFlour([]);
    FLOURS.forEach(f => {
      expect(result[f.id].crispiness).toBe(0);
      expect(result[f.id].softness).toBe(0);
      expect(result[f.id].chewiness).toBe(0);
      expect(result[f.id].overall).toBe(0);
      expect(result[f.id].count).toBe(0);
    });
  });

  test('computes correct averages for single rating', () => {
    const ratings = [makeRating('bread', 8, 4, 9)];
    const result = getAvgByFlour(ratings);
    expect(result['bread'].crispiness).toBe(8);
    expect(result['bread'].softness).toBe(4);
    expect(result['bread'].chewiness).toBe(9);
    expect(result['bread'].overall).toBe(7);
    expect(result['bread'].count).toBe(1);
  });

  test('computes correct averages for multiple ratings', () => {
    const ratings = [
      makeRating('cake', 2, 8, 3),
      makeRating('cake', 4, 6, 5)
    ];
    const result = getAvgByFlour(ratings);
    expect(result['cake'].crispiness).toBe(3);
    expect(result['cake'].softness).toBe(7);
    expect(result['cake'].chewiness).toBe(4);
    expect(result['cake'].count).toBe(2);
  });

  test('rounds to one decimal place', () => {
    const ratings = [
      makeRating('almond', 7, 3, 5),
      makeRating('almond', 8, 4, 6),
      makeRating('almond', 7, 3, 5)
    ];
    const result = getAvgByFlour(ratings);
    expect(result['almond'].crispiness).toBe(7.3);
    expect(result['almond'].softness).toBe(3.3);
    expect(result['almond'].chewiness).toBe(5.3);
  });

  test('does not mix ratings across flour types', () => {
    const ratings = [
      makeRating('bread', 10, 10, 10),
      makeRating('cake', 1, 1, 1)
    ];
    const result = getAvgByFlour(ratings);
    expect(result['bread'].overall).toBe(10);
    expect(result['cake'].overall).toBe(1);
    expect(result['almond'].count).toBe(0);
  });
});

// ---- getLeaderboard ----
describe('getLeaderboard', () => {
  test('returns empty array for no ratings', () => {
    expect(getLeaderboard([])).toHaveLength(0);
  });

  test('sorts flours by overall score descending', () => {
    const ratings = [
      makeRating('bread', 8, 8, 8),
      makeRating('cake', 3, 3, 3),
      makeRating('almond', 6, 6, 6)
    ];
    const board = getLeaderboard(ratings);
    expect(board).toHaveLength(3);
    expect(board[0].id).toBe('bread');
    expect(board[1].id).toBe('almond');
    expect(board[2].id).toBe('cake');
  });

  test('only includes flours with ratings', () => {
    const ratings = [makeRating('bread', 5, 5, 5)];
    const board = getLeaderboard(ratings);
    expect(board).toHaveLength(1);
    expect(board[0].id).toBe('bread');
  });
});

// ---- getInsights ----
describe('getInsights', () => {
  test('returns empty for less than 2 flour types', () => {
    const ratings = [makeRating('bread', 8, 8, 8)];
    expect(getInsights(ratings)).toHaveLength(0);
  });

  test('returns insights for 2+ flour types', () => {
    const ratings = [
      makeRating('bread', 3, 5, 9),
      makeRating('cake', 8, 9, 2)
    ];
    const insights = getInsights(ratings);
    expect(insights.length).toBeGreaterThanOrEqual(3);
  });

  test('correctly identifies crispiest flour', () => {
    const ratings = [
      makeRating('bread', 3, 5, 9),
      makeRating('cake', 8, 9, 2)
    ];
    const insights = getInsights(ratings);
    const crispiest = insights.find(i => i.dimension === 'crispiness');
    expect(crispiest.flour).toBe('cake');
    expect(crispiest.score).toBe(8);
  });

  test('correctly identifies chewiest flour', () => {
    const ratings = [
      makeRating('bread', 3, 5, 9),
      makeRating('cake', 8, 9, 2)
    ];
    const insights = getInsights(ratings);
    const chewiest = insights.find(i => i.dimension === 'chewiness');
    expect(chewiest.flour).toBe('bread');
  });

  test('correctly identifies softest flour', () => {
    const ratings = [
      makeRating('bread', 3, 5, 9),
      makeRating('cake', 8, 9, 2)
    ];
    const insights = getInsights(ratings);
    const softest = insights.find(i => i.dimension === 'softness');
    expect(softest.flour).toBe('cake');
  });
});

// ---- createRating ----
describe('createRating', () => {
  test('creates a valid rating object', () => {
    const r = createRating('Alice', 'bread', 7, 5, 8);
    expect(r).not.toBeNull();
    expect(r.taster).toBe('Alice');
    expect(r.flour).toBe('bread');
    expect(r.flourName).toBe('Bread Flour');
    expect(r.crispiness).toBe(7);
    expect(r.softness).toBe(5);
    expect(r.chewiness).toBe(8);
    expect(r.timestamp).toBeDefined();
    expect(r.id).toBeDefined();
  });

  test('trims whitespace from taster name', () => {
    const r = createRating('  Bob  ', 'cake', 5, 5, 5);
    expect(r.taster).toBe('Bob');
  });

  test('rejects empty taster name', () => {
    expect(createRating('', 'bread', 5, 5, 5)).toBeNull();
    expect(createRating('   ', 'bread', 5, 5, 5)).toBeNull();
  });

  test('rejects invalid flour id', () => {
    expect(createRating('Alice', 'unicorn-flour', 5, 5, 5)).toBeNull();
  });

  test('rejects scores out of range', () => {
    expect(createRating('Alice', 'bread', 0, 5, 5)).toBeNull();
    expect(createRating('Alice', 'bread', 11, 5, 5)).toBeNull();
    expect(createRating('Alice', 'bread', 5, 0, 5)).toBeNull();
    expect(createRating('Alice', 'bread', 5, 5, 11)).toBeNull();
  });

  test('rejects non-integer scores', () => {
    expect(createRating('Alice', 'bread', 5.5, 5, 5)).toBeNull();
  });
});

// ---- ratingsToCSV ----
describe('ratingsToCSV', () => {
  test('returns header only for empty array', () => {
    const csv = ratingsToCSV([]);
    expect(csv).toBe('Taster,Flour,Crispiness,Softness,Chewiness,Average,Timestamp');
  });

  test('generates correct CSV rows', () => {
    const ratings = [makeRating('bread', 8, 4, 6, 'Alice')];
    const csv = ratingsToCSV(ratings);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(2);
    expect(lines[0]).toBe('Taster,Flour,Crispiness,Softness,Chewiness,Average,Timestamp');
    expect(lines[1]).toContain('"Alice"');
    expect(lines[1]).toContain('"Bread Flour"');
    expect(lines[1]).toContain('8,4,6');
    expect(lines[1]).toContain('6.0');
  });

  test('handles multiple rows', () => {
    const ratings = [
      makeRating('bread', 8, 4, 6, 'Alice'),
      makeRating('cake', 3, 9, 2, 'Bob')
    ];
    const csv = ratingsToCSV(ratings);
    const lines = csv.split('\n');
    expect(lines).toHaveLength(3);
  });
});
