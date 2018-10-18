import { Component } from '@angular/core';
import { NavController, AlertController, ToastController, LoadingController, NavParams, DateTime } from 'ionic-angular';
import { PrinterProvider } from '../../providers/printer/printer';
import { commands } from '../../providers/printer/printer-commands';
import { NumbersToLettersProvider } from '../../providers/numbers-to-letters/numbers-to-letters'
import { SeparadorMilesProvider } from './../../providers/separador-miles/separador-miles';
import { FechaProvider } from '../../providers/fecha/fecha';
import { MenuPrincipalPage } from '../menu-principal/menu-principal';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { PrepararReciboProvider } from '../../providers/preparar-recibo/preparar-recibo';

/**
 * Generated class for the RecaudoPuestosFijosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@Component({
  selector: 'page-recaudo-puestos-fijos',
  templateUrl: 'recaudo-puestos-fijos.html',
})
export class RecaudoPuestosFijosPage {

  respuesta: string;

  valorAbonoCuota = "0";

  factura;
  recibo = {};
  usuario;
  sectores;
  sector;
  saldo;

  fechaAhora: any = new Date().toISOString();

  //valores con miles
  totalpagar
  constructor(public navCtrl: NavController, public navParams: NavParams,
    public alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    public databaseprovider: DatabaseProvider,
    public speechRecognition: SpeechRecognition,
    private printer: PrinterProvider,
    private conversion: NumbersToLettersProvider,
    private storage: Storage,
    private singleton: SingletonProvider,
    private prepRecibo: PrepararReciboProvider) {

    this.factura = this.navParams.get("factura");

    this.factura = this.navParams.get("factura");

  }

  ionViewDidLoad() {
    try {
      this.sectores = this.singleton.sectoresPlaza;
      this.usuario = this.singleton.usuario;
      this.sector = this.singleton.sector;
      // this.factura = this.navParams.get("factura");

      if (this.factura) {
        this.recibo["numerofactura"] = this.factura["numerofactura"];
        this.recibo["nombrebeneficiario"] = this.factura["nombrebeneficiario"];
        this.recibo["identificacionbeneficiario"] = this.factura["identificacionbeneficiario"];
        this.recibo["saldo"] = this.factura["saldoasignacion"];
        this.recibo["numeroacuerdo"] = this.factura["numeroacuerdo"];
        this.recibo["valorcuotaacuerdo"] = this.factura["valorcuotaacuerdo"];
        this.recibo["valormultas"] = this.factura["valormultas"];
        this.recibo["valorinteres"] = this.factura["valorinteres"];
        this.recibo["mesfactura"] = this.factura["mesfacturanumero"];
        this.recibo["creacionrecibo"] = new Date().toLocaleString();
        this.recibo["modificacionrecibo"] = new Date().toLocaleString();
        this.recibo["pkidrecibopuesto"] = -1

        this.recibo["fkidfactura"] = this.factura["pkidfactura"];
        this.recibo["numerorecibo"] = this.singleton.usuario["numerorecibo"];
        this.recibo["nombreterceropuesto"] = null;
        this.recibo["identificacionterceropuesto"] = null;
        this.recibo["nombreplaza"] = this.singleton.plaza["nombreplaza"];
        this.recibo["recibopuestoactivo"] = 1
        this.recibo["numeroresolucionasignacionpuesto"] = null;
        this.recibo["numeropuesto"] = this.factura["nombrepuesto"]
        this.recibo["nombresector"] = this.factura["nombresector"]
        this.recibo["fkidzona"] = this.factura["fkidzona"]
        this.recibo["fkidsector"] = this.factura["fkidsector"]
        this.recibo["fkidpuesto"] = this.factura["fkidpuesto"]
        this.recibo["fkidasignacionpuesto"] = this.factura["fkidasignacionpuesto"]
        this.recibo["fkidplaza"] = this.singleton.plaza["pkidplaza"];
        this.recibo["fkidbeneficiario"] = 1;
        this.recibo["fkidacuerdo"] = this.factura["fkidacuerdo"]
        this.recibo["identificacionrecaudador"] = this.singleton.usuario["identificacion"];
        this.recibo["nombrerecaudador"] = this.singleton.usuario["nombreusuario"];
        this.recibo["apellidorecaudador"] = this.singleton.usuario["apellido"];
        this.recibo["fkidusuariorecaudador"] = this.singleton.usuario["pkidusuario"]
        this.recibo["valorpagado"] = 10000
        this.recibo["saldoporpagar"] = -10000
        this.recibo["nombrezona"] = this.factura["nombrezona"]
        this.recibo["abonototalacuerdo"] = 0;
        this.recibo["abonocuotaacuerdo"] = 0;
        this.recibo["abonodeudaacuerdo"] = 0;
        this.recibo["abonodeuda"] = 0;
        this.recibo["abonomultas"] = 0;
        this.recibo["abonocuotames"] = 0;
        //extras
        this.recibo['sincronizado'] = 0;
        this.recibo['fkidtercero'] = -1;
        this.recibo['telefonotercero'] = null;
        this.valorAbonoCuota = this.factura["totalapagarmes"];
        this.saldo = 0;
      }


      //this.databaseprovider.insertarReciboPuesto(this.recibo);
    } catch (error) {

    }

  }

  ver() {
    let obj = this.prepRecibo.armarFactura(this.factura);
    this.navCtrl.push("ReciboPage", { datosRecibo: obj, callback: this.imprimirFunc, esRecibo: false });
  }
  guardar() {
    this.navCtrl.push("ReciboPage", { datosRecibo: this.prepRecibo.armarReciboPuestoFijo(this.recibo), callback: this.guardarFunc });
    this.databaseprovider.actualizarNumeroRecibo(this.singleton.usuario["pkidsqlite"], this.recibo["numerorecibo"]);
  }

  guardarFunc = (resultado) => {
    return new Promise((resolve, reject) => {
      if (resultado) {
        this.guardarRecibo();

      }
      else {
        console.log("no guardar");
      }
      resolve();
    });
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


  addTercero() {

    this.databaseprovider.addTercero(this.recibo['identificacionterceropuesto'], this.recibo['nombreterceropuesto'], this.recibo['telefonotercero'], new Date().toLocaleString(),  new Date().toLocaleString(), -1, "Eventual")

      .then(data => {
        // this.loadTercerosData();
      });

  }
  
  //Editar registros desde el formulario
  updateTercero() {
    this.databaseprovider.updateTercero(this.recibo['nombreterceropuesto'], this.recibo['telefonotercero'], new Date().toLocaleString(), this.recibo['identificacionterceropuesto'])

      .then(data => {
        // this.loadTercerosData();
      });
  }

  guardarRecibo() {

    if (this.recibo["fkidtercero"] == -1) {
      this.addTercero();
    }
    else {
      this.updateTercero();

    }

    this.databaseprovider.insertarReciboPuesto(this.recibo).then(() => {
      this.navCtrl.pop();
    }).catch((error) => console.error("error ultimo: ", error.message));
  }

  buscarTercero() {
    console.log("buscar: ", this.recibo['identificacionterceropuesto']);
    this.databaseprovider.getTercero(this.recibo['identificacionterceropuesto']).then(tercero => {

      if (tercero) {
        this.recibo['nombreterceropuesto'] = tercero["nombretercero"];
        this.recibo['fkidtercero'] = tercero["pkidsqlite"];
      }

    })
      .catch(error => {
        console.log("No existe, hay que agregarlo!");
      });
    console.log(this.recibo['nombreterceropuesto']);
  }

}