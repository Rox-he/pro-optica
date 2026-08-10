import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../auth/services/auth.service';

@Component({
  selector: 'app-editor-page',
  standalone: true,
  imports: [RouterLink, NgIf],
  templateUrl: './editor-page.component.html',
  styleUrl: './editor-page.component.css'
})
export class EditorPageComponent {
  constructor(public auth: AuthService) {}
}