import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NosotrosComponent } from '../../main/nosotros/nosotros.component';
import { TestimoniosComponent } from '../../main/testimonios/testimonios.component';

@Component({
  selector: 'app-nosotros-page',
  standalone: true,
  imports: [NosotrosComponent, TestimoniosComponent],
  templateUrl: './nosotros-page.component.html',
})
export class NosotrosPageComponent implements OnInit {
  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.fragment.subscribe(fragment => {
      if (!fragment) return;
      setTimeout(() => {
        const el = document.getElementById(fragment);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 0);
    });
  }
}