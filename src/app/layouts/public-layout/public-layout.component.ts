import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../../header/navbar/navbar.component';
import { PromoBannerComponent } from '../../header/promo-banner/promo-banner.component';
import { FooterComponent } from '../../footer/footer.component';

@Component({
  selector: 'app-public-layout',
  standalone: true,
  imports: [RouterOutlet, NavbarComponent, PromoBannerComponent, FooterComponent],
  templateUrl: './public-layout.component.html'
})
export class PublicLayoutComponent {}
