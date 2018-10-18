import { GLOBAL } from './../fecha/globales';
import { Injectable } from '@angular/core';
import { Platform, LoadingController, Events } from 'ionic-angular';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite';
import { SQLitePorter } from '@ionic-native/sqlite-porter';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/Rx';
import { Storage } from '@ionic/storage';
import { SingletonProvider } from './../singleton/singleton';
/*
  Generated class for the DatabaseProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class DatabaseProvider {

  database: SQLiteObject;
  public databaseReady: BehaviorSubject<boolean>;
  public crearEstructuraReady: BehaviorSubject<boolean>;
  loading: any;

  fechaCreacion: any = new Date().toLocaleString();
  fechaModificacion: any = new Date().toLocaleString();

  private bdActual: string = "bd1.db"

  constructor(
    public sqlitePorter: SQLitePorter,
    private storage: Storage,
    private sqlite: SQLite,
    private platform: Platform,
    private http: Http,
    public events: Events,
    public singleton: SingletonProvider,
    public loadingCtrl: LoadingController
  ) {
    this.databaseReady = new BehaviorSubject(false);
    this.crearEstructuraReady = new BehaviorSubject(false);
    this.platform.ready().then(() => {
      this.storage.get('BDACTIVA').then(val => {
        if (val) {
          this.bdActual = val;
        }
        console.log("val" + val);

        this.crearBD();
      }).catch(() => {
        console.error("error val");

      });
    });
  }

  setOcupado(mensaje: string = 'cargando') {
    this.loading = this.loadingCtrl.create({
      content: mensaje
    });

    this.loading.present();

  }

  setDesocupado() {
    this.loading.dismiss();
  }

  /**
   * Crea la Base de datos y verifica que bd se encuentra activa
   */
  private crearBD() {

    this.platform.ready().then(() => {
      this.sqlite.create({
        name: this.bdActual,
        location: 'default'
      })
        .then((db: SQLiteObject) => {
          this.database = null;
          this.database = db;
          this.storage.set('BDACTIVA', this.bdActual);
          this.databaseReady.next(true);

          // if(crearEstructura)
          // {
          // this.crearEstructura();
          // }
        }, (error => {
          console.log("Error (1) " + error.message);
        }));
    });
  }

  //Llena la base de datos
  fillDatabase(sql: string = null) {
    if (sql != null) {
      this.sqlitePorter.importSqlToDb(this.database, sql)
        .then(data => {
          this.databaseReady.next(true);
          this.storage.set('database_filled', true);
          console.log("terminó de importar");
        })
        .catch(e => { console.error("Error en la Importación " + e.message) });
    }
  }

  //Check al estado de la bd
  getDatabaseState() {
    return this.databaseReady.asObservable();
  }

  backup() {
    this.platform.ready().then(() => {
      this.database.abortallPendingTransactions();
      this.database.close().then(() => {
        console.info("bdActual: ", this.bdActual);

        this.bdActual = this.bdActual == "bd1.db" ? "bd2.db" : "bd1.db";
        console.info("bdActual despues: ", this.bdActual);
        this.sqlite.deleteDatabase({
          name: this.bdActual,
          location: 'default'
        }).then(() => {
          console.log("borrada");

          this.crearBD();
        }).catch((e) => {
          console.log("se creara el backup");
          this.crearBD();

        });

      });
    });
  }


  restore() {
    this.platform.ready().then(() => {
      this.database.abortallPendingTransactions();
      this.database.close().then(() => {
        console.info("bdActual: ", this.bdActual);

        this.bdActual = this.bdActual == "bd1.db" ? "bd2.db" : "bd1.db";
        console.info("bdActual despues: ", this.bdActual);
        this.crearBD();

      });
    });
  }

  crearEstructura() {
    this.http.get('assets/database/RecaudoDB.sql')
      .map(res => res.text())
      .subscribe(sql => {
        this.sqlitePorter.importSqlToDb(this.database, sql)
          .then(data => {
            this.crearEstructuraReady.next(true);
            this.crearEstructuraReady.complete(); //se finaliza el evento
            this.crearEstructuraReady = new BehaviorSubject(false); //se reinicia el evento.
          })
          .catch(e => console.error(e));
      });
  }



  /**
   * USUARIOS
   */

  /**
 * Select a la tabla usuario
 */
  getAllUsuarios() {
    return this.database.executeSql("SELECT * FROM tusuario", []).then((data) => {

      let usuarios = [];
      if (data.rows.length > 0) {
        //this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          usuarios.push({ pkidusuario: data.rows.item(i).pkidusuario, nombreusuario: data.rows.item(i).nombreusuario, contrasenia: data.rows.item(i).contrasenia, apellido: data.rows.item(i).apellido, identificacion: data.rows.item(i).identificacion, codigousuario: data.rows.item(i).codigousuario, rutaimagen: data.rows.item(i).rutaimagen, numerorecibo: data.rows.item(i).numerorecibo, usuarioactivo: data.rows.item(i).usuarioactivo });
        }
        console.log("N° Registros usuarios: " + data.rows.length);
      }
      //this.setDesocupado();
      return usuarios;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getUsuarioId(datoBuscar) {
    return this.database.executeSql("SELECT pkidusuario, identificacion, nombreusuario, apellido, contrasenia, numerorecibo FROM tusuario WHERE identificacion='" + datoBuscar + "'", []).then((data) => {

      let usuario;
      if (data.rows.length > 0) {
        usuario = { pkidusuario: data.rows.item(0).pkidusuario, nombreusuario: data.rows.item(0).nombreusuario, contrasenia: data.rows.item(0).contrasenia, apellido: data.rows.item(0).apellido, identificacion: data.rows.item(0).identificacion, codigousuario: data.rows.item(0).codigousuario, rutaimagen: data.rows.item(0).rutaimagen, numerorecibo: data.rows.item(0).numerorecibo, usuarioactivo: data.rows.item(0).usuarioactivo };
      }
      return usuario;
    }, err => {
      console.error('Error: ', err.message);
      return {};
    });
  }

  //CAMBIO
  actualizarNumeroRecibo(idUsuario, nuevoValor) {
    return this.database.executeSql("UPDATE tusuario SET numerorecibo=" + nuevoValor + " WHERE pkidsqlite='" + idUsuario + "'", []).then((data) => {

      return true;
    }, err => {
      console.error('Error: ', err.message);
      return false;
    });
  }
  getNumReciboE(idUsuario) {

    let sql = "SELECT pkidusuario, numerorecibo FROM tusuario  WHERE identificacion='" + idUsuario + "'";
    return this.database.executeSql(sql, []);

  }

  numeroregistrosUsuarios() {
    //select pkidusuario from tusuario limit 1


    return this.database.executeSql("SELECT pkidsqlite FROM tusuario limit 1", []).then((data) => {

      let numreg = [];
      if (data.rows.length > 0) {
        numreg = data.rows.length;

      } else {
        numreg = data.rows.length;
      }
      console.log("registros: ", numreg);
      return numreg;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });


  }




  /**
   * TERCEROS
   */

  /**
  * Select a la tabla tercero
  */
  getAllTerceros() {
    return this.database.executeSql("SELECT * FROM ttercero", []).then((data) => {

      let terceros = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          terceros.push({ pkidsqlite: data.rows.item(i).pkidsqlite, nombretercero: data.rows.item(i).nombretercero, identificaciontercero: data.rows.item(i).identificaciontercero, telefonotercero: data.rows.item(i).telefonotercero, creaciontercero: data.rows.item(i).creaciontercero, modificaciontercero: data.rows.item(i).modificaciontercero, pkidtercero: data.rows.item(i).pkidtercero, tipotercero: data.rows.item(i).tipotercero });
        }
        console.log("N° Registros terceros: " + data.rows.length);

      } else {
        console.log("No existe, hay que agregarlo!");
      }

      //this.setDesocupado();
      return terceros;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getTerceroAgregado() {
    let sql = "SELECT nombretercero, identificaciontercero, telefonotercero, tipotercero  FROM ttercero";
    return this.database.executeSql(sql, []);
  }

  listarTerceroAgregado() {
    return this.database.executeSql("SELECT pkidtercero, nombretercero, identificaciontercero, telefonotercero, tipotercero  FROM ttercero WHERE pkidtercero=-1", []).then((data) => {

      let terceroagregado = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          terceroagregado.push(data.rows.item(i))
        }
        console.log("N° Registros tercero agregado: " + data.rows.length);

      } else {
        console.log("No hay datos tercero agregado!");
      }

      return terceroagregado;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getTercero(datoBuscar) {
    return this.database.executeSql("SELECT pkidsqlite, nombretercero, identificaciontercero, telefonotercero FROM ttercero WHERE identificaciontercero='" + datoBuscar + "'", []).then((data) => {

      let terceros: any;
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        terceros = { pkidsqlite: data.rows.item(0).pkidsqlite, nombretercero: data.rows.item(0).nombretercero, identificaciontercero: data.rows.item(0).identificaciontercero, telefonotercero: data.rows.item(0).telefonotercero };
        console.log("N° Registros: " + data.rows.length);

      } else {
        console.log("No existe, hay que agregarlo!");
      }

      // this.setDesocupado();
      return terceros;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }


  addTercero(nombretercero, identificaciontercero, telefonotercero, creaciontercero, modificaciontercero, pkidtercero, tipotercero) {
    let data = [nombretercero, identificaciontercero, telefonotercero, creaciontercero, modificaciontercero, -1, tipotercero]
    return this.database.executeSql("INSERT INTO ttercero (nombretercero, identificaciontercero, telefonotercero, creaciontercero, modificaciontercero, pkidtercero, tipotercero) VALUES (?, ?, ?, ?, ?, ?, ?)", data).then(data => {
      console.log("Guardado!");
      return data;
    }, err => {
      console.log('Error add: ', err.message, 'NO GUARDADO!');
      return err;
    })
      .catch((error) => {
        console.log('Error catch: ', error.message);
      })
  }

  insertarTercero(tercero) {
    let data = [tercero["nombretercero"], tercero["identificaciontercero"], tercero["telefonotercero"], tercero["creaciontercero"], tercero["modificaciontercero"], -1, tercero["tipotercero"]]
    return this.database.executeSql("INSERT INTO ttercero (nombretercero, identificaciontercero, telefonotercero, creaciontercero, modificaciontercero, pkidtercero, tipotercero) VALUES (?, ?, ?, ?, ?, ?, ?)", data).then(data => {

      console.log("Guardado!");
      return data;
    }, err => {
      console.log('Error add: ', err.message, 'NO GUARDADO!');
      return err;
    })
      .catch((error) => {
        console.log('Error catch: ', error.message);
      })
  }

  updateTercero(nombretercero, telefonotercero, modificaciontercero, identificacion) {
    let data = [nombretercero, telefonotercero, modificaciontercero]
    return this.database.executeSql("UPDATE ttercero SET nombretercero = ?,  telefonotercero = ?,  modificaciontercero = ? WHERE identificaciontercero = '" + identificacion + "'", data).then(data => {
      console.log("Actualizado!");
      return data;
    }, err => {
      console.log('Error update: ', err.message, 'NO ACTUALIZADO!');
      return err;
    })
      .catch((error) => {
        console.log('Error catch: ', error.message);
      })
  }

  /**
   * PLAZA
   */

  /**
* Select a la tabla plaza
*/

  existenPlazas() {
    return this.database.executeSql("SELECT pkidsqlite FROM tplaza limit 1", []).then((data) => {

      return data.rows.length > 0;

    }, err => {
      console.log('Error: ', err.message);
      return false;
    });


  }

  //CAMBIO
  getAllPlazas() {
    //return this.database.executeSql("SELECT pkidplaza,nombreplaza,pkidtarifapuestoeventual,valortarifapuestoeventual,pkidtarifapesaje,valortarifapesaje FROM tplaza LEFT JOIN ttarifapuestoeventual ON pkidplaza = ttarifapuestoeventual.fkidplaza LEFT JOIN ttarifapesaje ON pkidplaza = ttarifapesaje.fkidplaza ORDER BY nombreplaza", []).then((data) => {
    return this.database.executeSql("SELECT * FROM tplaza", []).then((data) => {
      let plazas = [];
      if (data.rows.length > 0) {
        //  this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          plazas.push(data.rows.item(i));
        }
        console.log("N° Registros Plazas: " + data.rows.length);

      } else {
        console.log("No hay datos plazas!");
      }

      // this.setDesocupado();
      return plazas;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  //Consulta tipos de recaudo
  getAllTipoRecaudo() {
    return this.database.executeSql("SELECT * FROM tplazatiporecaudo", []).then((data) => {
      let plazas = [];
      if (data.rows.length > 0) {
        //  this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          plazas.push(data.rows.item(i));
        }
        console.log("N° Registros Tipo Recaudo Plazas: " + data.rows.length);

      } else {
        console.log("No hay datos Tipo Recaudo plazas!");
      }

      // this.setDesocupado();
      return plazas;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  consultarRecaudosBotones(idplaza) {
    return this.database.executeSql("SELECT * FROM tplazatiporecaudo WHERE fkidtiporecaudo <> 5 and fkidplaza = " + idplaza + "; ", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i))
        }
        console.log("N° Registros consultar Recaudos Botones: " + data.rows.length);

      } else {
        console.log("No hay datos consultar Recaudos Botones!");
      }

      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }
  /**
   * SECTOR
   */
  /**
  * Select a la tabla Sector
  */

  getAllSectores() {
    return this.database.executeSql("SELECT pkidsqlite,pkidsector,nombresector,fkidplaza,fkidtiposector FROM tsector;", []).then((data) => {

      let sectores = [];
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          sectores.push({ pkidsqlite: data.rows.item(i).pkidsqlite, pkidsector: data.rows.item(i).pkidsector, nombresector: data.rows.item(i).nombresector, fkidplaza: data.rows.item(i).fkidplaza, fkidtiposector: data.rows.item(i).fkidtiposector });
        }
        console.log("N° Registros Sectores: " + data.rows.length);
      } else {
        console.log("No hay datos sectores!");
      }

      // this.setDesocupado();
      return sectores;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getSectoresByPlaza(idPlaza) {
    return this.database.executeSql("SELECT pkidsqlite,pkidsector,nombresector,fkidplaza,fkidtiposector FROM tsector WHERE fkidplaza=" + idPlaza + ";", []).then((data) => {

      let sectores = [];
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          sectores.push({ pkidsqlite: data.rows.item(i).pkidsqlite, pkidsector: data.rows.item(i).pkidsector, nombresector: data.rows.item(i).nombresector, fkidplaza: data.rows.item(i).fkidplaza, fkidtiposector: data.rows.item(i).fkidtiposector });
        }
        console.log("N° Registros Sectores: " + data.rows.length);
      } else {
        console.log("No hay datos sectoresbyplaza!");
      }

      // this.setDesocupado();
      return sectores;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * RECIBO
   */
  addReciboEventual(
    pkidrecibopuestoeventual,
    numerorecibopuestoeventual,
    valorecibopuestoeventual,
    creacionrecibopuestoeventual,
    modificacionrecibopuestoeventual,
    identificacionterceropuestoeventual,
    fkidtarifapuestoeventual,
    fkidplaza,
    valortarifa,
    nombreplaza,
    nombreterceropuestoeventual,
    recibopuestoeventualactivo,
    nombresector,
    fkidsector,
    identificacionrecaudador,
    nombrerecaudador,
    apellidorecaudador,
    fkidusuariorecaudador,
    sincronizado) {
    let data = [pkidrecibopuestoeventual, numerorecibopuestoeventual, valorecibopuestoeventual, creacionrecibopuestoeventual, modificacionrecibopuestoeventual, identificacionterceropuestoeventual, fkidtarifapuestoeventual, fkidplaza, valortarifa, nombreplaza, nombreterceropuestoeventual, recibopuestoeventualactivo, nombresector, fkidsector, identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador, sincronizado]
    return this.database.executeSql("INSERT INTO trecibopuestoeventual (pkidrecibopuestoeventual, numerorecibopuestoeventual,valorecibopuestoeventual,creacionrecibopuestoeventual,modificacionrecibopuestoeventual,identificacionterceropuestoeventual,fkidtarifapuestoeventual,fkidplaza,valortarifa,nombreplaza,nombreterceropuestoeventual,recibopuestoeventualactivo,nombresector,fkidsector,identificacionrecaudador,nombrerecaudador,apellidorecaudador,fkidusuariorecaudador,sincronizado) VALUES (?, ?, ?, ?, ?,?, ?, ?, ?, ?,?, ?, ?, ?, ?,?, ?, ?, ?)", data)
      .then(data => {
        console.log("Recibo Eventual Guardado!");
        return data;
      }, err => {
        console.log('Error add recibo eventual: ', err.message, 'NO GUARDADO!');
        throw err;
      })
      .catch((error) => {
        console.log('Error catch RE: ', error.message);
        throw error;
      })
  }

  /**
   * getAllRecibosEventuales() lista los recibos eventuales existentes en la bd local
   */
  getAllRecibosEventuales() {
    return this.database.executeSql("SELECT * FROM trecibopuestoeventual", []).then((data) => {

      let recibos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          recibos.push(data.rows.item(i))
        }
        console.log("N° Registros Recibos eventuales: " + data.rows.length);

      } else {
        console.log("No hay datos rec.eventuales!");
      }

      return recibos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * getRecEventuales() selecciona los recibos que no se hayan sincronizado
   */
  getRecEventuales() {
    let sql = "SELECT numerorecibopuestoeventual, valorecibopuestoeventual, " +
      "creacionrecibopuestoeventual, modificacionrecibopuestoeventual, fkidtarifapuestoeventual, " +
      "nombreterceropuestoeventual, valortarifa, nombreplaza, recibopuestoeventualactivo, " +
      "identificacionterceropuestoeventual, nombresector, fkidsector, fkidplaza, identificacionrecaudador, " +
      "nombrerecaudador, apellidorecaudador, fkidusuariorecaudador FROM trecibopuestoeventual WHERE sincronizado=0";
    return this.database.executeSql(sql, []);
  }

  /**
   * actualizarRecEventuales() actualiza el campo 'sincronizado' cuando se ha realizado correctamente la sincronización
   */
  actualizarRecEventuales() {
    let sql = "UPDATE trecibopuestoeventual  SET sincronizado = 1 WHERE sincronizado = 0";
    return this.database.executeSql(sql, []);
  }

  /**
   * Tarifa parqueaderos
   */
  getAllTarifaParqueadero() {
    return this.database.executeSql("SELECT * FROM ttarifaparqueadero", []).then((data) => {

      let tarifaparqueadero = [];
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          tarifaparqueadero.push(data.rows.item(i))
        }
        console.log("N° Registros tarifaparqueadero: " + data.rows.length);

      } else {
        console.log("No hay datos tarifaparqueadero!");
      }

      //this.setDesocupado();
      return tarifaparqueadero;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * getAllRecibosParqueadero() lista los recibos parqueadero existentes en la bd local
   */
  getAllRecibosParqueadero() {
    return this.database.executeSql("SELECT * FROM treciboparqueadero", []).then((data) => {

      let recibosparqueadero = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          recibosparqueadero.push(data.rows.item(i))
        }
        console.log("N° Registros Recibos parqueadero: " + data.rows.length);

      } else {
        console.log("No hay datos rec.parqueadero!");
      }

      return recibosparqueadero;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
  * getRecParqueadero() selecciona los recibos que no se hayan sincronizado
  */
  getRecParqueadero() {
    let sql = "SELECT  numeroreciboparqueadero, valoreciboparqueadero, creacionreciboparqueadero, " +
      "modificacionreciboparqueadero, fkidtarifaparqueadero, valortarifa, " +
      "nombreterceroparqueadero, identificacionterceroparqueadero, nombreplaza, reciboparqueaderoactivo, " +
      "fkidplaza, fkidparqueadero, fkidtipoparqueadero, numeroparqueadero, nombretipoparqueadero, " +
      "identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador FROM treciboparqueadero WHERE sincronizado=0";
    return this.database.executeSql(sql, []);
  }

  /**
   * actualizarRecParqueadero() actualiza el campo 'sincronizado' cuando se ha realizado correctamente la sincronización
   */
  actualizarRecParqueadero() {
    let sql = "UPDATE treciboparqueadero  SET sincronizado = 1 WHERE sincronizado = 0";
    return this.database.executeSql(sql, []);
  }


  /**
   * Tarifa pesaje
   */
  getAllTarifaPesaje() {
    return this.database.executeSql("SELECT * FROM ttarifapesaje", []).then((data) => {

      let tarifapesaje = [];
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          tarifapesaje.push(data.rows.item(i))
        }
        console.log("N° Registros tarifapesaje: " + data.rows.length);

      } else {
        console.log("No hay datos tarifapesaje!");
      }

      //this.setDesocupado();
      return tarifapesaje;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * getAllRecibosPesaje() lista los recibos pesaje existentes en la bd local
   */
  getAllRecibosPesaje() {
    return this.database.executeSql("SELECT * FROM trecibopesaje", []).then((data) => {

      let recibospesaje = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          recibospesaje.push(data.rows.item(i))
        }
        console.log("N° Registros Recibos pesaje: " + data.rows.length);

      } else {
        console.log("No hay datos rec.parqueadero!");
      }

      return recibospesaje;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
  * getRecPesaje() selecciona los recibos que no se hayan sincronizado
  */
  getRecPesaje() {
    let sql = "SELECT numerorecibopesaje, valorecibopesaje, pesoanimal, creacionrecibopesaje, " +
      "modificacionrecibopesaje, fkidtarifapesaje, valortarifa, nombreterceropesaje, identificacionterceropesaje, " +
      "nombreplaza, recibopesajeactivo, fkidplaza, fkidcategoriaanimal, nombrecategoriaanimal, fkidtipoanimal, " +
      "nombretipoanimal, fkidespecieanimal, nombreespecieanimal, identificacionrecaudador, nombrerecaudador, " +
      "apellidorecaudador, fkidusuariorecaudador FROM trecibopesaje WHERE sincronizado=0";
    return this.database.executeSql(sql, []);
  }

  /**
   * actualizarRecPesaje() actualiza el campo 'sincronizado' cuando se ha realizado correctamente la sincronización
   */
  actualizarRecPesaje() {
    let sql = "UPDATE trecibopesaje  SET sincronizado = 1 WHERE sincronizado = 0";
    return this.database.executeSql(sql, []);
  }


  /**
   * Tarifa puesto
   */
  getAllTarifaPuesto() {
    return this.database.executeSql("SELECT * FROM ttarifapuesto", []).then((data) => {

      let tarifapuesto = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tarifapuesto.push(data.rows.item(i))
        }
        console.log("N° Registros tarifapuesto: " + data.rows.length);

      } else {
        console.log("No hay datos tarifapuesto!");
      }

      //this.setDesocupado();
      return tarifapuesto;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }



  /**
   * Tarifa puesto eventual
   */
  getAllTarifaPuestoEventual() {
    return this.database.executeSql("SELECT * FROM ttarifapuestoeventual", []).then((data) => {

      let tarifapuestoeventual = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tarifapuestoeventual.push(data.rows.item(i))
        }
        console.log("N° Registros tarifapuestoeventual: " + data.rows.length);

      } else {
        console.log("No hay datos tarifapuestoeventual!");
      }

      //this.setDesocupado();
      return tarifapuestoeventual;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Tarifa vehiculo
   */
  getAllTarifaVehiculo() {
    return this.database.executeSql("SELECT * FROM ttarifavehiculo", []).then((data) => {

      let tarifavehiculo = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tarifavehiculo.push(data.rows.item(i))
        }
        console.log("N° Registros tarifavehiculo: " + data.rows.length);

      } else {
        console.log("No hay datos tarifavehiculo!");
      }

      //this.setDesocupado();
      return tarifavehiculo;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * getAllRecibosVehiculo() lista los recibos vehículo existentes en la bd local
   */
  getAllRecibosVehiculo() {
    return this.database.executeSql("SELECT * FROM trecibovehiculo", []).then((data) => {

      let recibosvehiculo = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          recibosvehiculo.push(data.rows.item(i))
        }
        console.log("N° Registros Recibos Vehículo : " + data.rows.length);

      } else {
        console.log("No hay datos rec.puesto vehículo!");
      }

      return recibosvehiculo;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * getRecVehiculo() selecciona los recibos que no se hayan sincronizado
   */
  getRecVehiculo() {
    let sql = "SELECT numerorecibovehiculo, numeroplaca, valorecibovehiculo, creacionrecibovehiculo, modificacionrecibovehiculo, fkidtarifavehiculo, valortarifa, nombretercerovehiculo, identificaciontercerovehiculo, nombreplaza, recibovehiculoactivo, fkidplaza, fkidtipovehiculo, nombretipovehiculo, identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador, nombrepuerta, fkidpuerta FROM trecibovehiculo WHERE sincronizado=0";
    return this.database.executeSql(sql, []);
  }

  /**
   * actualizarRecVehiculo() actualiza el campo 'sincronizado' cuando se ha realizado correctamente la sincronización
   */
  actualizarRecVehiculo() {
    let sql = "UPDATE trecibovehiculo  SET sincronizado = 1 WHERE sincronizado = 0";
    return this.database.executeSql(sql, []);
  }

  /**
   *  zonas
   */
  getAllZonas() {
    return this.database.executeSql("SELECT * FROM tzona", []).then((data) => {

      let zonas = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          zonas.push(data.rows.item(i))
        }
        console.log("N° Registros zonas: " + data.rows.length);

      } else {
        console.log("No hay datos zonas!");
      }

      //this.setDesocupado();
      return zonas;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   *  Puertas
   */
  getAllPuertas() {
    return this.database.executeSql("SELECT * FROM tpuerta", []).then((data) => {

      let puertas = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          puertas.push(data.rows.item(i))
        }
        console.log("N° Registros puertas: " + data.rows.length);

      } else {
        console.log("No hay datos puertas!");
      }

      //this.setDesocupado();
      return puertas;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Tarifa Tipo Puesto
   */
  getAllTipoPuesto() {
    return this.database.executeSql("SELECT * FROM ttipopuesto", []).then((data) => {

      let tipopuesto = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tipopuesto.push(data.rows.item(i))
        }
        console.log("N° Registros tipopuesto: " + data.rows.length);

      } else {
        console.log("No hay datos tipopuesto!");
      }

      //this.setDesocupado();
      return tipopuesto;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Tarifa Tipo Parqueadero
   */
  getAllTipoParqueadero() {
    return this.database.executeSql("SELECT * FROM ttipoparqueadero", []).then((data) => {

      let tipoparqueadero = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tipoparqueadero.push(data.rows.item(i))
        }
        console.log("N° Registros tipoparqueadero: " + data.rows.length);

      } else {
        console.log("No hay datos tipoparqueadero!");
      }

      //this.setDesocupado();
      return tipoparqueadero;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Tarifa Tipo Parqueadero
   */
  getAllParqueadero() {
    return this.database.executeSql("SELECT * FROM tparqueadero", []).then((data) => {

      let parqueadero = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          parqueadero.push(data.rows.item(i))
        }
        console.log("N° Registros parqueadero: " + data.rows.length);

      } else {
        console.log("No hay datos parqueadero!");
      }

      //this.setDesocupado();
      return parqueadero;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Tarifa Tipo categoria animal
   */
  getAllCategoriaAnimal() {
    return this.database.executeSql("SELECT * FROM tcategoriaanimal", []).then((data) => {

      let categoriaanimal = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          categoriaanimal.push(data.rows.item(i))
        }
        console.log("N° Registros categoriaanimal: " + data.rows.length);

      } else {
        console.log("No hay datos categoriaanimal!");
      }

      //this.setDesocupado();
      return categoriaanimal;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Tarifa Tipo categoria animal
   */
  getAllEspecieAnimal() {
    return this.database.executeSql("SELECT * FROM tespecieanimal", []).then((data) => {

      let especieanimal = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          especieanimal.push(data.rows.item(i))
        }
        console.log("N° Registros especieanimal: " + data.rows.length);

      } else {
        console.log("No hay datos especieanimal!");
      }

      //this.setDesocupado();
      return especieanimal;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Facturas
   */
  getAllFacturas() {
    return this.database.executeSql("SELECT * FROM tfactura", []).then((data) => {

      let facturas = [];
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          facturas.push(data.rows.item(i))
        }
        console.log("N° Registros facturas: " + data.rows.length);

      } else {
        console.log("No hay datos facturas!");
      }

      //this.setDesocupado();
      return facturas;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Equipos
   */
  getAllEquipos() {
    return this.database.executeSql("SELECT * FROM tequipo", []).then((data) => {

      let equipos = [];
      if (data.rows.length > 0) {
        // this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          equipos.push(data.rows.item(i))
        }
        console.log("N° Registros equipos: " + data.rows.length);

      } else {
        console.log("No hay datos equipos!");
      }

      //this.setDesocupado();
      return equipos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }



  /******************************************************************************************/
  /******************************************************************************************/
  /******************************************************************************************/

  anularReciboEventual(idsqlite) {
    return this.database.executeSql("UPDATE trecibopuestoeventual SET recibopuestoeventualactivo = 0 WHERE pkidsqlite=" + idsqlite + ";").then((data) => { return data }).catch((e) => { throw e; });
  }

  consultaReciboEventual(idplaza, numRecibo, identificacion) {

    //return this.database.executeSql("SELECT pkidsqlite,pkidplaza,nombreplaza, 1 as sincronizado FROM tplaza;", []).then((data) => {
    return this.database.executeSql("SELECT pkidsqlite,pkidrecibopuestoeventual,numerorecibopuestoeventual,valorecibopuestoeventual,creacionrecibopuestoeventual,modificacionrecibopuestoeventual,identificacionterceropuestoeventual,fkidtarifapuestoeventual,fkidplaza,valortarifa,nombreplaza,nombreterceropuestoeventual,recibopuestoeventualactivo,nombresector,fkidsector,identificacionrecaudador,nombrerecaudador,apellidorecaudador,fkidusuariorecaudador,sincronizado FROM trecibopuestoeventual "
      + "WHERE (" + idplaza + "=-1 OR fkidplaza = " + idplaza + ") AND ('" + numRecibo + "'='' OR numerorecibopuestoeventual LIKE '" + numRecibo + "') AND ('" + identificacion + "' = '' OR identificacionterceropuestoeventual LIKE '" + identificacion + "');"
      , []).then((data) => {
        let recibos = [];
        if (data.rows.length > 0) {
          this.setOcupado('Cargando datos');
          console.log("listando recibos ", data.rows.length);

          let primary = true;
          for (var i = 0; i < data.rows.length; i++) {

            let aux = {
              pkidsqlite: data.rows.item(i).pkidsqlite,
              norecibo: data.rows.item(i).numerorecibopuestoeventual,
              nombre: data.rows.item(i).nombreterceropuestoeventual,
              valor: data.rows.item(i).valorecibopuestoeventual,
              fecha: data.rows.item(i).creacionrecibopuestoeventual,
              extra: data.rows.item(i).identificacionterceropuestoeventual,
              color: primary ? "rojo" : "azul",
              estado: data.rows.item(i).recibopuestoeventualactivo == 1 ? "" : "ANULADO",
              sincronizado: data.rows.item(i).sincronizado == 1 ? "Sincronizado" : "Sin sincronizar",
              completo: data.rows.item(i) //se guarda todo el recibo.
            };

            primary = !primary;

            recibos.push(aux);
          }
        }
        this.setDesocupado();
        return recibos;
      });
  }


  //Insertar Recibo Puesto Fijo
  insertarReciboPuesto(recibo) {
    let sql = "INSERT INTO trecibopuesto (numerofactura,nombrebeneficiario,identificacionbeneficiario,saldo,numeroacuerdo,valorcuotaacuerdo,valormultas,valorinteres,mesfactura,creacionrecibo,modificacionrecibo,pkidrecibopuesto,fkidfactura,numerorecibo,nombreterceropuesto,identificacionterceropuesto,nombreplaza,recibopuestoactivo,numeroresolucionasignacionpuesto,numeropuesto,nombresector,fkidzona,fkidsector,fkidpuesto,fkidasignacionpuesto,fkidplaza,fkidbeneficiario,fkidacuerdo,identificacionrecaudador,nombrerecaudador,apellidorecaudador,fkidusuariorecaudador,valorpagado,saldoporpagar,nombrezona,abonototalacuerdo,abonocuotaacuerdo,abonodeudaacuerdo,abonodeuda,abonomultas,abonocuotames)"
      + " VALUES ("
      + "'" + recibo["numerofactura"] + "',"
      + "'" + recibo["nombrebeneficiario"] + "',"
      + "'" + recibo["identificacionbeneficiario"] + "',"
      + "" + recibo["saldo"] + ","
      + "'" + recibo["numeroacuerdo"] + "',"
      + "" + recibo["valorcuotaacuerdo"] + ","
      + "" + recibo["valormultas"] + ","
      + "" + recibo["valorinteres"] + ","
      + "" + recibo["mesfactura"] + ","
      + "'" + recibo["creacionrecibo"] + "',"
      + "'" + recibo["modificacionrecibo"] + "',"
      + "" + recibo["pkidrecibopuesto"] + ","
      + "" + recibo["fkidfactura"] + ","
      + "'" + recibo["numerorecibo"] + "',"
      + "'" + recibo["nombreterceropuesto"] + "',"
      + "'" + recibo["identificacionterceropuesto"] + "',"
      + "'" + recibo["nombreplaza"] + "',"
      + "" + recibo["recibopuestoactivo"] + ","
      //+ "'" + recibo["numeroresolucionasignacionpuesto"] + "',"
      + "'RESOLUCION_01',"
      + "'" + recibo["numeropuesto"] + "',"
      + "'" + recibo["nombresector"] + "',"
      + "" + recibo["fkidzona"] + ","
      + "" + recibo["fkidsector"] + ","
      + "" + recibo["fkidpuesto"] + ","
      + "" + recibo["fkidasignacionpuesto"] + ","
      + "" + recibo["fkidplaza"] + ","
      + "" + recibo["fkidbeneficiario"] + ","
      + "" + recibo["fkidacuerdo"] + ","
      + "'" + recibo["identificacionrecaudador"] + "',"
      + "'" + recibo["nombrerecaudador"] + "',"
      + "'" + recibo["apellidorecaudador"] + "',"
      + "" + recibo["fkidusuariorecaudador"] + ","
      + "" + recibo["valorpagado"] + ","
      + "" + recibo["saldoporpagar"] + ","
      + "'" + recibo["nombrezona"] + "',"
      + "" + recibo["abonototalacuerdo"] + ","
      + "" + recibo["abonocuotaacuerdo"] + ","
      + "" + recibo["abonodeudaacuerdo"] + ","
      + "" + recibo["abonodeuda"] + ","
      + "" + recibo["abonomultas"] + ","
      + "" + recibo["abonocuotames"] + ");";

    console.log(sql);
    return this.database.executeSql(sql).then(data => {
      console.log("Recibo fijo Guardado!");
      return data;
    }, err => {
      //console.log('Error add recibo fijo: ', err.message, 'NO GUARDADO!');
      throw err;
    })
      .catch((error) => {
        console.log('Error catch RE: ', error.message);
        throw error;
      });
  }

  //Insertar Recibo Parqueadero
  insertarReciboParqueadero(recibo) {
    let sql = "INSERT INTO treciboparqueadero (pkidreciboparqueadero, numeroreciboparqueadero, valoreciboparqueadero, creacionreciboparqueadero, modificacionreciboparqueadero, fkidtarifaparqueadero, valortarifa, nombreterceroparqueadero, identificacionterceroparqueadero, nombreplaza, reciboparqueaderoactivo, fkidplaza, fkidparqueadero, fkidtipoparqueadero, numeroparqueadero, nombretipoparqueadero, identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador)"
      + " VALUES ("
      + "'" + recibo["pkidreciboparqueadero"] + "',"
      + "'" + recibo["numeroreciboparqueadero"] + "',"
      + "'" + recibo["valoreciboparqueadero"] + "',"
      + "'" + recibo["creacionreciboparqueadero"] + "',"
      + "'" + recibo["modificacionreciboparqueadero"] + "',"
      + "'" + recibo["fkidtarifaparqueadero"] + "',"
      + "" + recibo["valortarifa"] + ","
      + "'" + recibo["nombreterceroparqueadero"] + "',"
      + "'" + recibo["identificacionterceroparqueadero"] + "',"
      + "'" + recibo["nombreplaza"] + "',"
      + "" + recibo["reciboparqueaderoactivo"] + ","
      + "'" + recibo["fkidplaza"] + "',"
      + "'" + recibo["fkidparqueadero"] + "',"
      + "'" + recibo["fkidtipoparqueadero"] + "',"
      + "'" + recibo["numeroparqueadero"] + "',"
      + "'" + recibo["nombretipoparqueadero"] + "',"
      + "'" + recibo["identificacionrecaudador"] + "',"
      + "'" + recibo["nombrerecaudador"] + "',"
      + "'" + recibo["apellidorecaudador"] + "',"
      + "'" + recibo["fkidusuariorecaudador"] + "');";

    console.log(sql);
    return this.sqlitePorter.importSqlToDb(this.database, sql)
      .then(data => {
        console.log("Recibo parqueadero guardado!");

        return data;
      });
  }

  //Insertar Recibo Pesaje
  insertarReciboPesaje(recibo) {
    let sql = "INSERT INTO trecibopesaje (pkidrecibopesaje, numerorecibopesaje, valorecibopesaje, pesoanimal, creacionrecibopesaje, modificacionrecibopesaje, fkidtarifapesaje, valortarifa, nombreterceropesaje, identificacionterceropesaje, nombreplaza, recibopesajeactivo, fkidplaza, fkidcategoriaanimal, nombrecategoriaanimal, fkidtipoanimal, nombretipoanimal, fkidespecieanimal, nombreespecieanimal, identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador)"
      + " VALUES ("
      + "'" + recibo["pkidrecibopesaje"] + "',"
      + "'" + recibo["numerorecibopesaje"] + "',"
      + "'" + recibo["valorecibopesaje"] + "',"
      + "'" + recibo["pesoExacto"] + "',"
      + "'" + recibo["creacionrecibopesaje"] + "',"
      + "'" + recibo["modificacionrecibopesaje"] + "',"
      + "" + recibo["fkidtarifapesaje"] + ","
      + "" + recibo["valortarifa"] + ","
      + "'" + recibo["nombreterceropesaje"] + "',"
      + "'" + recibo["identificacionterceropesaje"] + "',"
      + "'" + recibo["nombreplaza"] + "',"
      + "" + recibo["recibopesajeactivo"] + ","
      + "" + recibo["fkidplaza"] + ","
      + "'" + recibo["fkidcategoriaanimal"] + "',"
      + "'" + recibo["nombrecategoriaanimal"] + "',"
      + "'" + recibo["fkidtipoanimal"] + "',"
      + "'" + recibo["nombretipoanimal"] + "',"
      + "'" + recibo["fkidespecieanimal"] + "',"
      + "'" + recibo["nombreespecieanimal"] + "',"
      + "'" + recibo["identificacionrecaudador"] + "',"
      + "'" + recibo["nombrerecaudador"] + "',"
      + "'" + recibo["apellidorecaudador"] + "',"
      + "'" + recibo["fkidusuariorecaudador"] + "');";

    console.log(sql);
    return this.sqlitePorter.importSqlToDb(this.database, sql)
      .then(data => {
        console.log("Recibo pesaje guardado!");

        return data;
      });
  }

  //Insertar Recibo Vehiculo
  insertarReciboVehiculo(recibo) {
    let sql = "INSERT INTO trecibovehiculo (numerorecibovehiculo, numeroplaca, valorecibovehiculo, creacionrecibovehiculo, modificacionrecibovehiculo, pkidrecibovehiculo, fkidtarifavehiculo, valortarifa, nombretercerovehiculo, identificaciontercerovehiculo, nombreplaza, recibovehiculoactivo, fkidplaza, fkidtipovehiculo, nombretipovehiculo, identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador, nombrepuerta, fkidpuerta)"
      + " VALUES ("
      + "'" + recibo["numerorecibovehiculo"] + "',"
      + "'" + recibo["numeroplaca"] + "',"
      + "'" + recibo["valorecibovehiculo"] + "',"
      + "'" + recibo["creacionrecibovehiculo"] + "',"
      + "'" + recibo["modificacionrecibovehiculo"] + "',"
      + "" + recibo["pkidrecibovehiculo"] + ","
      + "" + recibo["fkidtarifavehiculo"] + ","
      + "" + recibo["valortarifa"] + ","
      // + "" + recibo["nombretercerovehiculo"] + ","
      // + "'" + recibo["identificaciontercerovehiculo"] + "',"
      + "'Usuario',"
      + "'Identificación',"
      + "'" + recibo["nombreplaza"] + "',"
      + "" + recibo["recibovehiculoactivo"] + ","
      + "" + recibo["fkidplaza"] + ","
      + "'" + recibo["fkidtipovehiculo"] + "',"
      + "'" + recibo["nombretipovehiculo"] + "',"
      + "'" + recibo["identificacionrecaudador"] + "',"
      + "'" + recibo["nombrerecaudador"] + "',"
      + "'" + recibo["apellidorecaudador"] + "',"
      + "'" + recibo["fkidusuariorecaudador"] + "',"
      + "'" + recibo["nombrepuerta"] + "',"
      + "" + recibo["fkidpuerta"] + ");";

    console.log(sql);
    return this.sqlitePorter.importSqlToDb(this.database, sql)
      .then(data => {
        console.log("Recibo vehículo guardado!");

        return data;
      });
  }

  /**
   * getAllRecibosPuestoFijo() lista los recibos puesto fijo existentes en la bd local
   */
  getAllRecibosPuestoFijo() {
    return this.database.executeSql("SELECT * FROM trecibopuesto", []).then((data) => {

      let recibospuestofijo = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          recibospuestofijo.push(data.rows.item(i))
        }
        console.log("N° Registros Recibos puesto fijo: " + data.rows.length);

      } else {
        console.log("No hay datos rec.puesto fijo!");
      }

      return recibospuestofijo;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }


  /**
   * getRecPuestoFijo() selecciona los recibos que no se hayan sincronizado
   */
  getRecPuestoFijo() {
    let sql = "SELECT numerofactura, nombrebeneficiario, identificacionbeneficiario, saldo, numeroacuerdo, valorcuotaacuerdo, valormultas, valorinteres, mesfactura, creacionrecibo, modificacionrecibo, fkidfactura, numerorecibo, nombreterceropuesto, identificacionterceropuesto, nombreplaza, recibopuestoactivo, numeroresolucionasignacionpuesto, numeropuesto, nombresector, fkidzona, fkidsector, fkidpuesto, fkidasignacionpuesto, fkidplaza, fkidbeneficiario, fkidacuerdo, identificacionrecaudador, nombrerecaudador, apellidorecaudador, fkidusuariorecaudador, valorpagado, saldoporpagar, nombrezona, abonototalacuerdo, abonocuotaacuerdo, abonodeudaacuerdo, abonodeuda, abonomultas, abonocuotames FROM trecibopuesto WHERE sincronizado=0";
    return this.database.executeSql(sql, []);
  }

  /**
   * actualizarRecPuestoFijo() actualiza el campo 'sincronizado' cuando se ha realizado correctamente la sincronización
   */
  actualizarRecPuestoFijo() {
    let sql = "UPDATE trecibopuesto  SET sincronizado = 1 WHERE sincronizado = 0";
    return this.database.executeSql(sql, []);
  }

  getTipoParqueaderoByPlaza(idplaza) {
    return this.database.executeSql("SELECT pkidtipoparqueadero,nombretipoparqueadero,pkidtarifaparqueadero,valortarifaparqueadero FROM ttipoparqueadero LEFT JOIN ttarifaparqueadero ON pkidtipoparqueadero=fkidtipoparqueadero WHERE fkidplaza = " + idplaza + "; ", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i))
        }
        console.log("N° Registros TipoParqueaderoByPlaza: " + data.rows.length);

      } else {
        console.log("No hay datos TipoParqueaderoByPlaza!");
      }

      //this.setDesocupado();
      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getParqueaderoByPlaza(idplaza) {
    return this.database.executeSql("SELECT pkidparqueadero,numeroparqueadero,pkidtarifaparqueadero,valortarifaparqueadero, nombretipoparqueadero, pkidtipoparqueadero FROM tparqueadero JOIN ttipoparqueadero ON tparqueadero.fkidtipoparqueadero = pkidtipoparqueadero LEFT JOIN ttarifaparqueadero ON tparqueadero.fkidtipoparqueadero=ttarifaparqueadero.fkidtipoparqueadero WHERE tparqueadero.fkidplaza = " + idplaza + "; ", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i))
        }
        console.log("N° Registros ParqueaderoByPlaza: " + data.rows.length);

      } else {
        console.log("No hay datos ParqueaderoByPlaza!");
      }

      //this.setDesocupado();
      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getTarifaByTipoVehiculo(idplaza) {
    //SELECT pkidtarifavehiculo, valortarifavehiculo, fkidtipovehiculo, nombretipovehiculo FROM ttarifavehiculo LEFT JOIN ttipovehiculo ON fkidtipovehiculo=pkidtipovehiculo;
    return this.database.executeSql("SELECT pkidtarifavehiculo, valortarifavehiculo, pkidtipovehiculo, nombretipovehiculo FROM ttarifavehiculo LEFT JOIN ttipovehiculo ON fkidtipovehiculo=pkidtipovehiculo WHERE fkidplaza = " + idplaza + "; ", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i))
        }
        console.log("N° Registros TaridaByTipoVehiculo: " + data.rows.length);

      } else {
        console.log("No hay datos TaridaByTipoVehiculo!");
      }

      //this.setDesocupado();
      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  
  //CAMBIO
  getTarifaEventual(idplaza) {
    return this.database.executeSql("SELECT pkidtarifapuestoeventual, valortarifapuestoeventual FROM ttarifapuestoeventual WHERE fkidplaza = " + idplaza + " AND tarifapuestoeventualactivo= 'true' LIMIT 1; ", []).then((data) => {
      let tarifape = [];
      if (data.rows.length > 0) {
        return data.rows.item(0);

      } else {
        console.log("No hay datos getTarifaEventual!");
      }

      // this.setDesocupado();
      return tarifape;

    }, err => {
      console.log('Error: ', err.message);
      return null;
    });
  }

  getTarifaPesaje(idplaza) {
    return this.database.executeSql("SELECT pkidtarifapesaje, valortarifapesaje FROM ttarifapesaje WHERE fkidplaza = " + idplaza + " AND tarifapesajeactivo='true' LIMIT 1; ", []).then((data) => {
     
      if (data.rows.length > 0) {
        //  this.setOcupado('Listando Datos Importados');
        return data.rows.item(0);


      } else {
        console.log("No hay datos getTarifaPesaje!");
      }

      // this.setDesocupado();
      return null;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getPuertaByPlaza(idplaza) {
    return this.database.executeSql("SELECT pkidpuerta, nombrepuerta, fkidplaza pkidplaza FROM tpuerta LEFT JOIN tplaza ON fkidplaza=pkidplaza WHERE fkidplaza = " + idplaza + "; ", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i))
        }
        console.log("N° Registros PuertaByPlaza: " + data.rows.length);

      } else {
        console.log("No hay datos PuertaByPlaza!");
      }

      //this.setDesocupado();
      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }



  //Consultas para 
  //SELECT pkidzona, codigozona, nombrezona, zonaactivo fkidplaza FROM tzona WHERE fkidplaza = 14 AND zonaactivo = 1;

  getAllTipoVehiculo() {
    return this.database.executeSql("SELECT * FROM ttipovehiculo", []).then((data) => {

      let tipovehiculo = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tipovehiculo.push(data.rows.item(i))
        }
        console.log("N° Registros tipovehiculo: " + data.rows.length);

      } else {
        console.log("No hay datos tipovehiculo!");
      }

      return tipovehiculo;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  getAllTipoAnimal() {
    return this.database.executeSql("SELECT * FROM ttipoanimal", []).then((data) => {

      let tipoanimal = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          tipoanimal.push(data.rows.item(i))
        }
        console.log("N° Registros tipoanimal: " + data.rows.length);

      } else {
        console.log("No hay datos tipoanimal!");
      }

      return tipoanimal;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  //SELECT pkidtipoanimal, nombretipoanimal, pkidespecieanimal, nombreespecieanimal, fkidtipoanimal FROM tespecieanimal  LEFT JOIN ttipoanimal ON fkidtipoanimal = pkidtipoanimal
  getEspecieByTipoAnimal(idtipoanimal) {

    return this.database.executeSql("SELECT pkidtipoanimal, nombretipoanimal, pkidespecieanimal, nombreespecieanimal, fkidtipoanimal FROM tespecieanimal  LEFT JOIN ttipoanimal ON fkidtipoanimal = pkidtipoanimal WHERE fkidtipoanimal = " + idtipoanimal + "; ", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i))
        }
        console.log("N° Registros EspecieByTipoAnimal: " + data.rows.length);

      } else {
        console.log("No hay datos EspecieByTipoAnimal!");
      }

      //this.setDesocupado();
      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }




  buscarFacturas(fkidplaza, fkidsector, npuesto: string, cc: string) {
    return this.database.executeSql("select * from tfactura where fkidplaza = " + fkidplaza + " and (fkidsector = -1 OR fkidsector = " + fkidsector + ") and (" + npuesto + "='' OR nombrepuesto = " + npuesto + ") AND (" + cc + " = '' OR identificacionbeneficiario=" + cc + ")", []).then((data) => {

      let datos = [];
      if (data.rows.length > 0) {
        //this.setOcupado('Listando Datos Importados');
        for (var i = 0; i < data.rows.length; i++) {
          datos.push(data.rows.item(i));
        }
        console.log("N° Registros recibos: " + data.rows.length);
      }
      //this.setDesocupado();
      return datos;

    }, err => {
      console.log('Error: ', err.message);
      return [];
    });
  }

  /**
   * Busca el número de recibo para actualizar en la base de datos del servidor
   * en la tabla usuario
   */
  getNumRecibo() {
    let sql = "SELECT pkidusuario, numerorecibo FROM tusuario WHERE pkidsqlite = " + this.singleton.usuario['pkidsqlite'];
    return this.database.executeSql(sql, []);
  }




}
