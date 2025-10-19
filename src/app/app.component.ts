import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DevToolbarComponent } from './components/dev-toolbar/dev-toolbar.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, DevToolbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
