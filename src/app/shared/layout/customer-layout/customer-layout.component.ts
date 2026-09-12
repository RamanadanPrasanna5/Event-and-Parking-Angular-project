import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../components/navbar/navbar.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { MobileBottomNavComponent } from '../../components/mobile-bottom-nav/mobile-bottom-nav.component';

@Component({
  selector: 'app-customer-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, FooterComponent, MobileBottomNavComponent],
  template: `
    <div class="customer-layout-wrapper d-flex flex-column min-vh-100 pb-5 pb-md-0">
      <app-navbar></app-navbar>
      <main class="customer-main-content flex-grow-1">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
      <app-mobile-bottom-nav></app-mobile-bottom-nav>
    </div>
  `,
  styles: [`
    .customer-layout-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
    }
    .customer-main-content {
      flex: 1 0 auto;
    }
  `]
})
export class CustomerLayoutComponent {}
