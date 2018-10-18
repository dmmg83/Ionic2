import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { AlertController } from 'ionic-angular';
import { PrinterProvider } from '../../providers/printer/printer';
import { commands } from '../../providers/printer/printer-commands';
import { NumbersToLettersProvider } from '../../providers/numbers-to-letters/numbers-to-letters'
import { Storage } from '@ionic/storage';
import { ReciboPage } from '../recibo/recibo';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { SincSetProvider } from '../../providers/sinc-set/sinc-set';
import { PrepararReciboProvider } from '../../providers/preparar-recibo/preparar-recibo';


/**
 * Generated class for the RecaudoPuestosEventualesPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-recaudo-puestos-eventuales',
  templateUrl: 'recaudo-puestos-eventuales.html',
})
export class RecaudoPuestosEventualesPage {

  recibo = {};
  sectores;
  sector;
  valorPagar;
  tarifa;
  

  fechaAhora: any = new Date().toISOString();


  //Separador de miles
  DECIMAL_SEPARATOR = ",";
  GROUP_SEPARATOR = ".";
  budget = 0;


  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public alertCtrl: AlertController,
    private loadCtrl: LoadingController,
    private toastCtrl: ToastController,
    public databaseprovider: DatabaseProvider,
    public speechRecognition: SpeechRecognition,
    private printer: PrinterProvider,
    private conversion: NumbersToLettersProvider,
    private storage: Storage,
    private singleton: SingletonProvider,
    public synset: SincSetProvider,
    private preprecibo: PrepararReciboProvider

  ) {
    this.inicializarReciboEventual();
  }

  inicializarReciboEventual() {
    this.recibo["pkidrecibopuestoeventual"] = -1;
    this.recibo["numerorecibopuestoeventual"] = this.singleton.usuario["numerorecibo"];
    this.recibo["valorecibopuestoeventual"] = 0;
    this.recibo["creacionrecibopuestoeventual"] = this.fechaAhora;
    this.recibo["modificacionrecibopuestoeventual"] = this.fechaAhora;
    this.recibo["identificacionterceropuestoeventual"] = "";
    this.recibo["fkidtarifapuestoeventual"] = this.singleton.tarifapuestoeventual["pkidtarifapuestoeventual"];
    this.recibo["fkidplaza"] = this.singleton.plaza["pkidplaza"];
    this.recibo["valortarifa"] = this.valorPagar = this.singleton.tarifapuestoeventual["valortarifapuestoeventual"];
    this.recibo["nombreplaza"] = this.singleton.plaza["nombreplaza"];
    this.recibo["nombreterceropuestoeventual"] = "";
    this.recibo["recibopuestoeventualactivo"] = 1;
    this.recibo["nombresector"] = "";
    this.recibo["fkidsector"] = 0;
    this.recibo["identificacionrecaudador"] = this.singleton.usuario["identificacion"];
    this.recibo["nombrerecaudador"] = this.singleton.usuario["nombreusuario"];
    this.recibo["apellidorecaudador"] = this.singleton.usuario["apellido"];
    this.recibo["fkidusuariorecaudador"] = this.singleton.usuario["pkidusuario"];
    this.recibo["sincronizado"] = 0;
    //extras
    this.recibo["fkidtercero"] = -1;

  }

  ionViewDidLoad() {
    this.sectores = this.singleton.sectoresPlaza;
    this.sector = this.singleton.sector;
    this.tarifa = this.singleton.tarifapuestoeventual;
  }

  //para miles  
  format(valString) {
    if (!valString) {
      return '';
    }
    let val = valString.toString();
    const parts = this.unFormat(val).split(this.DECIMAL_SEPARATOR);
    return parts[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, this.GROUP_SEPARATOR)

  };

  unFormat(val) {
    if (!val) {
      return '';
    }
    val = "" + val;
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

  buscarTercero() {
    console.log("buscar: ", this.recibo['identificacionterceropuestoeventual']);
    this.databaseprovider.getTercero(this.recibo['identificacionterceropuestoeventual']).then(tercero => {
      if (tercero) {
        this.recibo['nombreterceropuestoeventual'] = tercero["nombretercero"];
        this.recibo['fkidtercero'] = tercero["pkidsqlite"];
      }
    })
      .catch(error => {
        console.log("No existe, hay que agregarlo!");
      });
    console.log(this.recibo['nombreterceropuestoeventual']);
  }

  audioValor() {

    // Request permissions
    this.speechRecognition.requestPermission()
      .then(
        () => console.log('Granted'),
        () => console.log('Denied')
      )
    this.speechRecognition.isRecognitionAvailable()
      .then((available: boolean) => console.log(available))

    // Start the recognition process
    this.speechRecognition.startListening()
      .subscribe(
        (matches: Array<string>) => {
          let aux = '';
          matches.forEach(element => {
            aux = element;
            //console.log("AUX", aux);
          });
          this.valorPagar = aux;

        },
        (onerror) => console.log('error:', onerror)
      )

  }


  buscarIdTercero() {
    this.buscarTercero();

  }

  //Agrega registros desde el formulario

  addTercero() {
    let tercero = {};
    tercero["identificaciontercero"] = this.recibo['identificacionterceropuestoeventual'];
    tercero["nombretercero"] = this.recibo['nombreterceropuestoeventual'];
    tercero["creaciontercero"] = tercero["modificaciontercero"] = this.fechaAhora;
    tercero["tipotercero"] = "Eventual";
    this.databaseprovider.insertarTercero(tercero)
      .then(data => {
        // this.loadTercerosData();
      });
  }

  //Editar registros desde el formulario
  updateTercero() {
    this.databaseprovider.updateTercero(this.recibo['nombreterceropuestoeventual'], this.recibo['telefonotercero'], this.fechaAhora, this.recibo['identificacionterceropuestoeventual'])

      .then(data => {
        //this.loadTercerosData();
      });
  }


  //Alert para mostrar información necesaria
  showToast(data) {
    let toast = this.toastCtrl.create({
      duration: 3000,
      message: data,
      position: 'bottom'
    });
    toast.present();
  }

  imprimir() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboEventual(this.recibo), callback: this.imprimirFunc });
  }
  
  imprimirFunc = (resultado) => {
    return new Promise((resolve, reject) => {
      if (resultado) {
        this.prepararImpresion();
      }
      else {
        console.log("no imprimir");
      }

      resolve();
    });
  }

  guardar() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboEventual(this.recibo), callback: this.guardarFunc });

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

  private fijarDAtos() {
    this.recibo['valorecibopuestoeventual'] = this.unFormat("" + this.valorPagar);
    this.recibo['nombresector'] = this.sector["nombresector"];
    this.recibo['fkidsector'] = this.sector["pkidsector"];
    this.recibo['fkidtarifapuestoeventual'] = this.tarifa["pkidtarifapuestoeventual"];
    this.recibo['valortarifapuestoeventual'] = this.tarifa["valortarifapuestoeventual"];
  }

  //Prepara el documeto a imprimir
  prepararImpresion() {



    this.printer.prepararImpresion(this.recibo, this.alertCtrl, this.loadCtrl, this.toastCtrl);

    this.guardarRecibo();

  }

  //Guarda en la tabla treciboeventual
  guardarRecibo() {


    if (this.recibo["fkidtercero"] == -1) {
      this.addTercero();


    }
    else {
      this.updateTercero();
    }


    this.databaseprovider.addReciboEventual(this.recibo['pkidrecibopuestoeventual'],
      this.recibo['numerorecibopuestoeventual'],
      this.recibo['valorecibopuestoeventual'],
      this.recibo['creacionrecibopuestoeventual'],
      this.recibo['modificacionrecibopuestoeventual'],
      this.recibo['identificacionterceropuestoeventual'],
      this.recibo['fkidtarifapuestoeventual'],
      this.recibo['fkidplaza'],
      this.recibo['valortarifa'],
      this.recibo['nombreplaza'],
      this.recibo['nombreterceropuestoeventual'],
      this.recibo['recibopuestoeventualactivo'],
      this.recibo['nombresector'],
      this.recibo['fkidsector'],
      this.recibo['identificacionrecaudador'],
      this.recibo['nombrerecaudador'],
      this.recibo['apellidorecaudador'],
      this.recibo['fkidusuariorecaudador'],
      this.recibo['sincronizado']).then(() => {
        this.singleton.usuario["numerorecibo"]++;
        this.databaseprovider.actualizarNumeroRecibo(this.singleton.usuario["pkidsqlite"], this.singleton.usuario["numerorecibo"]);

        this.navCtrl.pop();
      }).catch((error) => console.error("error ultimo: ", error.message));

  }

}