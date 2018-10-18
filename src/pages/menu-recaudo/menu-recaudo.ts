import { PesajeGanadoPage } from './../pesaje-ganado/pesaje-ganado';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController } from 'ionic-angular';
import { PlazasPage } from '../plazas/plazas';
import { ConsultaRecaudosPage } from '../consulta-recaudos/consulta-recaudos';
import { RecaudoPuestosEventualesPage } from '../recaudo-puestos-eventuales/recaudo-puestos-eventuales';
import { ParqueaderosPage } from '../parqueaderos/parqueaderos';
import { VehiculosPage } from '../vehiculos/vehiculos';
import { SingletonProvider } from '../../providers/singleton/singleton';


/**
 * Generated class for the MenuRecaudoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-menu-recaudo',
  templateUrl: 'menu-recaudo.html',
})
export class MenuRecaudoPage {
  
  
  constructor(
    public navCtrl: NavController, 
    public navParams: NavParams, 
    public myToastCtrl: ToastController,
    private singleton: SingletonProvider,
  ) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad MenuRecaudoPage');
  }

  //Direcciona a la pagina Recaudo de puestos fijos
  goToMenuRecaudoPuestosFijosPage(){
    this.navCtrl.push(ConsultaRecaudosPage);
  }

   //Direcciona a la pagina Recaudo de puestos eventuales
   goToMenuRecaudoPuestosEventualesPage(){
    this.navCtrl.push(RecaudoPuestosEventualesPage);
  }

  //Direcciona a la pagina Recaudo de parqueaderos
  goToParqueaderoPage(){
    this.navCtrl.push(ParqueaderosPage);
  }

  //Direcciona a la pagina pesaje de ganado
  goToPesajeGanadoPage(){
    this.navCtrl.push(PesajeGanadoPage);
  }

  //Direcciona a la pagina recaudo vehículo
  goToVehiculosPage(){
    this.navCtrl.push(VehiculosPage);
  }


  //Mensaje para botones que aun estan en desarrollo
  msjEnDesarrollo() {
    let toast = this.myToastCtrl.create({
      message: 'Sección en Desarrollo' ,
      duration: 3000,
      position: 'bottom'
    });

    toast.onDidDismiss(() => {
      console.log('toast Dismissed');
    });

    toast.present();
  }


  goToMenu(idMenu) {
    if (idMenu == 1) {
      this.navCtrl.push(ConsultaRecaudosPage);

    } else if (idMenu == 2) {
      this.navCtrl.push(PesajeGanadoPage);

    } else if (idMenu == 3) {
      this.navCtrl.push(RecaudoPuestosEventualesPage);


    } else if (idMenu == 4) {
      this.navCtrl.push(ParqueaderosPage);


    } else if (idMenu == 5) {
    

    } else if (idMenu == 6) {
      this.navCtrl.push(VehiculosPage);

    }
  }
}
