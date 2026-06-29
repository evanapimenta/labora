import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { SearchInputComponent } from './search-input.component';

describe('SearchInputComponent', () => {
  let component: SearchInputComponent;
  let fixture: ComponentFixture<SearchInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchInputComponent, FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SearchInputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have default placeholder', () => {
    expect(component.placeholder).toBe('Digite para pesquisar...');
  });

  it('should emit searchChange on input', (done) => {
    component.searchChange.subscribe((value: string) => {
      expect(value).toBe('test search');
      done();
    });

    component.value = 'test search';
    component.onInputChange();
  });

  it('should emit search on enter press', () => {
    spyOn(component.search, 'emit');
    component.value = 'search term';
    component.onEnterPress();
    expect(component.search.emit).toHaveBeenCalledWith('search term');
  });

  it('should accept custom placeholder', () => {
    component.placeholder = 'Buscar laboratórios...';
    expect(component.placeholder).toBe('Buscar laboratórios...');
  });

  it('should handle disabled state', () => {
    component.disabled = true;
    expect(component.disabled).toBeTruthy();
  });
});

