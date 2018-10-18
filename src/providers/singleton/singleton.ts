import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

/*
  Generated class for the SingletonProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class SingletonProvider {

  public usuario = {};
  public plaza = {};
  public sector = {};
  public tipovehiculos = [];
  public plazas = []; 
  public puerta = {}; 
  public sectoresPlaza = [];
  public categoriaAnimal = {};
  public tipoAnimal = {};
  public especieAnimal = {};
  public parqueadero = {};
  public parqueaderos = [];
  public menuRecaudo=[];
  public TOKEN = '';
  public tarifapuestoeventual = [];
  public tarifapesaje = [];

  public IMEI = '';


  /*****************************************************************************************************/
  /***************************************** AUXILIARES ************************************************/
  /*****************************************************************************************************/

  public primeraVez: boolean = false;

  constructor(public http: HttpClient) {
    console.log('Hello SingletonProvider Provider');
    
  }

}
