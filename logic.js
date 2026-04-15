/* ============================
   COOKIE SCIENCE LAB - LOGIC
   Pure functions for data processing, testable without DOM.
   ============================ */

const FLOURS = [
  {
    id: 'almond',
    name: 'Almond Flour',
    emoji: '\u{1F330}',
    color: '#d4a574',
    colorRgb: '212,165,116',
    fact: 'Made from ground almonds. Grain-free and high in protein!',
    science: 'Almond flour is gluten-free and high in fat, which tends to make cookies that spread more and have a delicate, crumbly texture. The natural oils give a rich, nutty flavor.',
    image: 'images/cookie-almond.svg'
  },
  {
    id: 'whole-wheat',
    name: 'Whole Wheat',
    emoji: '\u{1F33E}',
    color: '#a0826d',
    colorRgb: '160,130,109',
    fact: 'Contains the entire wheat grain - bran, germ, and endosperm!',
    science: 'Whole wheat flour has more fiber and protein than all-purpose. The bran can cut through gluten strands, making cookies denser and giving them a hearty, nutty flavor.',
    image: 'images/cookie-whole-wheat.svg'
  },
  {
    id: 'gluten-free',
    name: 'Gluten Free',
    emoji: '\u{1F33F}',
    color: '#7cb342',
    colorRgb: '124,179,66',
    fact: 'Usually a blend of rice flour, tapioca starch, and potato starch.',
    science: 'Without gluten, cookies lack the elastic protein network that traps air. This often results in cookies that are more crumbly and may spread differently during baking.',
    image: 'images/cookie-gluten-free.svg'
  },
  {
    id: 'cake',
    name: 'Cake Flour',
    emoji: '\u{1F382}',
    color: '#f48fb1',
    colorRgb: '244,143,177',
    fact: 'Has the lowest protein content (5-8%) of wheat flours.',
    science: 'Cake flour is finely milled and has less protein, so it forms less gluten. This produces cookies that are tender and soft with a more delicate crumb structure.',
    image: 'images/cookie-cake.svg'
  },
  {
    id: 'bread',
    name: 'Bread Flour',
    emoji: '\u{1F35E}',
    color: '#ffb74d',
    colorRgb: '255,183,77',
    fact: 'High protein (12-14%) flour designed for chewy breads.',
    science: 'Bread flour has more protein/gluten, which creates a stronger structure. Cookies made with bread flour tend to be chewier and puffier with a satisfying bite.',
    image: 'images/cookie-bread.svg'
  },
  {
    id: 'all-purpose',
    name: 'All Purpose',
    emoji: '\u{1F36A}',
    color: '#90a4ae',
    colorRgb: '144,164,174',
    fact: 'The most common flour with ~10-12% protein. The control group!',
    science: 'All-purpose flour is the standard baseline for cookies. It has moderate protein content, producing cookies with a balanced texture - not too chewy, not too crumbly.',
    image: 'images/cookie-all-purpose.svg'
  }
];

const CHART_COLORS = {
  almond: { bg: 'rgba(212,165,116,0.25)', border: '#d4a574' },
  'whole-wheat': { bg: 'rgba(160,130,109,0.25)', border: '#a0826d' },
  'gluten-free': { bg: 'rgba(124,179,66,0.25)', border: '#7cb342' },
  cake: { bg: 'rgba(244,143,177,0.25)', border: '#f48fb1' },
  bread: { bg: 'rgba(255,183,77,0.25)', border: '#ffb74d' },
  'all-purpose': { bg: 'rgba(144,164,174,0.25)', border: '#90a4ae' }
};

