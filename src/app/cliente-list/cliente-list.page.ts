import { Component, OnInit } from '@angular/core';
import {
  Firestore,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  query,
  startAfter,
  where,
} from '@angular/fire/firestore';
import { InfiniteScrollCustomEvent } from '@ionic/angular';

@Component({
  selector: 'app-cliente-list',
  templateUrl: './cliente-list.page.html',
  styleUrls: ['./cliente-list.page.scss'],
})
export class ClienteListPage implements OnInit {
  clientes = new Array();
  maxResults = 10;
  ultimoClienteRecuperado: any = null;
  isSearch: Boolean = false;
  query = '';

  startAt = 0;

  constructor(private readonly firestore: Firestore) {}

  ngOnInit() {
    
     /*  this.clientes = new Array();
      this.ultimoClienteRecuperado= null;
      this.listarCliente(); */
    
  }

  clickSearch = () => {
    this.isSearch = true;
  };

  clearSearch = () => {
    this.isSearch = false;
    this.query = '';
    this.ultimoClienteRecuperado = null;
    this.clientes = new Array();
    this.listarClienteSinFiltro();
  };

  buscarSearch = (e: any) => {
    console.log(e);
    this.isSearch = true;
    this.query = e.target.value;

    this.clientes = new Array();
    this.listarCliente();
  };

  listarCliente = () => {
    const clienteRef = collection(this.firestore, 'clientes_asegurados');

    if ((this.query + '').length > 0) {
      let q = undefined;
      if (this.ultimoClienteRecuperado) {
        q = query(
          clienteRef,
          where('nombre_apellido', '>=', this.query.toUpperCase()),
          where('nombre_apellido', '<=', this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults),
          startAfter(this.ultimoClienteRecuperado)
        );
      } else {
        q = query(
          clienteRef,
          where('nombre_apellido', '>=', this.query.toUpperCase()),
          where('nombre_apellido', '<=', this.query.toLowerCase() + '\uf8ff'),
          limit(this.maxResults)
        );
      }
      getDocs(q).then((re) => {
        if (!re.empty) {
          this.clientes = new Array();
          this.startAt += this.maxResults;
          this.ultimoClienteRecuperado = re.docs[re.docs.length - 1];
          for (var i = 0; i < re.docs.length; i++) {
            console.log(re.docs[i].data());
            let alumno: any = re.docs[i].data();
            alumno.id = re.docs[i].id;
            if (
              alumno.nombre_apellido
                .toUpperCase()
                .startsWith(this.query.toUpperCase().charAt(0))
            ) {
              this.clientes.push(alumno);
            }
          }
        }
      });
    } else {
      this.listarClienteSinFiltro();
    }
  };

  listarClienteSinFiltro = () => {
    console.log('Lista de alumno');
    const alumnoRef = collection(this.firestore, 'clientes_asegurados');
    let q;
    if (!this.ultimoClienteRecuperado) {
      q = query(alumnoRef, limit(this.maxResults));
    } else {
      q = query(
        alumnoRef,
        limit(this.maxResults),
        startAfter(this.ultimoClienteRecuperado)
      );
    }
    getDocs(q).then((re) => {
      let total = re.docs.length;

      if (!re.empty) {
        re.forEach((doc) => {
          this.ultimoClienteRecuperado = re.docs[re.docs.length - 1];
          let alumno: any = doc.data();
          alumno.id = doc.id;

          this.clientes.push(alumno);

          let cantidadAlu = this.clientes.length;
        });
      }
    });
  };

   deleteCliente = async (idCliente: string) => {
    console.log(idCliente);

    const alumnoRef = doc(this.firestore, 'clientes_asegurados', idCliente);
    const conf = confirm('Deseas eliminar');

    if (conf) {
      await deleteDoc(alumnoRef);
      this.clearSearch();
    }
  };
  onIonInfinite(ev: any) {
    this.listarCliente();
    setTimeout(() => {
      (ev as InfiniteScrollCustomEvent).target.complete();
    }, 500);
  }

  ionViewWillEnter() {
    this.clientes = new Array();
    this.ultimoClienteRecuperado = null;
    this.listarClienteSinFiltro();
  }
}
