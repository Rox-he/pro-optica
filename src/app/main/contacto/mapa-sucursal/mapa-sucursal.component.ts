import { Component, Input, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-mapa-sucursal',
  standalone: true,
  templateUrl: './mapa-sucursal.component.html',
  styleUrl: './mapa-sucursal.component.css'
})
export class MapaSucursalComponent implements OnInit {
  @Input() direccion = '';
  @Input() nombreSucursal = '';
  mapaUrl: SafeResourceUrl = '';

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    // Embed de Google Maps sin necesidad de API key
    const query = encodeURIComponent(this.direccion);
    const url = `https://www.google.com/maps?q=${query}&output=embed`;
    this.mapaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
