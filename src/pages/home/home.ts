import { GLOBAL } from './../../providers/fecha/globales';
import { Http, Headers } from '@angular/http';
import { ApiServicesProvider } from '../../providers/api-services/api-services';
import { Component, ViewChild } from '@angular/core';
import { NavController, ToastController, LoadingController, NavParams } from 'ionic-angular';
import { Storage } from '@ionic/storage';
import { PlazasPage } from '../plazas/plazas';
import jsSHA from 'jssha'
import 'rxjs/add/operator/map';
import { DatabaseProvider } from '../../providers/database/database';
import { SincGetProvider } from '../../providers/sinc-get/sinc-get';
import { SingletonProvider } from '../../providers/singleton/singleton';
import { Keyboard } from '@ionic-native/Keyboard';
import { ConfiguracionesPage } from '../configuraciones/configuraciones';
import { Uid } from '@ionic-native/uid';
import { AndroidPermissions } from '@ionic-native/android-permissions';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  @ViewChild('txtUsuario') txtUsuario;
  @ViewChild('txtPass') txtPass;
  @ViewChild('iPass') iPass;

  conPermisos:boolean;
  equipoRegistrado:boolean;
  identificacion: number; //Identificación del inicio de sesión
  contrasenia: string; //Contraseña del inicio de sesión

  classOjo = "fas fa-eye"
  //Datos para storage
  keyRecaudador: string = "nomRecaudadorData";
  recaudador: any = '';
  numrecibo: any = '';
  nombreusuario: any;
  apellido: any;
  pass: any;
  titulo = '¡BIENVENIDO!';

  usuarios = [];
  registros: any;
  flagLogin: any;

  loading: any;

  //Datos del storage
  _TOKEN: any = "tokenData";
  TOKEN: any;
  public API_URL: string;
  public headers;
  public keyIdentificacion: string = 'identiData';

  retornar;
  getAuth = false;
  constructor(
    public navCtrl: NavController,
    public myToastCtrl: ToastController,
    public loadingCtrl: LoadingController,
    public navParams: NavParams,
    private storage: Storage,
    public apiServices: ApiServicesProvider,
    public databaseprovider: DatabaseProvider,
    public http: Http,
    private sincget: SincGetProvider, private keyboard: Keyboard,
    private singleton: SingletonProvider,
    private uid: Uid,
    private androidPermissions: AndroidPermissions
  ) {

    this.API_URL = GLOBAL.url;
    this.headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });

  }

  aceptar() {
    this.retornar(true).then(() => {
      this.navCtrl.pop();
    });
  }

  cancelar() {
    this.retornar(false).then(() => {
      this.navCtrl.pop();
    });
  }

  ionViewDidLoad() {

    this.getImei();
    this.getAuth = this.navParams.get("getAuth");
    this.retornar = this.navParams.get("callback");

    if (this.getAuth) {
      this.titulo = "Autorizar";

    }
    setTimeout(() => {
      //this.keyboard.show() // for android      
      this.keyboard.setResizeMode();
      this.txtUsuario.setFocus();
      this.keyboard.show() // for android
      this.setOcupado();
      if (!this.databaseprovider.databaseReady.value) {
        let aux = this.databaseprovider.databaseReady.subscribe((listo) => {
          try {

            if (listo) {
              aux.unsubscribe();
              this.setDesocupado();
            }
          } catch (error) {

          }
        });
      }
      else {
        this.setDesocupado();
      }
    }, 150);


  }

  enter() {

  }
  ionViewWillLeave() {
    this.storage.get(this._TOKEN).then((val) => {
      this.TOKEN = val;
      //console.log('LO CAPTURE!: ', this.TOKEN);
    });
  }

  /**
   * 
   * @param mensaje recibe el mensaje que se mostrará en el loadingController
   */
  setOcupado(mensaje: string = 'cargando') {
    this.loading = this.loadingCtrl.create({
      content: mensaje
    });

    this.loading.present();

  }

  setDesocupado() {
    try {
      this.loading.dismiss().catch(() => console.error("home"));
    } catch (error) {

    }
  }


  // /**
  //  * Verifica si la tabla usuarios existe en la bd local
  //  */
  // registrosNum() {
  //   this.databaseprovider.numeroregistrosUsuarios().then(data => {
  //     this.registros = data;
  //     console.log("REGISTRO!: ", this.registros);
  //   })


  // }

  /**
   * Valida los datos de entrada en el Inicio de sesión
   * de ser correcta la identificación y la contraseña iniciada
   * lo direccionará al menu de plazas
   */
  iniciarSesion() {

    this.contrasenia = this.txtPass.value;
    //COLOCAR MENSAJE DE ERROR
    if (!this.identificacion) {
      this.txtUsuario.setFocus();
      return;
    }
    if (!this.contrasenia) {
      this.txtPass.setFocus();
      return;
    }

    if (this.databaseprovider.databaseReady.value) {
      this.iniciandoSesion();
    }
    else {


    }
    //Guarda datos del recaudador en el storange
    //this.storage.set(this.keyIdentificacion, this.identificacion);
    console.log("Identificación Storange: " + this.identificacion);

  }

  private iniciandoSesion() {
    this.databaseprovider.numeroregistrosUsuarios().then(data => {
      this.registros = data;
      console.log("REGISTRO!: ", this.registros);
      if (this.getAuth || this.registros <= 0) {
        console.log("CONEXIÓN API");
        let loading = this.loadingCtrl.create({
          content: 'Iniciando sesión en el servidor...'
        });
        loading.present();
        let login = {
          contrasenia: this.contrasenia,
          identificacion: this.identificacion
        };
        this.apiServices.login(login)
          .then(res => {
            this.TOKEN = res;
            let msj = res;
            this.singleton.TOKEN = this.TOKEN;
            // this.storage.set(this._TOKEN, res);
            console.log("TOKEN: " + this._TOKEN);
            try {
              loading.dismiss().catch(() => console.error("dimis"));
            }
            catch (error) {
            }
            if (this.getAuth) {
              this.aceptar();
              return;
            }
            if (msj["status"] != 'error') {
              setTimeout(() => {
                this.getDataApi();
              }, 1500);
            }
            else {
              let toast = this.myToastCtrl.create({
                message: 'La identificación o la contraseña ingresada son incorrectas',
                duration: 3000,
                position: 'top'
              });
              toast.onDidDismiss(() => {
                console.log('toast Dismissed');
              });
              toast.present();
            }
          })
          .catch(error => {
            console.error("Error al iniciar: ", error.message);
          });
      }
      else if (this.registros == 1) {
        console.log("SIN CONEXIÓN");
        this.buscarUsuario();
      }
    });
  }

  getDataApi() {
    this.setOcupado('Importando BD');
    let aux = this.sincget.prepararSinc().subscribe((listo) => {
      try {

        if (listo) {
          aux.unsubscribe();
          this.getUsuarios();
          this.setDesocupado();
        }
      } catch (error) {

      }
    });

  }

  /**
   * Trae los datos desde el API con (loadSectores();), 
   * los guarda en la variable sql_tipoSector 
   * y posteriormente crea el archivo RecaudoDB.sql el cual contiene la creación y los insert de la tabla tipo sector
   */
  getSectores() {
    console.log("inicio a descargar");

    this.sincget.loadSectores().then(() => {
      console.log("bien sectores");
    }).catch((err) => console.error(err.message));

  }

  getUsuarios() {
    //Usuarios
    console.log("inició a descargar Usuarios");
    this.sincget.loadUsuarios().then(() => {
      console.log("bien usuarios");
      this.buscarUsuario(true);
    }).catch((err) => console.error(err.message));

  }

  getPlazas() {
    console.log("inició a descargar plazas");

    this.sincget.loadPlazas().then(() => {
      console.log("bien plazaloadPlazas");
    }).catch((err) => console.error(err.message));
  }

  buscarUsuario(desdeLoginApi: boolean = false) {
    console.log("buscar: ", this.identificacion);
    this.databaseprovider.getUsuarioId(this.identificacion).then(
      (data) => {

        let usuario = data;

        if (desdeLoginApi || this.comprarPassword(this.contrasenia, usuario["contrasenia"])) {
          console.log("Son Iguales");
          this.guardarInfoUsuario(usuario);

          this.ingresar(desdeLoginApi);

        } else {
          console.log("No son iguales");
          let toast = this.myToastCtrl.create({
            message: 'La identificación o la contraseña ingresada son incorrectas',
            duration: 3000,
            position: 'top'
          });

          toast.onDidDismiss(() => {
            console.log('toast Dismissed');
          });

          toast.present();
        }

      })

  }

  private ingresar(primeraVez: boolean = false) {
    let loading = this.loadingCtrl.create({
      content: 'Iniciando Sesión...'
    });
    this.singleton.primeraVez = primeraVez;

    loading.present();
    setTimeout(() => {
      if (primeraVez) {
        this.navCtrl.setRoot(ConfiguracionesPage);
      }
      else {
        this.navCtrl.setRoot(PlazasPage);
      }
      try {
        loading.dismiss().catch(() => console.error("dimis"));
      }
      catch (error) {
      }
    }, 1500);
  }

  guardarInfoUsuario(usuario) {
    if (usuario != null) {
      this.recaudador = usuario["nombreusuario"] + ' ' + usuario["apellido"];
      this.storage.set(this.keyRecaudador, this.recaudador);
      //this.storage.set("RECAUDADOR", usuario);
      this.singleton.usuario = usuario;


    }

  }


  private comprarPassword(passTexto: string, passEncriptada: string): boolean {
    let shaObj = new jsSHA("SHA-256", "TEXT");
    console.log("Qué es = ", passTexto);

    shaObj.update(passTexto);
    let hash: string = shaObj.getHash("HEX");
    hash = hash.trim();
    console.log("pass encriptada", passEncriptada);

    //console.log("trim", passEncriptada.trim());

    //3passEncriptada=passEncriptada.trim();


    try {
      return hash == passEncriptada;
    } catch (error) {
      return true;
    }


  }


  mostrarPass() {
    try {
      this.txtPass.type = this.txtPass.type == "text" ? "password" : "text";
      this.classOjo = this.txtPass.type == "text" ? "fas fa-eye-slash" : "fas fa-eye";

      this.txtPass.setFocus();
    } catch (error) {

    }

  }


  async getImei() {
    this.equipoRegistrado=false;
    this.conPermisos=false;
    const { hasPermission } = await this.androidPermissions.checkPermission(
      this.androidPermissions.PERMISSION.READ_PHONE_STATE
    );
   
    if (!hasPermission) {
      const result = await this.androidPermissions.requestPermission(
        this.androidPermissions.PERMISSION.READ_PHONE_STATE
      );
   
      if (!result.hasPermission) {
        throw new Error('Permissions required');
      }
      
      
      window.location.reload();
      // ok, a user gave us permission, we can get him identifiers after restart app
      return;
    }
   this.conPermisos=true;
    console.error("Imei 2: ", this.uid.IMEI);
    
     this.singleton.IMEI= this.uid.IMEI
   }

}
