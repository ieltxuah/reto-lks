import { Component, ElementRef, inject, Input, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { map } from 'rxjs';
import Keycloak from 'keycloak-js';
import type { Chats } from '../../interfaces/mensaje.interface';
import { MysqlService } from '../../services/mysql.service';

@Component({
  selector: 'dashboard',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent {
  // Inyección de dependencias para el enrutador y la ruta activada
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  // Inyección del servicio para manejar la base de datos
  mysql = inject(MysqlService);

  // Importa el servicio Keycloak
  private readonly keycloak = inject(Keycloak);

  // Propiedad que indica si el usuario está autenticado
  authenticated = this.keycloak.authenticated; // Verifica el estado de autenticación
  // Variable en la que almacenara el usuario logeado
  user: string = '';

  // Referencia al campo de entrada para el nuevo chat
  @ViewChild('txtnew') txtnew!: ElementRef;
  // Se le pasa la lista de chats
  @Input() chats: Chats[] = [];
  // Señal que indica si hay un error en la entrada
  inputError = signal(false);
  // Estado de visibilidad de la barra lateral
  isSidebarHidden: boolean = false;

  constructor() {
    // Obtiene nombre de usuario que se ha logeado
    this.keycloak.loadUserProfile().then(profile => {
      this.user = profile.username || 'Usuario Desconocido';
    })
  }

  ngOnChanges() {
    // Verifica los parámetros de la consulta cada vez que cambien los chats
    this.checkRouteExist();
  }

  ngOnInit() {
    // Agrega un listener para el evento de redimensionamiento de la ventana
    window.addEventListener('resize', this.onResize.bind(this));
    // Llama a onResize para establecer el estado inicial
    this.onResize();
  }

  ngOnDestroy() {
    // Elimina el listener al destruir el componente
    window.removeEventListener('resize', this.onResize.bind(this));
  }

  /**
   * Agrega un nuevo título al historial de chats.
   * @param chatTitle - El título del nuevo chat a agregar.
   */
  nuevoChat(chatTitle: string) {
    // Verifica que el usuario esté autenticado
    if (!this.authenticated) return;

    // Verifica que el título no esté vacío
    if (chatTitle.trim() === '') return;

    // Verifica si el chat ya existe en el historial
    if (this.chats.some(chat => chat.titulo === chatTitle)) {
      this.inputError.set(true);  // Activa la animación de error
      setTimeout(() => this.inputError.set(false), 500); // Desactiva el error después de 500ms
      return;
    }

    // Crea un nuevo chat y lo agrega a la lista
    const newChat: Chats = { usuario: this.user, titulo: chatTitle, mensajes: [] };
    this.chats.push(newChat);

    // Filtra los chats para evitar títulos vacíos o nulos
    const filteredChats = this.chats.filter(chat => chat.titulo && chat.titulo.trim() !== '');
    // Guarda en localStorage
    localStorage.setItem('chatHistory', JSON.stringify(filteredChats));
    // Limpia el campo de entrada
    this.txtnew.nativeElement.value = '';
  }

  /**
   * Elimina un chat del historial por su índice.
   * @param index - El índice del chat a eliminar.
   */
  eliminarChat(index: number, title: string) {
    // Elimina el chat del array
    this.chats.splice(index, 1);
    // Actualiza localStorage
    localStorage.setItem('chatHistory', JSON.stringify(this.chats));
    // Llama al servicio para borrar el mensaje en el servidor
    this.mysql.borrarMensaje(this.user, title).subscribe();
    // Verifica que exista la ruta en el chatHistory
    this.checkRouteExist();
  }

  // Elimina todos los chats del historial
  eliminarTodosLosChats() {
    // Vacía el array de chats
    this.chats = [];
    // Elimina el historial almacenado
    localStorage.removeItem('chatHistory');
    // Llama al servicio para borrar todos los mensajes en el servidor
    this.mysql.borrarTodos(this.user).subscribe();
    // Verifica que exista la ruta en el chatHistory
    this.checkRouteExist();
  }

  hayChatsValidos(): boolean {
    // Verifica si hay chats en la lista y si al menos un chat tiene un título no nulo
    return this.chats.length > 0 && this.chats.some(chat => chat.titulo !== null);
  }

  // Verifica que exista la ruta en el chatHistory
  private checkRouteExist() {
    this.activatedRoute.params
      .pipe(map(params => params['query'])) // Mapea los parámetros de la ruta
      .subscribe(query => {
        // Redirige a raiz si el query no coincide con ningún chat
        if (query && !this.chats.some(chat => chat.titulo === query)) {
          this.router.navigate(['/']);
        }
      });
  }

  onResize() {
    // Si el ancho de la ventana es mayor o igual a 640px, muestra la barra lateral
    if (window.innerWidth >= 640) {
      this.isSidebarHidden = false;
    }
  }

  toggleSidebar() {
    // Alterna la visibilidad de la barra lateral
    this.isSidebarHidden = !this.isSidebarHidden;
  }
}
