import { bootstrapApplication } from '@angular/platform-browser';
import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  template: `
  <div style="font-family: Inter, Arial, sans-serif; padding: 32px">
    <h1>Berjis Logistics</h1>
    <p>Frontend shell is ready. Authentication and features will integrate with api.berjis.tech.</p>
  </div>
  `
})
class AppComponent {}

bootstrapApplication(AppComponent).catch(err => console.error(err));
