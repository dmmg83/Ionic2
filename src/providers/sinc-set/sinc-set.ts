import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Storage } from '@ionic/storage';
import { DatabaseProvider } from '../../providers/database/database';
import { SingletonProvider } from '../singleton/singleton';
import 'rxjs/add/operator/toPromise';
import 'rxjs/add/operator/catch';
import { GLOBAL } from '../fecha/globales';
import { AlertController } from 'ionic-angular';

/*
  Generated class for the SincSetProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SincSetProvider {

  public API_URL: string;
  public headers;

  recibos: any;

  constructor(
    public alertCtrl: AlertController,
    private databaseprovider: DatabaseProvider,
    private storage: Storage,
    public http: Http,
    private singleton: SingletonProvider

  ) {
    console.log('Hello SincSetProvider Provider');
    this.API_URL = GLOBAL.url;
    this.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
  }

  AlertMsj(titulo, mensaje) {
    const alert = this.alertCtrl.create({
      title: titulo,
      subTitle: mensaje,
      buttons: ['OK']
    });
    alert.present();
  }


  //Cargaa al servidor recibo eventual
  uploadReciboEventual() {

    this.databaseprovider.getRecEventuales().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      this.recibos = [];

      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          this.recibos.push(res.rows.item(i));
        }

        let json = JSON.stringify(this.recibos);
        console.log("JSON: " + json);
        let parametros = "authorization=" + this.singleton.TOKEN + "&json=" + json;

        return new Promise((resolve, reject) => {
          this.http.post(this.API_URL + 'recibopuestoeventual/new', parametros, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => {
              resolve(data);
              let msj = data;
              if (msj["status"] == 'Exito') {
                console.log("INFORMACIÓN CARGADA");
                this.AlertMsj('Información Cargada!', 'Hemos cargado la información satisfactoriamente.')
                this.databaseprovider.setDesocupado();
                this.databaseprovider.actualizarRecEventuales();
              } else {
                //Mensaje
                this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido enviar la información al servidor. Por favor intente nuevamente.');
                this.databaseprovider.setDesocupado();
              }

            }, error => {
              reject(error);
            })
        }).catch((error) => {
          console.error('API Error: ', error.status);
          console.error('API Error: ', JSON.stringify(error));
        })
      } else {
        this.AlertMsj('No hay Información!', 'No hemos encontrado información para cargar al servidor.')
        this.databaseprovider.setDesocupado();
      }

    }, (err) => { console.error("Error al subir la información: ", err.message) })
  }

  //Carga al servidor recibo parqueadero
  uploadParqueadero() {

    this.databaseprovider.getRecParqueadero().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      this.recibos = [];

      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          this.recibos.push(res.rows.item(i));
        }

        let json = JSON.stringify(this.recibos);
        console.log("JSON: " + json);
        let parametros = "authorization=" + this.singleton.TOKEN + "&json=" + json;

        return new Promise((resolve, reject) => {
          this.http.post(this.API_URL + 'reciboparqueadero/new', parametros, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => {
              resolve(data);
              let msj = data;
              if (msj["status"] == 'Exito') {
                console.log("INFORMACIÓN CARGADA");
                this.AlertMsj('Información Cargada!', 'Hemos cargado la información satisfactoriamente.')
                this.databaseprovider.setDesocupado();
                this.databaseprovider.actualizarRecParqueadero();
              } else {
                //Mensaje
                this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido enviar la información al servidor. Por favor intente nuevamente.');
                this.databaseprovider.setDesocupado();

              }

            }, error => {
              reject(error);
            })
        }).catch((error) => {
          console.error('API Error: ', error.status);
          console.error('API Error: ', JSON.stringify(error));
        })
      } else {
        this.AlertMsj('No hay Información!', 'No hemos encontrado información para cargar al servidor.')
        this.databaseprovider.setDesocupado();
      }

    }, (err) => { console.error("Error al subir la información: ", err.message) })
  }


  //Carga al servidor recibo pesaje
  uploadPesaje() {

    this.databaseprovider.getRecPesaje().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      this.recibos = [];

      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {
          this.recibos.push(res.rows.item(i));
        }

        let json = JSON.stringify(this.recibos);
        console.log("JSON: " + json);
        let parametros = "authorization=" + this.singleton.TOKEN + "&json=" + json;

        return new Promise((resolve, reject) => {
          this.http.post(this.API_URL + 'recibopesaje/new', parametros, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => {
              resolve(data);
              let msj = data;
              if (msj["status"] == 'Exito') {
                console.log("INFORMACIÓN CARGADA");
                this.AlertMsj('Información Cargada!', 'Hemos cargado la información satisfactoriamente.')
                this.databaseprovider.setDesocupado();
                this.databaseprovider.actualizarRecPesaje();
              } else {
                //Mensaje
                this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido enviar la información al servidor. Por favor intente nuevamente.');
                this.databaseprovider.setDesocupado();
              }

            }, error => {
              reject(error);
            })
        }).catch((error) => {
          console.error('API Error: ', error.status);
          console.error('API Error: ', JSON.stringify(error));
        })
      } else {
        this.AlertMsj('No hay Información!', 'No hemos encontrado información para cargar al servidor.')
        this.databaseprovider.setDesocupado();
      }

    }, (err) => { console.error("Error al subir la información: ", err.message) })
  }


  //Carga al servidor recibo vehículo
  uploadVehiculo() {
    this.databaseprovider.getRecVehiculo().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      this.recibos = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {

          this.recibos.push(res.rows.item(i));

        }

        let json = JSON.stringify(this.recibos);
        console.log("JSON: " + json);
        let parametros = "authorization=" + this.singleton.TOKEN + "&json=" + json;

        return new Promise((resolve, reject) => {
          this.http.post(this.API_URL + 'recibovehiculo/new', parametros, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => {
              resolve(data);
              let msj = data;
              if (msj["status"] == 'Exito') {
                console.log("INFORMACIÓN CARGADA");
                this.AlertMsj('Información Cargada!', 'Hemos cargado la información satisfactoriamente.')
                this.databaseprovider.setDesocupado();
                this.databaseprovider.actualizarRecVehiculo();
              } else {
                //Mensaje
                this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido enviar la información al servidor. Por favor intente nuevamente.');
                this.databaseprovider.setDesocupado();

              }

            }, error => {
              reject(error);
            })
        }).catch((error) => {
          console.error('API Error: ', error.status);
          console.error('API Error: ', JSON.stringify(error));
        })
      } else {
        this.AlertMsj('No hay Información!', 'No hemos encontrado información para cargar al servidor.')
        this.databaseprovider.setDesocupado();
      }
    }, (err) => { console.error("Error al subir la información: ", err.message) })
  }


  //Carga al servidor recibo vehículo
  uploadReciboPuestoFijo() {

    this.databaseprovider.getRecPuestoFijo().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      this.recibos = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {

          this.recibos.push(res.rows.item(i));

        }

        let json = JSON.stringify(this.recibos);
        console.log("JSON: " + json);
        let parametros = "authorization=" + this.singleton.TOKEN + "&json=" + json;

        return new Promise((resolve, reject) => {
          this.http.post(this.API_URL + 'recibopuesto/new', parametros, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => {
              resolve(data);
              let msj = data;
              if (msj["status"] == 'Exito') {
                console.log("INFORMACIÓN CARGADA");
                this.AlertMsj('Información Cargada!', 'Hemos cargado la información satisfactoriamente.')
                this.databaseprovider.setDesocupado();
                this.databaseprovider.actualizarRecPuestoFijo();
              } else {
                //Mensaje
                this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido enviar la información al servidor. Por favor intente nuevamente.');
                this.databaseprovider.setDesocupado();
              }

            }, error => {
              reject(error);
            })
        }).catch((error) => {
          console.error('API Error: ', error.status);
          console.error('API Error: ', JSON.stringify(error));
        })
      } else {
        this.AlertMsj('No hay Información!', 'No hemos encontrado información para cargar al servidor.')
        this.databaseprovider.setDesocupado();
      }
    }, (err) => { console.error("Error al subir la información: ", err.message) })
  }

  //Carga al servidor datos de terceros
  uploadTercero() {
    this.databaseprovider.getTerceroAgregado().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      let tercero = [];
      if (res.rows.length > 0) {
        for (var i = 0; i < res.rows.length; i++) {

          tercero.push(res.rows.item(i));

        }

        let json = JSON.stringify(tercero);
        console.log("JSON: " + json);
        let parametros = "authorization=" + this.singleton.TOKEN + "&datosdependiente=" + json + "&tabla=trecibopesaje";

        return new Promise((resolve, reject) => {
          this.http.post(this.API_URL + 'asignaciondependiente/dependientearray', parametros, { headers: this.headers })
            .map(res => res.json())
            .subscribe(data => {
              resolve(data);
              let msj = data;
              if (msj["status"] == 'Exito') {
                console.log("INFORMACIÓN CARGADA");
                this.AlertMsj('Información Cargada!', 'Hemos cargado la información satisfactoriamente.')
                this.databaseprovider.setDesocupado();
                this.databaseprovider.actualizarRecVehiculo();
              } else {
                //Mensaje
                this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido enviar la información al servidor. Por favor intente nuevamente.');
                this.databaseprovider.setDesocupado();

              }

            }, error => {
              reject(error);
            })
        }).catch((error) => {
          console.error('API Error: ', error.status);
          console.error('API Error: ', JSON.stringify(error));
        })
      } else {
        this.AlertMsj('No hay Información!', 'No hemos encontrado información para cargar al servidor.')
        this.databaseprovider.setDesocupado();
      }
    }, (err) => { console.error("Error al subir la información: ", err.message) })
  }

  //Actualizar número de recibo
  actualizarNumeroRecibo() {
    this.singleton.usuario["pkidusuario"];
    this.singleton.usuario[""]
    this.databaseprovider.getNumRecibo().then((res) => {
      this.databaseprovider.setOcupado("Cargando información al servidor...");
      let numrecibo = [];
      for (var i = 0; i < res.rows.length; i++) {

        numrecibo.push(res.rows.item(i));

      }

      let json = JSON.stringify(numrecibo);
      console.log("JSON: " + json);
      let parametros = "authorization=" + this.singleton.TOKEN + "&json=" + json;

      return new Promise((resolve, reject) => {
        this.http.post(this.API_URL + 'user/editrecibo', parametros, { headers: this.headers })
          .map(res => res.json())
          .subscribe(data => {
            resolve(data);
            let msj = data;
            if (msj["status"] == 'Exito') {
              console.log("Número de recibo actualizado");
              this.databaseprovider.setDesocupado();
            } else {
              //Mensaje
              this.AlertMsj('Tenemos un Problema!', 'Lo sentimos, no hemos podido actualizar el numero de recibo');
              this.databaseprovider.setDesocupado();
            }

          }, error => {
            reject(error);
          })
      }).catch((error) => {
        console.error('API Error: ', error.status);
        console.error('API Error: ', JSON.stringify(error));
      })
    }, (err) => { console.log("Actualización numero recibo: ", err.message) })

  }

}
