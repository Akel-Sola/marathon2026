import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RegisterComponent } from './register.component';
import { API_BASE_URL } from '@app/shared/config/api-base-url.token';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { AuthenticationService } from '@app/auth/services/authentication.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let isDemoMode: boolean;

  beforeEach(async () => {
    isDemoMode = false;
    await TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: 'https://test.api' },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              get queryParamMap() {
                return convertToParamMap(isDemoMode ? { demo: '' } : {});
              },
            },
          },
        },
      ],
      imports: [RegisterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('registers and signs in locally when the demo query parameter is present', async () => {
    isDemoMode = true;
    const auth = TestBed.inject(AuthenticationService);
    const registerSpy = spyOn(auth, 'register').and.resolveTo({ success: true });
    const demoRegisterSpy = spyOn(auth, 'registerDemo').and.returnValue({ success: true });
    component.registerForm.setValue({
      firstName: 'Demo',
      lastName: 'User',
      email: 'demo@example.com',
      password: 'Secure@123',
      confirmPassword: 'Secure@123',
    });

    await component.onSubmit();

    expect(demoRegisterSpy).toHaveBeenCalledWith('Demo', 'User', 'demo@example.com');
    expect(registerSpy).not.toHaveBeenCalled();
    expect(component.registrationSuccessful).toBeTrue();
  });
});
