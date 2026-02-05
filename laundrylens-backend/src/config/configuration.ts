export default () => ({
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',

  database: {
    url: process.env.DATABASE_URL,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  },

  frontend: {
    url: process.env.FRONTEND_URL || 'http://localhost:5173',
  },
});
