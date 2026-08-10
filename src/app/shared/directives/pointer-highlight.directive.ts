import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appPointerHighlight]',
  standalone: true
})
export class PointerHighlightDirective {

  constructor(private el: ElementRef<HTMLElement>, private renderer: Renderer2) {}

  @HostListener('pointerenter')
  onPointerEnter(): void {
    this.renderer.addClass(this.el.nativeElement, 'pointer-highlight--activo');
  }

  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.renderer.removeClass(this.el.nativeElement, 'pointer-highlight--activo');
  }
}