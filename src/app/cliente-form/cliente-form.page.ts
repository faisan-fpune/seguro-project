import { Component, OnInit } from '@angular/core';
import { Firestore, addDoc, collection, doc, getDoc, updateDoc } from '@angular/fire/firestore';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-cliente-form',
  templateUrl: './cliente-form.page.html',
  styleUrls: ['./cliente-form.page.scss'],
})
export class ClienteFormPage implements OnInit {
  id: any;
  cliente: any = {};
  isNew: boolean = true;
  avatar: string = '';
  fecha: string = '';
  constructor(
    private route: ActivatedRoute,
    private readonly firestore: Firestore,
    private router: Router
  ) {}

  // guardar Cliente

  guardarCliente = () => {
    this.route.params.subscribe((params: any) => {
      console.log('params', params);
      this.id = params.id;
      if (this.id) {
        console.log('Aqui editar en firebase');
        const document = doc(this.firestore, 'clientes_asegurados', this.id);

        console.log('Data ', this.cliente.nombre);
        updateDoc(document, {
          nombre_apellido: this.cliente.nombre_apellido,
          bien_asegurado: this.cliente.bien_asegurado,
          monto_asegurado: this.cliente.monto_asegurado,
          fecha_nacimiento: new Date(this.fecha)
        }).then((doc) => {
          console.log('Registro Editado');
          alert("Ediatdo Correctamente")
          
        }).then(() => this.router.navigate(['/cliente-list']));
      } else {
        console.log('Incluir Cliente ');
        const clienteRef = collection(this.firestore, 'clientes_asegurados');
        var cliente = this.cliente;
        cliente.fecha_nacimiento = new Date(this.fecha);
        console.log(cliente);
        addDoc(clienteRef, cliente).then((doc) => {
          console.log('cliente Creado');
          alert("Creado Correctamente");
          
        }).then(() => this.router.navigate(['/cliente-list']));
      }
    });
    
  };
  // obtener cliente
  getCliente = async (id: string) => {
    console.log(id)
    var document = doc(this.firestore, 'clientes_asegurados', id);
    const cliente = await getDoc(document);
    this.cliente = cliente.data();
    this.convertirTimestampAFecha(this.cliente.fecha_nacimiento);
    console.log("imprimir cliente")
    console.log(this.cliente);
    return cliente;
  };

  // nuevo cliente

  nuevoCliente = () => {
    this.cliente = {};
    this.router.navigate(['/cliente-form']);
  };

  // funciones para convertir fecha

  convertirTimestampAFecha(date: any) {
    // Convertir el timestamp a un objeto Date
    const fecha = new Date(
      (date.seconds + date.nanoseconds / 1000000000) * 1000
    );

    // Obtener el día, mes y año
    const dia = fecha.getDate() + 1;
    const mes = fecha.getMonth() + 1; // Los meses van de 0 a 11, por eso sumamos 1
    const anio = fecha.getFullYear();

    // Formatear la fecha como "dd/mm/yyyy"
    this.fecha = `${anio}-${this.agregarCero(mes)}-${this.agregarCero(dia)}`;
  }

  // Función para agregar un cero a los números menores a 10 (para formateo dd/mm/yyyy)
  agregarCero(numero: number): string {
    return numero < 10 ? `0${numero}` : `${numero}`;
  }

  ngOnInit() {
    this.route.params.subscribe((params: any) => {
      console.log('params', params);
      this.id = params.id;
      if (this.id) {
        this.getCliente(this.id);
        this.isNew = false;
      } else {
        this.cliente = {};
      }
    });
  }
  
}
