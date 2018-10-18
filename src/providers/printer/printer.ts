import { Injectable } from '@angular/core';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { AlertController, LoadingController, ToastController } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { commands } from '../printer/printer-commands';
import { NumbersToLettersProvider } from '../numbers-to-letters/numbers-to-letters';


/*
  Generated class for the PrinterProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PrinterProvider {




  constructor(private bluetoothSerial: BluetoothSerial, 
    private conversion: NumbersToLettersProvider,
    private storage: Storage) {
    console.log('Hello PrinterProvider Provider');
  }



  /***********************************************************************************************/
  /**********************************GESTIÓN DE BLUETOOTH*****************************************/
  /***********************************************************************************************/
  habilitarBluetooth() {
    return this.bluetoothSerial.enable();
  }

  buscarBluetooth() {
    return this.bluetoothSerial.list();
  }

  conectarBluetooth(address) {
    return this.bluetoothSerial.connect(address);
  }

  printData(data) {
    return this.bluetoothSerial.write(data);
  }

  desconectarBluetooth() {
    return this.bluetoothSerial.disconnect();
  }

  estaConectado() {
    return this.bluetoothSerial.isConnected();
  }

  estaHabilitado() {
    return this.bluetoothSerial.isConnected();
  }


  /***********************************************************************************************/
  /**********************************GESTIÓN DE IMPRESIÓN*****************************************/
  /***********************************************************************************************/
  noSpecialChars(string) {
    var translate = {
      "à": "a",
      "á": "a",
      "â": "a",
      "ã": "a",
      "ä": "a",
      "å": "a",
      "æ": "a",
      "ç": "c",
      "è": "e",
      "é": "e",
      "ê": "e",
      "ë": "e",
      "ì": "i",
      "í": "i",
      "î": "i",
      "ï": "i",
      "ð": "d",
      "ñ": "n",
      "ò": "o",
      "ó": "o",
      "ô": "o",
      "õ": "o",
      "ö": "o",
      "ø": "o",
      "ù": "u",
      "ú": "u",
      "û": "u",
      "ü": "u",
      "ý": "y",
      "þ": "b",
      "ÿ": "y",
      "ŕ": "r",
      "À": "A",
      "Á": "A",
      "Â": "A",
      "Ã": "A",
      "Ä": "A",
      "Å": "A",
      "Æ": "A",
      "Ç": "C",
      "È": "E",
      "É": "E",
      "Ê": "E",
      "Ë": "E",
      "Ì": "I",
      "Í": "I",
      "Î": "I",
      "Ï": "I",
      "Ð": "D",
      "Ñ": "N",
      "Ò": "O",
      "Ó": "O",
      "Ô": "O",
      "Õ": "O",
      "Ö": "O",
      "Ø": "O",
      "Ù": "U",
      "Ú": "U",
      "Û": "U",
      "Ü": "U",
      "Ý": "Y",
      "Þ": "B",
      "Ÿ": "Y",
      "Ŕ": "R"
    },
      translate_re = /[àáâãäåæçèéêëìíîïðñòóôõöøùúûüýþßàáâãäåæçèéêëìíîïðñòóôõöøùúûýýþÿŕŕÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÝÝÞŸŔŔ]/gim;
    return (string.replace(translate_re, function (match) {
      return translate[match];
    }));
  }


  public iniciarImpresion(receipt: string, alertCtrl: AlertController, loadCtrl: LoadingController, toastCtrl: ToastController) {
    return this.storage.get("IMPRESORA_PRE").then((device) => {
      if (device) {
        this.estaHabilitado().then((exito) => {
          if (exito) {
            console.log("SI ESTÁ HABILITADO");
            this.imprimir(device, receipt, alertCtrl, loadCtrl);
          }
          else {
            console.log("NO ESTÁ HABILITADO");
            this.habilitandoImpresora(device, receipt, alertCtrl, loadCtrl);
          }
        }).catch((error) => {
          console.error("NO ESTÁ HABILITADO", error.message);
          this.habilitandoImpresora(device, receipt, alertCtrl, loadCtrl);
        });
      }
      else {
        this.seleccionarImpresora(receipt, alertCtrl, loadCtrl, toastCtrl);
      }
      // receipt += commands.HARDWARE.HW_INIT;
      // receipt += commands.HARDWARE.HW_RESET;
    });

  }

  private habilitandoImpresora(device: any, receipt: string, alertCtrl: AlertController, loadCtrl: LoadingController) {
    this.habilitarBluetooth().then(() => {
      this.imprimir(device, receipt, alertCtrl, loadCtrl);
    });
  }


  seleccionarImpresora(receipt: string, alertCtrl: AlertController, loadCtrl: LoadingController,
    toastCtrl: ToastController, imprimir: boolean = true) {
    let alert = alertCtrl.create({
      title: 'Impresoras disponibles',
      buttons: [{
        text: 'Cancelar',
        role: 'cancel'
      },
      {
        text: imprimir?'IMPRIMIR':"SELECCIONAR",
        handler: (device) => {
          if (!device) {
            // this.showToast('Impresora seleccinada!');
            return false;
          }
          //console.log(device);
          this.storage.set("IMPRESORA_PRE", device);
          if (imprimir) {
            this.imprimir(device, receipt, alertCtrl, loadCtrl);
          }
        }
      }]
    });

    this.habilitarBluetooth().then(() => {
      this.buscarBluetooth().then(devices => {
        devices.forEach((device) => {
          console.log('Dispositivos: ', JSON.stringify(device));
          alert.addInput({
            name: 'Impresora',
            value: device.address,
            label: device.name,
            type: 'radio',
            checked: true
          });
        });
        alert.present();
      }).catch((error) => {
        console.log(error);
        this.showToast('Hubo un error al conectar la impresora, intente de nuevo!', toastCtrl);
      });
    }).catch((error) => {
      console.log(error);
      this.showToast('Error al activar bluetooth, por favor intente de nuevo!', toastCtrl);
    });
  }

  imprimir(device, data, alertCtrl: AlertController, loadCtrl: LoadingController) {
    console.log('MAC del dispositivo: ', device);
    console.log('Información: ', data);

    this.estaConectado().then((exito) => {
      if (exito) {
        console.log("SI ESTÁ CONECTADO");
        this.imprimirData(data, alertCtrl, loadCtrl)
      }
      else {
        console.log("NO ESTÁ CONECTADO");

        this.conectando(device, data, alertCtrl, loadCtrl);
      }
    }).catch((error) => {
      console.error("NO ESTÁ CONECTADO ", error.message);

      this.conectando(device, data, alertCtrl, loadCtrl);
    });

  }

  private conectando(device: any, data: any, alertCtrl: AlertController, loadCtrl: LoadingController) {
    this.conectarBluetooth(device).subscribe(status => {
      console.log(status);
      this.imprimirData(data, alertCtrl, loadCtrl);
    }, error => {
      console.log(error);
      let alert = alertCtrl.create({
        title: 'Hubo un error al conectar con la impresora, intente de nuevo!',
        buttons: ['Ok']
      });
      alert.present();
    });
  }

  private imprimirData(data: any, alertCtrl: AlertController, loadCtrl: LoadingController) {
    let load = loadCtrl.create({
      content: 'Imprimiendo...'
    });
    load.present();
    this.printData(this.noSpecialChars(data))
      .then(printStatus => {
        console.log(printStatus);
        let alert = alertCtrl.create({
          title: 'Por favor, retire el recibo de su impresora.',
          buttons: ['Ok']
        });
        // this.navCtrl.push(MenuPrincipalPage);
        load.dismiss();
        alert.present();
        //this.respuestaExito = '¡El pago se realizó exitosamente!';
        //console.log(this.respuestaExito);
        // this.desconectarBluetooth();

      })
      .catch(error => {
        console.log(error);
        let alert = alertCtrl.create({
          title: 'Se produjo un error al imprimir, intente de nuevo por favor!',
          buttons: ['Ok']
        });
        load.dismiss();
        alert.present();
        //this.respuestaError = '¡El pago no se realizó!';
        this.desconectarBluetooth();
      });
  }

  showToast(data, toastCtrl: ToastController) {
    let toast = toastCtrl.create({
      duration: 3000,
      message: data,
      position: 'bottom'
    });
    toast.present();
  }


  /***************************************************************************************/
  /*****************************IMPRESIONES DE RECIBOS************************************/
  /***************************************************************************************/

  prepararImpresion(recibo, alertCtrl: AlertController, loadCtrl: LoadingController, toastCtrl: ToastController) {

    let valorPagar=recibo["valorecibopuestoeventual"];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(valorPagar), 0);
    console.log("valor en letras: " + numeroEnLetras);

    let saldo = Math.abs(parseFloat(recibo["valortarifa"]) - parseFloat(this.unFormat(valorPagar)));


    let receipt = this.encabezados();

    //Tipo de recaudo
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += 'RECAUDO PUESTO EVENTUAL'.toUpperCase();
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;


    //No. Recibo
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_RT;
    receipt += commands.TEXT_FORMAT.TXT_2HEIGHT;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += 'Recibo No.: ' + recibo["numerorecibopuestoeventual"];
    receipt += commands.EOL;

    //Nombre Usuario    
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += commands.EOL;
    receipt += 'Nombre Usuario:      ' + recibo['nombreterceropuestoeventual']; //21 espacios
    let nomtercero = recibo['nombreterceropuestoeventual'];
    console.log("DATO 1: ", nomtercero);


    //CC Usuario
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'CC:                  ' + recibo['identificacionterceropuestoeventual'];
    let idtercero = recibo['identificacionterceropuestoeventual'];
    console.log("DATO 1: ", idtercero);



    //Tarifa
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'Tarifa:              $ ' + this.format("" + recibo["valortarifa"]);

    //Valor pagado
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'Valor Pagado:        $ ' + this.format(valorPagar);

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
    receipt += 'Fecha de Abono:      ' + recibo["creacionrecibopuestoeventual"];
    //console.log("fechaAbono: " + this.fechaAbono);

    //Recaudador
    let recaudador = recibo["nombrerecaudador"] + " " + recibo["apellidorecaudador"]
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_LT;
    receipt += 'RECAUDADOR:          ' + recaudador;
    console.log("AQUI Rec: ", recaudador);


    //Espacio para el pie de pagina
    receipt = this.piepagina(receipt);


    this.iniciarImpresion(receipt, alertCtrl, loadCtrl, toastCtrl);
  }


  
  private piepagina(receipt: string) {
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_BOLD_ON;
    receipt += commands.TEXT_FORMAT.TXT_ALIGN_CT;
    receipt += '---';
    receipt += commands.EOL;
    receipt += commands.TEXT_FORMAT.TXT_NORMAL;
    receipt += commands.TEXT_FORMAT.TXT_ITALIC_ON;
    receipt += 'Saque copia y guarde este recibo como soporte de pago';
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += '      ';
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.EOL;
    receipt += commands.EOL;
    return receipt;
  }

  private encabezados() {
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
    return receipt;
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

  
  //Separador de miles
  DECIMAL_SEPARATOR = ",";
  GROUP_SEPARATOR = ".";
  budget = 0;

  unFormat(val) {
    if (!val) {
      return '';
    }
    val=""+val;
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

}