function getAvgByFlour(ratings) {
  const result = {};
  FLOURS.forEach(f => {
    const flourRatings = ratings.filter(r => r.flour === f.id);
    if (flourRatings.length === 0) {
      result[f.id] = { crispiness: 0, softness: 0, chewiness: 0, overall: 0, count: 0 };
      return;
    }
    const avg = (arr, key) => arr.reduce((s, r) => s + r[key], 0) / arr.length;
    const crisp = avg(flourRatings, 'crispiness');
    const soft = avg(flourRatings, 'softness');
    const chewy = avg(flourRatings, 'chewiness');
    result[f.id] = {
      crispiness: Math.round(crisp * 10) / 10,
      softness: Math.round(soft * 10) / 10,
      chewiness: Math.round(chewy * 10) / 10,
      overall: Math.round(((crisp + soft + chewy) / 3) * 10) / 10,
      count: flourRatings.length
    };
  });
  return result;
}

function getLeaderboard(ratings) {
  const avgByFlour = getAvgByFlour(ratings);
  return FLOURS
    .map(f => ({ ...f, ...avgByFlour[f.id] }))
    .filter(f => f.count > 0)
    .sort((a, b) => b.overall - a.overall);
}

function getInsights(ratings) {
  const avgByFlour = getAvgByFlour(ratings);
  const withData = FLOURS.filter(f => avgByFlour[f.id].count > 0);

  if (withData.length < 2) return [];

  const insights = [];

  const crispiest = withData.reduce((best, f) =>
    avgByFlour[f.id].crispiness > avgByFlour[best.id].crispiness ? f : best, withData[0]);
  insights.push({
    title: '\u{1F3C6} Crispiest Cookie: ' + crispiest.name,
    dimension: 'crispiness',
    flour: crispiest.id,
    score: avgByFlour[crispiest.id].crispiness
  });

  const softest = withData.reduce((best, f) =>
    avgByFlour[f.id].softness > avgByFlour[best.id].softness ? f : best, withData[0]);
  insights.push({
    title: '\u2601\uFE0F Softest Cookie: ' + softest.name,
    dimension: 'softness',
    flour: softest.id,
    score: avgByFlour[softest.id].softness
  });

  const chewiest = withData.reduce((best, f) =>
    avgByFlour[f.id].chewiness > avgByFlour[best.id].chewiness ? f : best, withData[0]);
  insights.push({
    title: '\u{1F9C0} Chewiest Cookie: ' + chewiest.name,
    dimension: 'chewiness',
    flour: chewiest.id,
    score: avgByFlour[chewiest.id].chewiness
  });

  return insights;
}

function createRating(taster, flourId, crispiness, softness, chewiness) {
  const flour = FLOURS.find(f => f.id === flourId);
  if (!flour) return null;
  if (!taster || typeof taster !== 'string' || taster.trim() === '') return null;
  if ([crispiness, softness, chewiness].some(v => v < 1 || v > 10 || !Number.isInteger(v))) return null;

  return {
    id: Date.now(),
    taster: taster.trim(),
    flour: flour.id,
    flourName: flour.name,
    crispiness,
    softness,
    chewiness,
    timestamp: new Date().toISOString()
  };
}

function ratingsToCSV(ratings) {
  const header = 'Taster,Flour,Crispiness,Softness,Chewiness,Average,Timestamp';
  const rows = ratings.map(r => {
    const avg = ((r.crispiness + r.softness + r.chewiness) / 3).toFixed(1);
    return '"' + r.taster + '","' + r.flourName + '",' + r.crispiness + ',' + r.softness + ',' + r.chewiness + ',' + avg + ',"' + r.timestamp + '"';
  });
  return [header, ...rows].join('\n');
}

function getUniqueFlourIds() {
  return FLOURS.map(f => f.id);
}

function getFlourById(id) {
  return FLOURS.find(f => f.id === id) || null;
}

// Export for Node.js tests; in the browser this is a no-op
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FLOURS,
    CHART_COLORS,
    getAvgByFlour,
    getLeaderboard,
    getInsights,
    createRating,
    ratingsToCSV,
    getUniqueFlourIds,
    getFlourById
  };
}
