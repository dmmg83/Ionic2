import { HttpHeaders, HttpClient } from '@angular/common/http';
import { DatabaseProvider } from './../../providers/database/database';
import { GLOBAL } from './../../providers/fecha/globales';
import { ApiServicesProvider } from '../../providers/api-services/api-services';
import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, Platform } from 'ionic-angular';
import { MenuPrincipalPage } from '../menu-principal/menu-principal';
import { HomePage } from '../home/home';

import { Storage } from '@ionic/storage';
import { ConfiguracionesPage } from '../configuraciones/configuraciones';
import { SingletonProvider } from '../../providers/singleton/singleton';

/**
 * Generated class for the PlazasPage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

//@IonicPage()
@Component({
  selector: 'page-plazas',
  templateUrl: 'plazas.html',
})
export class PlazasPage {

  usuario = {};
  usuarios = [];
  plazas = [];
  sectores = [];
  puertas = [];
  tipovehiculos = [];
  tipoparqueaderos = [];
  parqueaderos = [];
  tarifapuestoeventual= [];
  tarifapesaje = [];
  

  plaza = null;
  sector = null;

  //variables select
  especies = [];
  especie = null;
  tiposanimal = [];
  tipoanimal = null;
  categoriasanimal = [];
  categoriaanimal = null;


  loading: any; //Mensaje de carga

  TOKEN: any;
  public API_URL: string;
  public headers;

  usuariosData: any[]; //descarga los datos de la REST API

  /* Variables para crear el archivo sql*/
  public pkidusuario: number;
  public nombreusuario: string;
  public mensajeError: string = '';
  public contrasenia: string;
  public apellido: number;
  public identificacion: string;
  public codigousuario: string;
  public rutaimagen: string;
  public usuarioactivo: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    private storage: Storage,
    public apiServices: ApiServicesProvider,
    public databaseprovider: DatabaseProvider,
    public http: HttpClient,
    private platform: Platform,
    private singleton: SingletonProvider
  ) {
    this.API_URL = GLOBAL.url;
    this.headers = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

    /**
     * Recupera el token que se generó al inicio de sesión
     */
    //this.storage.get(this._TOKEN).then((val) => {
    //  this.TOKEN = val;
    //});
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlazasPage');
    // plazas
    this.platform.ready().then(() => this.getPlazas());
  }

  ionViewCanEnter(){
    
    //console.log("Valor btns en Plazas: ", this.singleton.btn_fijos + " btn_eventuales: " + this.singleton.btn_eventuales + " btn_vehiculos: " + this.singleton.btn_vehiculos + " btn_animal: " + this.singleton.btn_animal + " btn_parqueadero: " + this.singleton.btn_parqueadero + "" );
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

  /**
   * Destruye el loading al obtener una respuesta
   */
  setDesocupado() {
    this.loading.dismiss();
  }

  getPlazas() {
    this.databaseprovider.getAllPlazas().then(data => {

      if (data) {
        this.plazas = data;
        this.plaza = this.plazas[0];
        this.singleton.plazas = this.plazas;
        console.log("plazas en plazas: ", this.plazas.length);
        console.log("Valor tarifa pesaje", this.plazas[0].valortarifapesaje);

        this.seleccionarPlaza();
      }
      else {
        this.plazas = [{ "nombreplaza": "Debe cargar plazas", "pkidsqlite": -1 }];
      }
    })
  }


  /**
   * Guarda la plaza seleccionada a recaudar en el singleton
   */
  seleccionarPlaza() {
    this.mensajeError = '';
    this.singleton.plaza = this.plaza;
    console.log("Plaza Singleton: " + this.plaza["nombreplaza"]);
    console.log("Valor tarifa pesaje", this.plaza.valortarifapesaje);

    this.cargarSectores();
    this.cargarTarifaTipoVehiculos();
    this.cargarPuertas();
    this.cargarParqueaderos(); 
    this.cargarTarifaPuestoEventual();
    this.cargarTarifaPesaje();
  }

  cargarTarifaTipoVehiculos() {
    this.tipovehiculos = [];
    this.databaseprovider.getTarifaByTipoVehiculo(this.plaza["pkidplaza"])
      .then((tarifastipovehiculo) => {

        this.singleton.tipovehiculos = tarifastipovehiculo;
        this.tipovehiculos = tarifastipovehiculo;
        if (this.tipovehiculos.length == 0) {
          this.mensajeError = "La plaza seleccionada no tiene tipo de vehiculos. Por favor comuníquese con el administrador.";
          console.error(this.mensajeError);

        }
      });
  }

  cargarTarifaPuestoEventual() {
    this.tarifapuestoeventual = [];
    this.databaseprovider.getTarifaEventual(this.plaza["pkidplaza"])
      .then((tarifapuestoeventual) => {

        this.singleton.tarifapuestoeventual = tarifapuestoeventual;
        this.tarifapuestoeventual = tarifapuestoeventual;
        if (this.tarifapuestoeventual == null) {
          this.mensajeError = "La plaza seleccionada no tiene tarifa de puesto eventual. Por favor comuníquese con el administrador.";
          console.error(this.mensajeError);

        }
      });
  }

  cargarTarifaPesaje() {
    this.tarifapesaje = [];
    this.databaseprovider.getTarifaPesaje(this.plaza["pkidplaza"])
      .then((tarifapesaje) => {

        this.singleton.tarifapesaje = tarifapesaje;
        this.tarifapesaje = tarifapesaje;
        if (this.tarifapesaje == null) {
          this.mensajeError = "La plaza seleccionada no tiene tarifa de pesaje. Por favor comuníquese con el administrador.";
          console.error(this.mensajeError);

        }
      });
  }

  cargarPuertas() {

    this.puertas = [];
    this.databaseprovider.getPuertaByPlaza(this.plaza["pkidplaza"]).then((puertass) => {

      this.singleton.puerta = puertass;
      this.puertas = puertass;
      if (this.puertas.length == 0) {
        this.mensajeError = "La plaza seleccionada no tiene puertas. Por favor comuníquese con el administrador.";
        console.error(this.mensajeError);

      }
    });
  }

  // cargarTarifaByParqueaderos() {
  //   this.tipoparqueaderos = [];
  //   this.databaseprovider.getTipoParqueaderoByPlaza(this.plaza["pkidplaza"])
  //     .then((tarifaparqueadero) => {

  //       this.singleton.tipoparqueadero = tarifaparqueadero;
  //       this.tipoparqueaderos = tarifaparqueadero;
  //       if (this.tipoparqueaderos.length == 0) {
  //         this.mensajeError = "La plaza seleccionada no tiene tipo de parqueaderos. Por favor comuníquese con el administrador.";
  //         console.error(this.mensajeError);

  //       }
  //     });
  // }

  cargarParqueaderos() {
    this.parqueaderos = [];
    this.databaseprovider.getParqueaderoByPlaza(this.plaza["pkidplaza"])
      .then((tarifa_parqueadero) => {

        this.singleton.parqueadero = tarifa_parqueadero;
        this.parqueaderos = tarifa_parqueadero;
        if (this.parqueaderos.length == 0) {
          this.mensajeError = "La plaza seleccionada no tiene parqueaderos. Por favor comuníquese con el administrador.";
          console.error(this.mensajeError);

        }
      });
  }


  cargarSectores() {

    this.sectores = [];
    this.databaseprovider.getSectoresByPlaza(this.plaza["pkidplaza"]).then((sectoress) => {

      this.singleton.sectoresPlaza = sectoress;
      this.sectores = sectoress;
      if (this.sectores.length == 0) {
        this.mensajeError = "La plaza seleccionada no tiene sectores. Por favor comuníquese con el administrador.";
        console.error(this.mensajeError);

      }
    });
  }

  /**
   * seleccionarRecaudos(); selecciona los tipos de recaudos
   * asignados a una plaza. De esta forma se construyen los
   * botones del menu recaudos
   */
  seleccionarRecaudos() {

    let opciones = [];
    this.databaseprovider.consultarRecaudosBotones(this.plaza["pkidplaza"]).then((opc) => {
      
      opciones = opc;
      let btn;
      opciones.forEach(dato => {
        btn = dato.fkidplaza + " " + dato.fkidtiporecaudo + " " + dato.nombretiporecaudo;
        console.log("BOTÓN: ", btn);

        if (dato.fkidtiporecaudo == 1) {
          dato.img="./assets/imgs/imgBotones/btnPuestosFijos.png";
          dato.nombre="Puestos fijos";
          
          console.log("btn_fijos activado! ");

        } else if (dato.fkidtiporecaudo == 2) {
          dato.img="./assets/imgs/imgBotones/btnPesaje.png";
          dato.nombre="Pesaje";
          
          console.log("btn_eventuales activado! ");

        } else if (dato.fkidtiporecaudo == 3) {
          dato.img="./assets/imgs/imgBotones/btnPuestosEventuales.png";
          dato.nombre="Puestos eventuales";
          
          console.log("btn_eventuales activado! ");

        } else if (dato.fkidtiporecaudo == 4) {
          dato.img="./assets/imgs/imgBotones/btnParqueaderos.png";
          dato.nombre="Parqueaderos";
          
          console.log("btn_parqueadero activado! ");

        } else if (dato.fkidtiporecaudo == 5) {
          
          // dato.img="./assets/imgs/imgBotones/btnPesaje.png";

          // dato.nombre="Animales";
          // this.singleton.btn_animal = true;
          // console.log("btn_animal activado! ");

        } else if (dato.fkidtiporecaudo == 6) {
          dato.img="./assets/imgs/imgBotones/btnIngresoVehiculos.png";

          dato.nombre="Vehículos";
          
          console.log("btn_vehiculos activado! ");
        }
      })
      this.singleton.menuRecaudo=opciones;
    })
  }




  /**
   * Navega a la pagina HomePage
   */
  goToHome() {
    this.navCtrl.setRoot(HomePage);
  }



  goToConfiguracion() {
    this.navCtrl.push(ConfiguracionesPage);
  }

  goToMenu() {
    this.mensajeError = '';
    if (this.sector) {
      this.singleton.sector = this.sector;
      console.log("sector seleccionado: ", this.sector["nombresector"]);
      this.navCtrl.push(MenuPrincipalPage);
    }
    else {
      this.mensajeError = "Debe seleccionar un sector. Si la plaza no tiene sectores por favor comuníquese con el administrador.";
    }

    this.seleccionarRecaudos();


  }




}