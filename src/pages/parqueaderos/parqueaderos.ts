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
 * Generated class for the ParqueaderosPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-parqueaderos',
  templateUrl: 'parqueaderos.html',
})
export class ParqueaderosPage {

  recibo = {};
  valorPagar;
  parqueadero;
  parqueaderos;

  //Separador de miles
  DECIMAL_SEPARATOR = ",";
  GROUP_SEPARATOR = ".";
  budget = 0;

  fechaAhora: any = new Date().toISOString();


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
    this.inicializarReciboParqueadero();    
  }

  inicializarReciboParqueadero() {
    this.recibo["pkidreciboparqueadero"] = -1;
    this.recibo["numeroreciboparqueadero"] = this.singleton.usuario["numerorecibo"];
    this.recibo["valoreciboparqueadero"] = 0;
    this.recibo["creacionreciboparqueadero"] = this.fechaAhora;
    this.recibo["modificacionreciboparqueadero"] = this.fechaAhora;
    this.recibo["identificacionterceroparqueadero"] = "";
    this.recibo["fkidtarifaparqueadero"] = this.singleton.parqueadero["pkidtarifaparqueadero"];
    this.recibo["fkidplaza"] = this.singleton.plaza["pkidplaza"];
    this.recibo["valortarifa"] = this.valorPagar = this.singleton.parqueadero["valortarifaparqueadero"];
    this.recibo["nombreplaza"] = this.singleton.plaza["nombreplaza"];
    this.recibo["fkidparqueadero"] = this.singleton.parqueadero["pkidparqueadero"];
    this.recibo["fkidtipoparqueadero"] = this.singleton.parqueadero["pkidtipoparqueadero"];
    this.recibo["numeroparqueadero"] = this.singleton.parqueadero["numeroparqueadero"];
    this.recibo["nombretipoparqueadero"] = this.singleton.parqueadero["nombretipoparqueadero"];
    this.recibo["nombreterceroparqueadero"] = "";
    this.recibo["reciboparqueaderoactivo"] = 1;
    this.recibo["identificacionrecaudador"] = this.singleton.usuario["identificacion"];
    this.recibo["nombrerecaudador"] = this.singleton.usuario["nombreusuario"];
    this.recibo["apellidorecaudador"] = this.singleton.usuario["apellido"];
    this.recibo["fkidusuariorecaudador"] = this.singleton.usuario["pkidusuario"];
    this.recibo["sincronizado"] = 0;
    //extras
    this.recibo["fkidtercero"] = -1;

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad ParqueaderosPage');
    this.parqueadero = this.singleton.parqueadero;

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

  seleccionarTipoParqueadero() {
    this.recibo["valortarifa"] = this.valorPagar = this.parqueaderos["valortarifaparqueadero"];
  }


  buscarTercero() {
    console.log("buscar: ", this.recibo['identificacionterceroparqueadero']);
    this.databaseprovider.getTercero(this.recibo['identificacionterceroparqueadero']).then(tercero => {
      if (tercero) {
        this.recibo['nombreterceroparqueadero'] = tercero["nombretercero"];
        this.recibo['fkidtercero'] = tercero["pkidsqlite"];
      }
    })
      .catch(error => {
        console.log("No existe, hay que agregarlo!");
      });
    console.log(this.recibo['nombreterceroparqueadero']);
  }

  //Agrega registros desde el formulario

  addTercero() {
    let tercero = {};
    tercero["identificaciontercero"] = this.recibo['identificacionterceroparqueadero'];
    tercero["nombretercero"] = this.recibo['nombreterceroparqueadero'];
    tercero["creaciontercero"] = tercero["modificaciontercero"] = this.fechaAhora;
    tercero["tipotercero"] = "Eventual";
    this.databaseprovider.insertarTercero(tercero)
      .then(data => {
        // this.loadTercerosData();
      });
  }

  //Editar registros desde el formulario
  updateTercero() {
    this.databaseprovider.updateTercero(this.recibo['nombreterceroparqueadero'], this.recibo['telefonotercero'], this.fechaAhora, this.recibo['identificacionterceroparqueadero'])

      .then(data => {
        //this.loadTercerosData();
      });
  }


  guardar() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboParqueadero(this.recibo), callback: this.guardarFunc });

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
    this.recibo['valoreciboparqueadero'] = this.unFormat("" + this.valorPagar);
    this.recibo['fkidparqueadero'] = this.parqueaderos["pkidparqueadero"];
    this.recibo['nombretipoparqueadero'] = this.parqueaderos["nombretipoparqueadero"];
    this.recibo['fkidtipoparqueadero'] = this.parqueaderos["pkidtipoparqueadero"];
    this.recibo['fkidtarifaparqueadero'] = this.parqueaderos["pkidtarifaparqueadero"];
    this.recibo['numeroparqueadero'] = this.parqueaderos["numeroparqueadero"];
  }

  //Guarda en la tabla treciboparqueadero
  guardarRecibo() {


    if (this.recibo["fkidtercero"] == -1) {
      this.addTercero();


    }
    else {
      this.updateTercero();
    }

    this.singleton.usuario["numerorecibo"]++;
    this.databaseprovider.insertarReciboParqueadero(this.recibo).then(() => {
      this.databaseprovider.actualizarNumeroRecibo(this.singleton.usuario["pkidsqlite"], this.singleton.usuario["numerorecibo"]);
      this.navCtrl.pop();
    }).catch((error) => console.error("error ultimo: ", error.message));

  }

  ////Imprimir
  imprimir() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboParqueadero(this.recibo), callback: this.imprimirFunc });
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
    receipt += 'RECAUDO DE PARQUEADERO'.toUpperCase();
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;


    //No. Recibo
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
    receipt += commands.TEXT_FORMAT.TXT_2HEIGHT;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'Recibo No.: ' + this.recibo["numeroreciboparqueadero"];
    receipt += commands.EOL;

    //Nombre Usuario    
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += commands.EOL;
    receipt += 'Nombre Usuario:      ' + this.recibo['nombreterceroparqueadero']; //21 espacios
    let nomtercero = this.recibo['nombreterceroparqueadero'];
    console.log("DATO 1: ", nomtercero);


    //CC Usuario
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'CC:                  ' + this.recibo['identificacionterceroparqueadero'];
    let idtercero = this.recibo['identificacionterceroparqueadero'];
    console.log("DATO 1: ", idtercero);

    //Tipo Parqueadero
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'TIPO PARQUEADERO:    ' + this.recibo['nombretipoparqueadero'];
    let nomtipoparqueadero = this.recibo['nombretipoparqueadero'];
    console.log("DATO 1: ", nomtipoparqueadero);

    //Número Parqueadero
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'No. PARQUEADERO:     ' + this.recibo['numeroparqueadero'];
    let numeroparqueadero = this.recibo['numeroparqueadero'];
    console.log("DATO 1: ", numeroparqueadero);


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
    receipt += 'Fecha de Abono:      ' + this.recibo["creacionreciboparqueadero"];
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