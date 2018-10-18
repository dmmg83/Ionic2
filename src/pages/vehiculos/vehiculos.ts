import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, ToastController, Platform } from 'ionic-angular';
import { DatabaseProvider } from '../../providers/database/database';
import { SpeechRecognition } from '@ionic-native/speech-recognition';
import { AlertController } from 'ionic-angular';
import { PrinterProvider } from '../../providers/printer/printer';
import { commands } from '../../providers/printer/printer-commands';
import { NumbersToLettersProvider } from '../../providers/numbers-to-letters/numbers-to-letters'
import { ReciboPage } from '../recibo/recibo';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { SincSetProvider } from '../../providers/sinc-set/sinc-set';
import { PrepararReciboProvider } from '../../providers/preparar-recibo/preparar-recibo';

/**
 * Generated class for the VehiculosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-vehiculos',
  templateUrl: 'vehiculos.html',
})
export class VehiculosPage {

  recibo = {};
  sectores;
  sector: any;
  valorPagar;
  placa;
  puerta;

  tipovehiculos;
  puertas;

  tipovehiculo;

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
    private singleton: SingletonProvider,
    public synset: SincSetProvider,
    private platform: Platform,
    private preprecibo: PrepararReciboProvider
  ) {
    this.inicializarReciboVehiculo();

  }

  inicializarReciboVehiculo() {
    this.recibo["pkidrecibovehiculo"] = -1;
    this.recibo["numerorecibovehiculo"] = this.singleton.usuario["numerorecibo"];
    this.recibo["numeroplaca"] = this.placa;
    this.recibo["valorecibovehiculo"] = 0;
    this.recibo["creacionrecibovehiculo"] = this.fechaAhora;
    this.recibo["modificacionrecibovehiculo"] = this.fechaAhora;
    this.recibo["identificaciontercerovehiculo"] = "";
    this.recibo["fkidtarifavehiculo"] = this.singleton.tipovehiculos["pkidtarifavehiculo"];
    this.recibo["fkidplaza"] = this.singleton.plaza["pkidplaza"];
    this.recibo["fkidtipovehiculo"] = this.singleton.tipovehiculos["pkidtipovehiculo"];
    this.recibo["nombretipovehiculo"] = this.singleton.tipovehiculos["nombretipovehiculo"];
    this.recibo["valortarifa"] = this.valorPagar = this.singleton.tipovehiculos["valortarifavehiculo"];
    this.recibo["nombreplaza"] = this.singleton.plaza["nombreplaza"];
    this.recibo["nombretercerovehiculo"] = "";
    this.recibo["recibovehiculoactivo"] = 1;
    this.recibo["nombresector"] = "";
    this.recibo["fkidsector"] = 0;
    this.recibo["identificacionrecaudador"] = this.singleton.usuario["identificacion"];
    this.recibo["nombrerecaudador"] = this.singleton.usuario["nombreusuario"];
    this.recibo["apellidorecaudador"] = this.singleton.usuario["apellido"];
    this.recibo["fkidusuariorecaudador"] = this.singleton.usuario["pkidusuario"];
    this.recibo["nombrepuerta"] = this.puerta;
    this.recibo["fkidpuerta"] = this.singleton.puerta["pkidpuerta"];
    this.recibo["sincronizado"] = 0;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad VehiculosPage');
    this.sectores = this.singleton.sectoresPlaza;
    this.sector = this.singleton.sector;
    this.tipovehiculos = this.singleton.tipovehiculos;
    this.puertas = this.singleton.puerta;
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
    val = ""+val;
    if (!val) {
      return '';
    }
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

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

  //Alert para mostrar información necesaria
  showToast(data) {
    let toast = this.toastCtrl.create({
      duration: 3000,
      message: data,
      position: 'bottom'
    });
    toast.present();
  }

  seleccionarTipoVehiculo() {
    this.recibo["valortarifa"] = this.valorPagar = this.tipovehiculo["valortarifavehiculo"];
  }

  guardar() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboVehiculo(this.recibo), callback: this.guardarFunc });

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
    this.recibo['valorecibovehiculo'] = this.unFormat("" + this.valorPagar);
    this.recibo['nombretipovehiculo'] = this.tipovehiculo["nombretipovehiculo"];
    this.recibo['fkidtipovehiculo'] = this.tipovehiculo["pkidtipovehiculo"];
    this.recibo['fkidtarifavehiculo'] = this.tipovehiculo["pkidtarifavehiculo"];
    this.recibo['numeroplaca'] = this.placa;
    this.recibo['nombrepuerta'] = this.puerta["nombrepuerta"];
    this.recibo['fkidpuerta'] = this.puerta["pkidpuerta"];
  }

  //Guarda en la tabla trecibovehiculo
  guardarRecibo() {
    this.singleton.usuario["numerorecibo"]++;
    this.databaseprovider.actualizarNumeroRecibo(this.singleton.usuario["pkidsqlite"], this.singleton.usuario["numerorecibo"])
      .then(() => {
        this.databaseprovider.insertarReciboVehiculo(this.recibo).then(() => {
          this.navCtrl.pop();
        }).catch((error) => console.error("error ultimo: ", error.message));
      });


  }

  ////Imprimir
  imprimir() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboVehiculo(this.recibo), callback: this.imprimirFunc });
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

  //Prepara el documeto a imprimir
  prepararImpresion() {


    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(this.valorPagar), 0);
    console.log("valor en letras: " + numeroEnLetras);

    let saldo = Math.abs(parseFloat(this.recibo["valortarifa"]) - parseFloat(this.unFormat(this.valorPagar)));


    let receipt = '';
    receipt += commands.HARDWARE.HW_INIT;
    receipt += commands.HARDWARE.HW_RESET;

    //Titulo    
    receipt += commands.TEXT_FORMAT.TXT_4SQUARE;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += 'ALCALDÍA DE PASTO';
    receipt += commands.EOL;

    //Lema
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += 'Legitimidad, Paticipación y Honestidad';
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;

    //Subtitulo
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += 'DIRECCIÓN ADMINISTRATIVA DE PLAZAS DE MERCADO'.toUpperCase();
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;

    //Tipo de recaudo
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += 'RECAUDO VEHÍCULOS'.toUpperCase();
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;


    //No. Recibo
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
    receipt += commands.TEXT_FORMAT.TXT_2HEIGHT;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'Recibo No.: ' + this.recibo["numerorecibovehiculo"];
    receipt += commands.EOL;

    //Nombre Usuario    
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += commands.EOL;
    receipt += 'Placa:               ' + this.recibo['numeroplaca']; //21 espacios
    let numeroplaca = this.recibo['numeroplaca'];
    console.log("DATO 1: ", numeroplaca);


    //Tipo Parqueadero
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'Tipo Vehículo:       ' + this.recibo['nombretipovehiculo'];
    let nombretipovehiculo = this.recibo['nombretipovehiculo'];
    console.log("DATO 1: ", nombretipovehiculo);


    //Tarifa
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'Tarifa:              $ ' + this.format("" + this.recibo["valortarifa"]);

    //Valor pagado
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'Valor Pagado:        $ ' + this.format(this.valorPagar);

    //Valor en letras
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += '(' + numeroEnLetras + ')';

    // Saldo
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;

    if (saldo == 0) {
      console.log("sIN SALDO")
      receipt += 'Saldo:               $ 0';
    } else {
      receipt += 'Saldo:               $ ' + this.format(saldo);
      console.log("Sobre: ", this.format(saldo));

    }


    receipt += commands.EOL;

    //Espacio
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += '---';


    //Fecha de Abono
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'Fecha de Abono:      ' + this.recibo["creacionrecibovehiculo"];
    //console.log("fechaAbono: " + this.fechaAbono);

    //Recaudador
    let recaudador = this.recibo["nombrerecaudador"] + " " + this.recibo["apellidorecaudador"]
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'RECAUDADOR:          ' + recaudador;
    console.log("AQUI Rec: ", recaudador);


    //Espacio para el pie de pagina
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += '---';

    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ITALIC_ON
    receipt += 'Saque copia y guarde este recibo como soporte de pago';
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += '      ';
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.EOL;


    this.printer.iniciarImpresion(receipt, this.alertCtrl, this.loadCtrl, this.toastCtrl);

    this.guardarRecibo();

  }



}
