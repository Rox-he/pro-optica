import { Component, Input, ElementRef, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-contador',
  standalone: true,
  templateUrl: './contador.component.html',
  styleUrl: './contador.component.css'
})
export class ContadorComponent implements AfterViewInit {
  @Input() target = 0;
  @Input() label = '';
  valorActual = 0;

  constructor(private el: ElementRef) {}

  ngAfterViewInit() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animar();
          observer.unobserve(this.el.nativeElement);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(this.el.nativeElement);
  }

  animar() {
    const duration = 1200;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      this.valorActual = Math.floor(progress * this.target);
      if (progress < 1) requestAnimationFrame(step);
      else this.valorActual = this.target;
    };
    requestAnimationFrame(step);
  }
}
