import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';

export interface LegalData { titulo: string; actualizado: string; secciones: { h: string; p: string }[]; }

@Component({
  selector: 'app-legal-page',
  standalone: true,
  imports: [NgFor],
  templateUrl: './legal-page.component.html',
  styleUrl: './legal-page.component.css'
})
export class LegalPageComponent implements OnInit {
  data!: LegalData;
  constructor(private route: ActivatedRoute) {}
  ngOnInit() { this.data = this.route.snapshot.data['contenido'] as LegalData; }
}
