import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DevToolbarComponent } from './components/dev-toolbar/dev-toolbar.component';
import { environment } from '../environments/environment';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, DevToolbarComponent],
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  isDark = false;
  private auth = inject(CoreAuthService);
  environment = environment;
  ngOnInit(): void {
    // Warm up auth like landing does
    this.auth.ensureAuth().catch(()=>{});
    const persisted = (localStorage.getItem('theme') || '').toLowerCase();
    const preferDark = persisted === 'dark';
    this.setTheme(preferDark ? 'dark' : 'light');
  }
  toggleTheme() { this.setTheme(this.isDark ? 'light' : 'dark'); }
  private setTheme(mode: 'light' | 'dark') {
    this.isDark = mode === 'dark';
    document.documentElement.classList.toggle('dark', mode === 'dark');
    try { localStorage.setItem('theme', mode); } catch {}
  }
}
import { CoreAuthService } from './core/auth.service';
