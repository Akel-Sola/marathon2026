import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthenticationService } from './authentication.service';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';

describe('AuthenticationService', () => {
  let service: AuthenticationService;

  beforeEach(() => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), { provide: API_BASE_URL, useValue: 'https://test.api' }],
    });
    service = TestBed.inject(AuthenticationService);
  });

  afterEach(() => {
    localStorage.removeItem('auth');
    localStorage.removeItem('user');
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('registers a demo user locally without a backend token', () => {
    const result = service.registerDemo('Demo', 'User', 'demo@example.com');

    expect(result.success).toBeTrue();
    expect(result.isDemo).toBeTrue();
    expect(JSON.parse(localStorage.getItem('auth')!)).toEqual({ demo: true });
    expect(JSON.parse(localStorage.getItem('user')!)).toEqual({
      id: 'demo-user',
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      role: 'Customer',
    });
    expect(service.getUser()?.email).toBe('demo@example.com');
    expect(service.getTokens()).toBeNull();
  });

  it('creates a local demo account when backend registration returns an HTTP error', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response('', { status: 503 }));
    spyOn(console, 'warn');

    const result = await service.register('Demo', 'User', 'demo@example.com', 'password', 'password');

    expect(result).toEqual({ success: true, isDemo: true });
    expect(service.getUser()?.email).toBe('demo@example.com');
  });

  it('uses the backend registration response when it succeeds', async () => {
    spyOn(window, 'fetch').and.resolveTo(new Response('', { status: 201 }));

    const result = await service.register('Demo', 'User', 'demo@example.com', 'password', 'password');

    expect(result).toEqual({ success: true });
    expect(service.getUser()).toBeNull();
  });

  it('creates a local demo account when backend registration has a network error', async () => {
    spyOn(window, 'fetch').and.rejectWith(new Error('Network unavailable'));
    spyOn(console, 'warn');

    const result = await service.register('Demo', 'User', 'demo@example.com', 'password', 'password');

    expect(result).toEqual({ success: true, isDemo: true });
    expect(service.getUser()?.email).toBe('demo@example.com');
  });
});
