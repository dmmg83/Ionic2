import { MenuPrincipalPage } from './../pages/menu-principal/menu-principal';
import { MenuConsultasPage } from './../pages/menu-consultas/menu-consultas';
import { HomePage } from './../pages/home/home';
import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { RecaudoPuestosEventualesPage } from './../pages/recaudo-puestos-eventuales/recaudo-puestos-eventuales';
import { RecaudoPuestosFijosPage } from './../pages/recaudo-puestos-fijos/recaudo-puestos-fijos';
import { PlazasPage } from '../pages/plazas/plazas';
import { ConfiguracionesPage } from './../pages/configuraciones/configuraciones';
import { timer } from 'rxjs/observable/timer';
import { ParqueaderosPage } from '../pages/parqueaderos/parqueaderos';
import { PesajeGanadoPage } from '../pages/pesaje-ganado/pesaje-ganado';
import { ReciboPage } from '../pages/recibo/recibo';
import { VehiculosPage } from '../pages/vehiculos/vehiculos';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;
  showSplash = true;

  constructor(platform: Platform, statusBar: StatusBar, splashScreen: SplashScreen) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();

      timer(3000).subscribe(() => this.showSplash = false)
    });
  }
}