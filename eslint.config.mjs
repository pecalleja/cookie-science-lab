export default [
  {
    files: ['logic.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        document: 'readonly',
        window: 'readonly',
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
        exports: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: 'warn',
      'no-eval': 'error'
    }
  },
  {
    files: ['app.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: {
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        alert: 'readonly',
        confirm: 'readonly',
        setTimeout: 'readonly',
        URL: 'readonly',
        Blob: 'readonly',
        Chart: 'readonly',
        console: 'readonly',
        parseInt: 'readonly',
        // Globals from logic.js
        FLOURS: 'readonly',
        CHART_COLORS: 'readonly',
        getAvgByFlour: 'readonly',
        getLeaderboard: 'readonly',
        getInsights: 'readonly',
        createRating: 'readonly',
        ratingsToCSV: 'readonly',
        getUniqueFlourIds: 'readonly',
        getFlourById: 'readonly'
      }
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
      'no-redeclare': 'error',
      eqeqeq: 'warn',
      'no-eval': 'error'
    }
  }
];
