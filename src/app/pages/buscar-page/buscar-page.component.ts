import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NgFor, NgIf } from '@angular/common';

interface ResultadoBusqueda {
  tipo: 'Servicio' | 'Producto' | 'Sucursal';
  titulo: string;
  descripcion: string;
  link: string;
}

// Catálogo local usado SOLO como fallback si el backend de búsqueda no responde
// (por ejemplo, en este mockup académico sin servidor real).
const CATALOGO_LOCAL: ResultadoBusqueda[] = [
  { tipo: 'Servicio', titulo: 'Examen visual', descripcion: 'Diagnóstico computarizado de agudeza visual y salud ocular.', link: '/servicios/examen-visual' },
  { tipo: 'Servicio', titulo: 'Mantenimiento', descripcion: 'Limpieza y ajuste de armazón sin costo adicional.', link: '/servicios/mantenimiento' },
  { tipo: 'Servicio', titulo: 'Venta de lentes', descripcion: 'Armazones de diseñador y lentes de contacto.', link: '/servicios/venta-de-lentes' },
  { tipo: 'Servicio', titulo: 'Atención especializada', descripcion: 'Asesoría personalizada para niños y adultos mayores.', link: '/servicios/atencion-especializada' },
  { tipo: 'Producto', titulo: 'Armazones', descripcion: 'Monturas de diseñador en distintos estilos y materiales.', link: '/productos/armazones' },
  { tipo: 'Producto', titulo: 'Lentes de contacto', descripcion: 'Diarios, mensuales y de color, con adaptación incluida.', link: '/productos/lentes-de-contacto-producto' },
  { tipo: 'Producto', titulo: 'Accesorios', descripcion: 'Estuches, cordones y kits de limpieza.', link: '/productos/accesorios' },
  { tipo: 'Sucursal', titulo: 'Lomas de San Pedrito', descripcion: 'Av. Belén 802, 76158 Santiago de Querétaro, Qro.', link: '/nosotros/sucursales' },
  { tipo: 'Sucursal', titulo: 'Nacional', descripcion: 'Av. Pie de la Cuesta 2504, 76148 Santiago de Querétaro, Qro.', link: '/nosotros/sucursales' },
];

@Component({
  selector: 'app-buscar-page',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  templateUrl: './buscar-page.component.html',
  styleUrl: './buscar-page.component.css'
})
export class BuscarPageComponent implements OnInit {
  query = '';
  resultados: ResultadoBusqueda[] = [];
  cargando = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      this.buscar(this.query);
    });
  }

  async buscar(q: string) {
    this.cargando = true;
    try {
      // ──────────────────────────────────────────────────────────────
      // INTEGRACIÓN DE ELASTICSEARCH (backend, fuera del alcance de este
      // mockup académico): este endpoint llamaría a un índice de
      // Elasticsearch con los documentos de servicios, productos y
      // sucursales, usando una consulta "multi_match" sobre los campos
      // titulo/descripcion para obtener resultados con relevancia (score).
      //
      // Ejemplo de la consulta que haría el backend a Elasticsearch:
      //   POST /catalogo-oc/_search
      //   { "query": { "multi_match": {
      //       "query": "<q>", "fields": ["titulo^2", "descripcion"] } } }
      // ──────────────────────────────────────────────────────────────
      const resp = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (!resp.ok) throw new Error('sin backend');
      this.resultados = await resp.json();
    } catch {
      // Fallback local: filtra el catálogo en memoria (sin Elasticsearch)
      const term = q.toLowerCase();
      this.resultados = CATALOGO_LOCAL.filter(r =>
        r.titulo.toLowerCase().includes(term) || r.descripcion.toLowerCase().includes(term)
      );
    } finally {
      this.cargando = false;
    }
  }
}
