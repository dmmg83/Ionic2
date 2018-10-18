import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NumbersToLettersProvider } from '../numbers-to-letters/numbers-to-letters';

/*
  Generated class for the PrepararReciboProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class PrepararReciboProvider {

  ESPACIO_BLANCO={ "E": "", "V": ""};

  //Separador de miles
  DECIMAL_SEPARATOR = ",";
  GROUP_SEPARATOR = ".";
  budget = 0;

  constructor(public http: HttpClient,     private conversion: NumbersToLettersProvider,
    ) {
    console.log('Hello PrepararReciboProvider Provider');
  }

  armarReciboEventual(recibo)
  {
    let objetoCompleto={};
    objetoCompleto["norecibo"]=recibo["numerorecibopuestoeventual"];
    objetoCompleto["nopuesto"]='';//sólo aplica en caso de factura
    
    objetoCompleto["estado"]=recibo["recibopuestoeventualactivo"] == 1? '':'ANULADO';
    objetoCompleto["fecha"]=recibo["creacionrecibopuestoeventual"];
    let datos = [];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(""+recibo["valorecibopuestoeventual"]), 0);
    
    datos.push({ "E": "Tarifa:", "V": this.format(""+recibo["valortarifa"]) });
    datos.push({ "E": "Valor pagado:", "V": this.format(""+recibo["valorecibopuestoeventual"]) });
    datos.push({ "E": "En letras:", "V": numeroEnLetras });
    datos.push({ "E": "Usuario:", "V": recibo['nombreterceropuestoeventual'] });
    datos.push({ "E": "Recaudador:", "V": recibo["nombrerecaudador"] });
    objetoCompleto["datosRecibo"]=datos;
    return objetoCompleto;
  }

  armarReciboPuestoFijo(recibo)
  {
    let objetoCompleto={};
    objetoCompleto["norecibo"]=recibo["numerorecibo"];
    objetoCompleto["nopuesto"]='';//sólo aplica en caso de factura
    
    objetoCompleto["estado"]=recibo["recibopuestoactivo"] == 1? '':'ANULADO';
    objetoCompleto["fecha"]=recibo["creacionrecibo"];
    let datos = [];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(""+recibo["valorpagado"]), 0);
    
    datos.push({ "E": "Tarifa:", "V": this.format(""+recibo["valortarifa"]) });
    datos.push({ "E": "Valor pagado:", "V": this.format(""+recibo["valorpagado"]) });
    datos.push({ "E": "En letras:", "V": numeroEnLetras });
    datos.push({ "E": "Usuario:", "V": recibo['nombreterceropuesto'] });
    datos.push({ "E": "Recaudador:", "V": recibo["nombrerecaudador"] + " " + recibo["apellidorecaudador"] });
    objetoCompleto["datosRecibo"]=datos;
    return objetoCompleto;
  }

  armarReciboParqueadero(recibo)
  {
    let objetoCompleto={};
    objetoCompleto["norecibo"]=recibo["numeroreciboparqueadero"];
    objetoCompleto["nopuesto"]='';//sólo aplica en caso de factura
    
    objetoCompleto["estado"]=recibo["reciboparqueaderoactivo"] == 1? '':'ANULADO';
    objetoCompleto["fecha"]=recibo["creacionreciboparqueadero"];
    let datos = [];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(""+recibo["valoreciboparqueadero"]), 0);
    
    datos.push({ "E": "Tarifa:", "V": this.format(""+recibo["valortarifa"]) });
    datos.push({ "E": "Valor pagado:", "V": this.format(""+recibo["valoreciboparqueadero"]) });
    datos.push({ "E": "En letras:", "V": numeroEnLetras });
    datos.push({ "E": "Usuario:", "V": recibo['nombreterceroparqueadero'] });
    datos.push({ "E": "Tipo Parqueadero:", "V": recibo['nombretipoparqueadero'] });
    datos.push({ "E": "Núm. Parqueadero:", "V": recibo['numeroparqueadero'] });
    datos.push({ "E": "Recaudador:", "V": recibo["nombrerecaudador"] + " " + recibo["apellidorecaudador"] });
    objetoCompleto["datosRecibo"]=datos;
    return objetoCompleto;
  }

  armarReciboPesaje(recibo)
  {
    let objetoCompleto={};
    objetoCompleto["norecibo"]=recibo["numerorecibopesaje"];
    objetoCompleto["nopuesto"]='';//sólo aplica en caso de factura
    
    objetoCompleto["estado"]=recibo["recibopesajeactivo"] == 1? '':'ANULADO';
    objetoCompleto["fecha"]=recibo["creacionrecibopesaje"];
    let datos = [];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(""+recibo["valorecibopesaje"]), 0);
    
    datos.push({ "E": "Tarifa:", "V": this.format(""+recibo["valortarifa"]) });
    datos.push({ "E": "Valor pagado:", "V": this.format(""+recibo["valorecibopesaje"]) });
    datos.push({ "E": "En letras:", "V": numeroEnLetras });
    datos.push({ "E": "Categoría Animal:", "V": recibo['nombrecategoriaanimal'] });
    datos.push({ "E": "Tipo Animal:", "V": recibo['nombretipoanimal'] });
    datos.push({ "E": "Especie Animal:", "V": recibo['nombreespecieanimal'] });
    datos.push({ "E": "Pesaje Animal:", "V": recibo['pesoExacto'] });
    datos.push({ "E": "Usuario:", "V": recibo['nombreterceropesaje'] });
    datos.push({ "E": "Recaudador:", "V": recibo["nombrerecaudador"] + " " + recibo["apellidorecaudador"] });
    objetoCompleto["datosRecibo"]=datos;
    return objetoCompleto;
  }

  armarReciboVehiculo(recibo)
  {
    let objetoCompleto={};
    objetoCompleto["norecibo"]=recibo["numerorecibovehiculo"];
    objetoCompleto["nopuesto"]='';//sólo aplica en caso de factura
    
    objetoCompleto["estado"]=recibo["recibovehiculoactivo"] == 1? '':'ANULADO';
    objetoCompleto["fecha"]=recibo["creacionrecibovehiculo"];
    let datos = [];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(""+recibo["valorecibovehiculo"]), 0);
    
    datos.push({ "E": "Tarifa:", "V": this.format(""+recibo["valortarifa"]) });
    datos.push({ "E": "Valor pagado:", "V": this.format(""+recibo["valorecibovehiculo"]) });
    datos.push({ "E": "En letras:", "V": numeroEnLetras });
    datos.push({ "E": "Placa:", "V": recibo["numeroplaca"]});
    datos.push({ "E": "Tipo Vehículo:", "V": recibo["nombretipovehiculo"]});
    datos.push({ "E": "Recaudador:", "V": recibo["nombrerecaudador"] + " " + recibo["apellidorecaudador"] });
    objetoCompleto["datosRecibo"]=datos;
    return objetoCompleto; 
  }

  armarFactura(factura)
  {
    let objetoCompleto={};
    objetoCompleto["nofactura"]='';
    objetoCompleto["nopuesto"]=factura["nombrepuesto"];//sólo aplica en caso de factura
    
    objetoCompleto["estado"]=factura["saldoasignacion"] < 0? 'DEUDA':'';
    objetoCompleto["fecha"]=factura["mesfacturaletras"];
    let datos = [];
    let numeroEnLetras = this.conversion.numeroALetras(this.unFormat(""+factura["totalapagarmes"]), 0);
    
    datos.push({ "E": "Beneficiario:", "V": factura['nombrebeneficiario'] });
    datos.push({ "E": "Identificacion:", "V": factura["identificacionbeneficiario"] });

    datos.push({ "E": "Tarifa puesto:", "V": this.format(""+factura["tarifapuesto"]) });
    if(factura["fkidacuerdo"])
    {
      datos.push({ "E": "--- ACUERDO ---", "V": ""});//Subtitulo
      datos.push({ "E": "No. acuerdo:", "V": factura["numeroacuerdo"] });
      datos.push({ "E": "Cuota acuerdo:", "V": this.format(""+factura["valorcuotaacuerdo"]) });
      datos.push({ "E": "Cuotas pagadas:", "V": factura["cuotaspagadas"] });
      datos.push({ "E": "Cuotas incumplidas:", "V": factura["cuotasincumplidas"] });
      datos.push({ "E": "Deuda acuerdo:", "V": this.format(""+factura["saldodeudaacuerdo"]) });
      datos.push({ "E": "Saldo Total acuerdo:", "V": this.format(""+factura["saldoacuerdo"]) });
    }
    if(factura["saldodeuda"]<0)
    {      
      datos.push({ "E": "--- DEUDA ---", "V": ""});//Subtitulo
      datos.push({ "E": "Debe desde:", "V": factura["debermes"]+" / "+factura["deberyear"] });
      datos.push({ "E": "Total deduda:", "V": this.format(""+factura["saldodeuda"]) });
      
    }
    datos.push({ "E": "--- PAGO TOTAL ---", "V": ""});//Subtitulo    
    datos.push({ "E": "Total a pagar:", "V": this.format(""+factura["totalapagarmes"]) });
    datos.push({ "E": "En letras:", "V": numeroEnLetras });
    
    objetoCompleto["datosRecibo"]=datos;
    return objetoCompleto;
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
    val = val.replace(/^0+/, '').replace(/\D/g, '');
    if (this.GROUP_SEPARATOR === ',') {
      return val.replace(/,/g, '');
    } else {
      return val.replace(/\./g, '');
    }
  };

}
