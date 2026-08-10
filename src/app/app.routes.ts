import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { ServiciosPageComponent } from './pages/servicios-page/servicios-page.component';
import { ProductosPageComponent } from './pages/productos-page/productos-page.component';
import { NosotrosPageComponent } from './pages/nosotros-page/nosotros-page.component';
import { ContactoPageComponent } from './pages/contacto-page/contacto-page.component';
import { SubpageComponent } from './pages/subpage/subpage.component';
import { SUBPAGES } from './pages/subpage/subpage-data';
import { BuscarPageComponent } from './pages/buscar-page/buscar-page.component';
import { LegalPageComponent } from './pages/legal-page/legal-page.component';
import { AVISO_PRIVACIDAD, TERMINOS_CONDICIONES } from './pages/legal-page/legal-data';
import { FaqPageComponent } from './pages/faq-page/faq-page.component';
import { SucursalesPageComponent } from './pages/sucursales-page/sucursales-page.component';
import { NosotrosComponent } from './main/nosotros/nosotros.component';
import { TestimoniosComponent } from './main/testimonios/testimonios.component';
import { CitasAdminComponent } from './pages/editor-page/citas-admin/citas-admin.component';
// ── Auth ──────────────────────────────────────────────────────────────
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { RegisterPageComponent } from './pages/register-page/register-page.component';
import { PerfilPageComponent } from './pages/perfil-page/perfil-page.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { EditorPageComponent } from './pages/editor-page/editor-page.component';
import { ProductosAdminComponent } from './pages/editor-page/productos-admin/productos-admin.component';
import { AccesoDenegadoPageComponent } from './pages/acceso-denegado-page/acceso-denegado-page.component';
import { authGuard } from './auth/guards/auth.guard';
import { roleGuard } from './auth/guards/role.guard';

// ── Layouts ───────────────────────────────────────────────────────────
import { PublicLayoutComponent } from '../app/layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from '../app/layouts/admin-layout/admin-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayoutComponent,
    children: [
      { path: '', component: HomeComponent, title: 'Óptica Convicción — Inicio' },

      // ===== Páginas principales =====
      { path: 'servicios', component: ServiciosPageComponent, title: 'Servicios — Óptica Convicción' },
      { path: 'productos', component: ProductosPageComponent, title: 'Productos — Óptica Convicción' },
      { path: 'nosotros', component: NosotrosPageComponent, title: 'Nosotros — Óptica Convicción' },
      { path: 'contacto', component: ContactoPageComponent, title: 'Contacto — Óptica Convicción' },

      // ===== Subpáginas de dropdown =====
      { path: 'servicios/examen-visual', component: SubpageComponent, data: { contenido: SUBPAGES['examen-visual'] }, title: 'Examen visual — Óptica Convicción' },
      { path: 'servicios/mantenimiento', component: SubpageComponent, data: { contenido: SUBPAGES['mantenimiento'] }, title: 'Mantenimiento — Óptica Convicción' },
      { path: 'servicios/venta-de-lentes', component: SubpageComponent, data: { contenido: SUBPAGES['venta-de-lentes'] }, title: 'Venta de lentes — Óptica Convicción' },
      { path: 'servicios/atencion-especializada', component: SubpageComponent, data: { contenido: SUBPAGES['atencion-especializada'] }, title: 'Atención especializada — Óptica Convicción' },

      { path: 'nosotros/quienes-somos', component: NosotrosComponent, title: 'Quiénes somos — Óptica Convicción' },
      { path: 'nosotros/sucursales', component: SucursalesPageComponent, title: 'Sucursales — Óptica Convicción' },
      { path: 'nosotros/testimonios', component: TestimoniosComponent, title: 'Testimonios — Óptica Convicción' },

      // ===== Buscador =====
      { path: 'buscar', component: BuscarPageComponent, title: 'Buscar — Óptica Convicción' },

      // ===== Páginas legales/complementarias =====
      { path: 'aviso-de-privacidad', component: LegalPageComponent, data: { contenido: AVISO_PRIVACIDAD }, title: 'Aviso de Privacidad — Óptica Convicción' },
      { path: 'terminos-y-condiciones', component: LegalPageComponent, data: { contenido: TERMINOS_CONDICIONES }, title: 'Términos y Condiciones — Óptica Convicción' },
      { path: 'preguntas-frecuentes', component: FaqPageComponent, title: 'Preguntas Frecuentes — Óptica Convicción' },

      // ===== Autenticación =====
      { path: 'login', component: LoginPageComponent, title: 'Iniciar sesión — Óptica Convicción' },
      { path: 'register', component: RegisterPageComponent, title: 'Crear cuenta — Óptica Convicción' },
      { path: 'acceso-denegado', component: AccesoDenegadoPageComponent, title: 'Acceso denegado' },
    ]
  },

  // ===== Panel privado: SIN navbar/footer público =====
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'perfil', component: PerfilPageComponent, title: 'Mi perfil', canActivate: [authGuard] },
      { path: 'admin', component: AdminPageComponent, title: 'Administrador', canActivate: [roleGuard], data: { roles: ['Administrador'] } },
      { path: 'editor', component: EditorPageComponent, title: 'Editor', canActivate: [roleGuard], data: { roles: ['Administrador', 'Editor'] } },
      { path: 'editor/productos', component: ProductosAdminComponent, title: 'Administrar productos', canActivate: [roleGuard], data: { roles: ['Administrador', 'Editor'] } },
      { path: 'editor/citas', component: CitasAdminComponent, title: 'Solicitudes de citas', canActivate: [roleGuard], data: { roles: ['Administrador', 'Editor'] } },
    ]
  },

  { path: '**', redirectTo: '' },
];