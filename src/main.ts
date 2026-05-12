import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { registerLicense } from '@syncfusion/ej2-base';
import { AppModule } from './app/app.module';
import 'zone.js';  // Required by Angular

// Register Syncfusion EJ2 License Key
// Replace with your actual license key from https://www.syncfusion.com/downloads/support-portal
registerLicense('Ngo9BigBOggjHTQxAR8/V1JHaF1cXmhMYVFzWmFZfVhgdV9FYlZUQGY/P1ZhSXxVdkFhXH5dc3dVR2dVU0V9XEE=');

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

// if (this.environment.production) {
//   enableProdMode();
// }

platformBrowserDynamic(providers).bootstrapModule(AppModule);
