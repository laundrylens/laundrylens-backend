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

  it('should return jwt config', () => {
    process.env.JWT_SECRET = 'test-secret';
    process.env.JWT_EXPIRES_IN = '1d';
    const config = configuration();

    expect(config.jwt.secret).toBe('test-secret');
    expect(config.jwt.expiresIn).toBe('1d');
  });

  it('should return oauth config', () => {
    process.env.KAKAO_CLIENT_ID = 'kakao-id';
    process.env.GOOGLE_CLIENT_ID = 'google-id';
    const config = configuration();

    expect(config.kakao.clientId).toBe('kakao-id');
    expect(config.google.clientId).toBe('google-id');
  });
});
