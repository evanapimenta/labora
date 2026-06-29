import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { PatientController } from '../../core/controllers/patient.controller';
import { UserController } from '../../core/controllers/user.controller';
import { of } from 'rxjs';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockPatientController: jasmine.SpyObj<PatientController>;
  let mockUserController: jasmine.SpyObj<UserController>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const patientSpy = jasmine.createSpyObj('PatientController', ['getById']);
    const userSpy = jasmine.createSpyObj('UserController', ['getById']);

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: PatientController, useValue: patientSpy },
        { provide: UserController, useValue: userSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    mockRouter = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    mockPatientController = TestBed.inject(PatientController) as jasmine.SpyObj<PatientController>;
    mockUserController = TestBed.inject(UserController) as jasmine.SpyObj<UserController>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit sidebarToggle when onSidebarToggle is called', () => {
    spyOn(component.sidebarToggle, 'emit');
    component.onSidebarToggle();
    expect(component.sidebarToggle.emit).toHaveBeenCalled();
  });

  it('should toggle user dropdown when toggleUserDropdown is called', () => {
    expect(component.isUserDropdownOpen).toBeFalse();
    component.toggleUserDropdown();
    expect(component.isUserDropdownOpen).toBeTrue();
    component.toggleUserDropdown();
    expect(component.isUserDropdownOpen).toBeFalse();
  });

  it('should logout and navigate to sign-in when logout is called', () => {
    spyOn(localStorage, 'removeItem');
    component.logout();
    expect(localStorage.removeItem).toHaveBeenCalledWith('access');
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/sign-in']);
    expect(component.isUserDropdownOpen).toBeFalse();
  });

  it('should have initial user profile data structure', () => {
    expect(component.userProfile.name).toBeDefined();
    expect(component.userProfile.avatar).toContain('profile.png');
  });

  it('should handle search change events', () => {
    spyOn(console, 'log');
    component.onSearchChange('test search');
    expect(console.log).toHaveBeenCalledWith('Search term changed:', 'test search');
  });

  it('should handle search events', () => {
    spyOn(console, 'log');
    component.onSearch('test search');
    expect(console.log).toHaveBeenCalledWith('Search executed:', 'test search');
  });
});
