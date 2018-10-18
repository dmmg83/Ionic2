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
import { PrepararReciboProvider } from '../../providers/preparar-recibo/preparar-recibo';




/**
 * Generated class for the PesajeGanadoPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-pesaje-ganado',
  templateUrl: 'pesaje-ganado.html',
})
export class PesajeGanadoPage {

  recibo = {};
  valorPagar;
  tarifapesaje;
  pesoExacto;

  //variables select
  especies = [];
  especie = null;
  tiposanimal = [];
  tipoanimal = null;
  categoriasanimal = [];
  categoriaanimal = null;
  sectores;
  sector;
  tarifa;

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
    private storage: Storage,
    private singleton: SingletonProvider,
    private preprecibo: PrepararReciboProvider

  ) {

    this.inicializarReciboPesaje();

  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PesajeGanadoPage');
    this.sectores = this.singleton.sectoresPlaza;
    this.sector = this.singleton.sector;
    this.tarifa = this.singleton.tarifapesaje;
    this.getTipoAnimal();
    this.getCategoriaAnimal();    
  }

  inicializarReciboPesaje() {
    this.recibo["pkidrecibopesaje"] = -1;
    this.recibo["numerorecibopesaje"] = this.singleton.usuario["numerorecibo"];
    this.recibo["valorecibopesaje"] = 0;
    this.recibo["pesoExacto"] = this.pesoExacto;
    this.recibo["creacionrecibopesaje"] = this.fechaAhora;
    this.recibo["modificacionrecibopesaje"] = this.fechaAhora;
    this.recibo["identificacionterceropesaje"] = "";
    this.recibo["fkidtarifapesaje"] = this.singleton.tarifapesaje["pkidtarifapesaje"];
    this.recibo["fkidplaza"] = this.singleton.plaza["pkidplaza"];
    this.recibo["nombreplaza"] = this.singleton.plaza["nombreplaza"];
    this.recibo["valortarifa"] = this.valorPagar = this.singleton.tarifapesaje["valortarifapesaje"];
    this.recibo["fkidcategoriaanimal"] = this.singleton.categoriaAnimal["pkidcategoriaanimal"];
    this.recibo["nombrecategoriaanimal"] = this.singleton.categoriaAnimal["nombrecategoriaanimal"];
    this.recibo["fkidtipoanimal"] = this.singleton.tipoAnimal["pkidtipoanimal"];
    this.recibo["nombretipoanimal"] = this.singleton.tipoAnimal["nombretipoanimal"];
    this.recibo["fkidespecieanimal"] = this.singleton.especieAnimal["pkidespecieanimal"];
    this.recibo["nombreespecieanimal"] = this.singleton.especieAnimal["nombreespecieanimal"];
    this.recibo["nombreterceropesaje"] = "";
    this.recibo["recibopesajeactivo"] = 1;
    this.recibo["identificacionrecaudador"] = this.singleton.usuario["identificacion"];
    this.recibo["nombrerecaudador"] = this.singleton.usuario["nombreusuario"];
    this.recibo["apellidorecaudador"] = this.singleton.usuario["apellido"];
    this.recibo["fkidusuariorecaudador"] = this.singleton.usuario["pkidusuario"];
    this.recibo["sincronizado"] = 0;
    //extras
    this.recibo["fkidtercero"] = -1;

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

  audioPeso() {

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
          this.pesoExacto = aux;

        },
        (onerror) => console.log('error:', onerror)
      )

  }


  buscarTercero() {
    console.log("buscar: ", this.recibo['identificacionterceropesaje']);
    this.databaseprovider.getTercero(this.recibo['identificacionterceropesaje']).then(tercero => {
      if (tercero) {
        this.recibo['nombreterceropesaje'] = tercero["nombretercero"];
        this.recibo['fkidtercero'] = tercero["pkidsqlite"];
      }
    })
      .catch(error => {
        console.log("No existe, hay que agregarlo!");
      });
    console.log(this.recibo['nombreterceropesaje']);
  }

  //Agrega registros desde el formulario

  addTercero() {
    let tercero = {};
    tercero["identificaciontercero"] = this.recibo['identificacionterceropesaje'];
    tercero["nombretercero"] = this.recibo['nombreterceropesaje'];
    tercero["creaciontercero"] = tercero["modificaciontercero"] = this.fechaAhora;
    tercero["tipotercero"] = "Eventual";
    this.databaseprovider.insertarTercero(tercero)
      .then(data => {
        // this.loadTercerosData();
      });
  }

  //Editar registros desde el formulario
  updateTercero() {
    this.databaseprovider.updateTercero(this.recibo['nombreterceropesaje'], this.recibo['telefonotercero'], this.fechaAhora, this.recibo['identificacionterceropesaje'])

      .then(data => {
        //this.loadTercerosData();
      });
  }

  private fijarDAtos() {
    this.recibo['fkidtarifapesaje'] = this.tarifa["pkidtarifapesaje"];
    this.recibo['valortarifapesaje'] = this.tarifa["valortarifapesaje"];
    this.recibo['valorecibopesaje'] = this.unFormat("" + this.valorPagar);
    this.recibo['nombresector'] = this.sector["nombresector"];
    this.recibo['fkidsector'] = this.sector["pkidsector"];
    this.recibo["pesoExacto"] = this.pesoExacto;
    this.recibo["fkidcategoriaanimal"] = this.singleton.categoriaAnimal["pkidcategoriaanimal"];
    this.recibo["fkidtipoanimal"] = this.singleton.tipoAnimal["pkidtipoanimal"];
    this.recibo["fkidespecieanimal"] = this.singleton.especieAnimal["pkidespecieanimal"];
    this.recibo["nombrecategoriaanimal"] = this.singleton.categoriaAnimal["nombrecategoriaanimal"];
    this.recibo["nombretipoanimal"] = this.singleton.tipoAnimal["nombretipoanimal"];
    this.recibo["nombreespecieanimal"] = this.singleton.especieAnimal["nombreespecieanimal"];
  }

  guardar() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboPesaje(this.recibo), callback: this.guardarFunc });

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

  //Guarda en la tabla trecibopesaje
  guardarRecibo() {


    if (this.recibo["fkidtercero"] == -1) {
      this.addTercero();


    }
    else {
      this.updateTercero();
    }

    this.singleton.usuario["numerorecibo"]++;
    this.databaseprovider.insertarReciboPesaje(this.recibo).then(() => {
      this.databaseprovider.actualizarNumeroRecibo(this.singleton.usuario["pkidsqlite"], this.singleton.usuario["numerorecibo"]);
      this.navCtrl.pop();
    }).catch((error) => console.error("error ultimo: ", error.message));
    
  }

  ////Imprimir
  imprimir() {
    this.fijarDAtos();
    this.navCtrl.push("ReciboPage", { datosRecibo: this.preprecibo.armarReciboPesaje(this.recibo), callback: this.imprimirFunc });
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
    receipt += 'PLAZAS DE FERIAS GANADO JONGOVITO'.toUpperCase();
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;


    //No. Recibo
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
    receipt += commands.TEXT_FORMAT.TXT_2HEIGHT;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'Boleta de Pesaje No.: ' + this.recibo["numerorecibopesaje"];
    receipt += commands.EOL;

    //Nombre Usuario    
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += commands.EOL;
    receipt += 'Nombre Usuario:      ' + this.recibo['nombreterceropesaje']; //21 espacios
    let nomtercero = this.recibo['nombreterceropesaje'];
    console.log("DATO 1: ", nomtercero);


    //CC Usuario
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'CC:                  ' + this.recibo['identificacionterceropesaje'];
    let idtercero = this.recibo['identificacionterceropesaje'];
    console.log("DATO 1: ", idtercero);

    //Categoria Animal
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'CATEGORÍA ANIMAL:    ' + this.recibo['nombrecategoriaanimal'];
    let nombrecategoriaanimal = this.recibo['nombrecategoriaanimal'];
    console.log("DATO 1: ", nombrecategoriaanimal);

    //Especie Animal
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'ESPECIE ANIMAL:      ' + this.recibo['nombreespecieanimal'];
    let nombreespecieanimal = this.recibo['nombreespecieanimal'];
    console.log("DATO 1: ", nombreespecieanimal);

    //Tipo Animal
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'TIPO ANIMAL:         ' + this.recibo['nombretipoanimal'];
    let nombretipoanimal = this.recibo['nombretipoanimal'];
    console.log("DATO 1: ", nombretipoanimal);

    //Peso Animal
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'PESAJE ANIMAL:       ' + this.recibo['pesoExacto'] + 'Kg';
    let pesoExacto = this.recibo['pesoExacto'];
    console.log("DATO 1: ", nombretipoanimal);


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
    receipt += 'Fecha de Abono:      ' + this.recibo["creacionrecibopesaje"];
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


  ///////////SELECT TIPO, CATEGORIA, ESPECIE ANIMAL//////////////////

  getTipoAnimal() {
    this.databaseprovider.getAllTipoAnimal().then(data => {

      this.tiposanimal = data;
      this.tipoanimal = this.tiposanimal[0];
      this.singleton.tipoAnimal = this.tiposanimal;
      console.log("tiposanimal en tiposanimal: ", this.tiposanimal.length);
      this.seleccionarTipoAnimal();

    })
  }

  /**
  * Guarda la nombretipoanimal seleccionada a recaudar en el singleton
  */
  seleccionarTipoAnimal() {
    this.singleton.tipoAnimal = this.tipoanimal;
    console.log("Tipo animal Singleton: " + this.tipoanimal["nombretipoanimal"]);
    this.CargarEspecieAnimal();
  }

  getCategoriaAnimal() {
    this.databaseprovider.getAllCategoriaAnimal().then(data => {

      this.categoriasanimal = data;
      this.categoriaanimal = this.categoriasanimal[0];
      this.singleton.categoriaAnimal = this.categoriasanimal;
      console.log("categoriasanimal en categoriasanimal: ", this.categoriasanimal.length);
      this.seleccionarCategoriaAnimal();

    })
  }


  /**
   * Guarda la Categoria Animal seleccionada a recaudar en el singleton
   */
  seleccionarCategoriaAnimal() {
    this.singleton.categoriaAnimal = this.categoriaanimal;
    console.log("Categoria animal Singleton: " + this.categoriaanimal["nombrecategoriaanimal"]);

  }


  CargarEspecieAnimal() {
    this.databaseprovider.getEspecieByTipoAnimal(this.tipoanimal["pkidtipoanimal"]).then(data => {

      this.especies = data;
      this.especie = this.especies[0];
      this.singleton.especieAnimal = this.especies;
      if (data.length == 0) {
        this.especie = 'No hay especies';
      }
      console.log("especies en especies: ", this.especies.length);
      this.seleccionarEspecieAnimal();

    })
  }

  /**
   * Guarda la especie seleccionada en el singleton
   */
  seleccionarEspecieAnimal() {
    this.singleton.especieAnimal = this.especie;
    console.log("Especie Animal Singleton: " + this.especie["nombreespecieanimal"]);

  }


}
