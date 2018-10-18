import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ToastController, LoadingController } from 'ionic-angular';
import { RecaudoPuestosFijosPage } from '../recaudo-puestos-fijos/recaudo-puestos-fijos';
import { Storage } from '@ionic/storage';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { DatabaseProvider } from '../../providers/database/database';
import { PrepararReciboProvider } from '../../providers/preparar-recibo/preparar-recibo';

/**
 * Generated class for the ConsultaRecaudosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-consulta-recaudos',
  templateUrl: 'consulta-recaudos.html',
})

export class ConsultaRecaudosPage {
  plazas;
  sectores;
  facturas;
  plazaSeleccionada;
  sectorSeleccionado;

  numPuesto: string = "";
  ccBeneficiario: string = "";


  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    private databaseprovider: DatabaseProvider,
    private singleton: SingletonProvider,
    private prepRecibo: PrepararReciboProvider) {

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ConsultagenericaPage');

    this.plazas = this.singleton.plazas;
    this.sectores = this.singleton.sectoresPlaza;
    this.plazaSeleccionada = this.singleton.plaza;
    this.sectorSeleccionado = this.singleton.sector;

  }

  acerto(item) {
    this.showToast("numero recibo: " + item["norecibo"]);
  }

  imprimir(recibo) {
    // if (this.tipoConsulta == "eventual") {
    //   let obj=this.prepRecibo.armarReciboEventual(recibo);
    //   this.navCtrl.push("ReciboPage", { datosRecibo:obj, callback: this.imprimirFunc });
    // }
  }

  imprimirFunc = (resultado) => {
    return new Promise((resolve, reject) => {
      if (resultado) {
        //this.prepararImpresion();        
      }
      else {
        console.log("no imprimir");
      }

      resolve();
    });
  }

  anular(recibo) {
    // if (recibo["sincronizado"] == "Sincronizado") {
    //   this.showToast("El recibo ya fue sincronizado, no se puede anular.");
    //   return;
    // }
    // else if (recibo["estado"] == "ANULADO") {
    //   this.showToast("El recibo ya está anulado.");
    //   return;
    // }
    // if (this.tipoConsulta == "eventual") {
    //   this.databaseprovider.anularReciboEventual(recibo["pkidsqlite"]).then((datos) => {
    //     this.showToast("Se anuló el recibo.");
    //   }).catch((e) => {
    //     if (!e.message) {
    //       recibo["estado"] = "ANULADO";
    //       this.showToast("Se anuló el recibo.");
    //     }
    //   });
    // }
  }

  buscar() {
    let idplaza = -1;
    if (this.plazaSeleccionada && this.plazaSeleccionada["pkidplaza"] != undefined) {
      idplaza = this.plazaSeleccionada["pkidplaza"];
      //this.facturas = this.databaseprovider.getFacturasPrueba()
      this.databaseprovider.getAllFacturas().then(data => {
        this.facturas = data;
      })
    }
    //console.log("plaza " +  + "; numrecibo " +this.numRecibo.trim()+ "; identifica " + this.datoExtra.trim());

    // if (this.tipoConsulta == "eventual") {
    //   this.databaseprovider.consultaReciboEventual(idplaza, this.numRecibo.trim(), this.datoExtra.trim()).then((datos) => {
    //     this.recibos = datos;
    //   }).catch((e) => console.error(e.message)
    //   );
    // }
  }

  ver(factura) {
    let obj = this.prepRecibo.armarFactura(factura);
    this.navCtrl.push("ReciboPage", { datosRecibo: obj, callback: this.imprimirFunc, esRecibo: false });
  }

  pagar(factura) {
    //let obj=this.prepRecibo.armarFactura(factura);
    this.navCtrl.push(RecaudoPuestosFijosPage, { factura: factura });
  }

  showToast(data) {
    let toast = this.toastCtrl.create({
      duration: 3000,
      message: data,
      position: 'bottom'
    });
    toast.present();
  }
}