import configuration from './configuration';

describe('Configuration', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('should return default values when env vars are not set', () => {
    delete process.env.PORT;
    delete process.env.FRONTEND_URL;
    const config = configuration();

    expect(config.port).toBe(3000);
    expect(config.frontend.url).toBe('http://localhost:5173');
  });

  it('should return custom port when PORT is set', () => {
    process.env.PORT = '4000';
    const config = configuration();

    expect(config.port).toBe(4000);
  });

  it('should return database config', () => {
    process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    const config = configuration();

    expect(config.database.url).toBe(
      'postgresql://test:test@localhost:5432/test',
    );
  });

  it('should return openai config', () => {
    process.env.OPENAI_API_KEY = 'test-api-key';
    const config = configuration();

    expect(config.openai.apiKey).toBe('test-api-key');
  });

  it('should return frontend config', () => {
    process.env.FRONTEND_URL = 'https://example.com';
    const config = configuration();

    expect(config.frontend.url).toBe('https://example.com');
  });
});
