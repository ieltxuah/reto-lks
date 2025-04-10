import { Component, effect, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import Keycloak from 'keycloak-js';
import { KEYCLOAK_EVENT_SIGNAL, KeycloakEventType, ReadyArgs, typeEventArgs } from 'keycloak-angular';
import type { Chats, Mensajes } from '../../interfaces/mensaje.interface';
import { ChatbotService } from '../../services/chatbot.service';
import { MysqlService } from '../../services/mysql.service';
import { CurrentChatComponent } from '../current-chat/current-chat.component';
import { DashboardComponent } from "../dashboard/dashboard.component";

@Component({
  selector: 'chat-question-bar',
  imports: [CurrentChatComponent, DashboardComponent],
  templateUrl: './question-bar.component.html',
})
export class QuestionBarComponent {
  // Referencia al campo de entrada de texto del mensaje
  @ViewChild('txtchat') txtChat!: ElementRef;
  // Inyección del servicio del chatbot con la API
  chatbot = inject(ChatbotService);
  // Inyección del servicio para manejar la base de datos
  mysql = inject(MysqlService);
  // Señal que almacena la cadena de mensajes del chat
  chainChat = signal<Mensajes[]>([]);
  // Señal para indicar si se está cargando
  isLoading = signal<boolean>(false);
  // Señal que almacena el historial de chats
  chat = signal<Chats[]>([]);

  // Obtiene el parámetro 'query' de la ruta activa
  query = toSignal(
    inject(ActivatedRoute).params.pipe(map(params => params['query']))
  );

  // Estado de autenticación del usuario
  authenticated = false;
  // Estado de Keycloak
  keycloakStatus: string | undefined;
  // Inyección del servicio Keycloak
  private readonly keycloak = inject(Keycloak);
  // Inyección de la señal de eventos de Keycloak
  private readonly keycloakSignal = inject(KEYCLOAK_EVENT_SIGNAL);
  // Variable en la que almacenara el usuario logeado
  user: string = '';

  constructor() {
    // Recupera el historial de chats del almacenamiento local
    const stored = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    // Si se recupera un array, lo establece en la señal de chats
    if (Array.isArray(stored) && stored.length > 0) {
      this.chat.set(stored);
    } else {
      // Si no hay historial, lo obtiene de la base de datos
      this.mysql.obtenerMensajes().subscribe(
        (data) => {
          // Agrupa mensajes por título
          this.chat.set(this.groupByTitle(data));
          // Guarda en localStorage
          localStorage.setItem('chatHistory', JSON.stringify(this.groupByTitle(data)));
        },
        (error) => {
          console.error('Error al obtener el historial de la base de datos: ', error);
        }
      );
    }

    // Efecto para manejar eventos de Keycloak
    effect(() => {
      // Obtiene el evento de Keycloak
      const keycloakEvent = this.keycloakSignal();

      // Actualiza el estado de Keycloak
      this.keycloakStatus = keycloakEvent.type;

      // Verifica si Keycloak está listo y actualiza el estado de autenticación
      if (keycloakEvent.type === KeycloakEventType.Ready) {
        this.authenticated = typeEventArgs<ReadyArgs>(keycloakEvent.args);

        this.keycloak.loadUserProfile().then(profile => {
          this.user = profile.username || 'Usuario Desconocido';
        })

        // Si no está autenticado, borra el historial del localStorage
        if (!this.authenticated) {
          localStorage.removeItem('chatHistory');
          this.chat.set([]); // Limpia el historial de chats
          return; // Salir del constructor si no está autenticado
        }
      }

      // Maneja el evento de cierre de sesión
      if (keycloakEvent.type === KeycloakEventType.AuthLogout) {
        this.authenticated = false; // Actualiza el estado de autenticación
        localStorage.removeItem('chatHistory'); // Borra el historial al cerrar sesión
        this.chat.set([]); // Limpia el historial de chats
      }
    });
  }

  // Método para iniciar sesión
  login() {
    this.keycloak.login(); // Llama al método de inicio de sesión de Keycloak
  }

  // Método para cerrar sesión
  logout() {
    this.keycloak.logout(); // Llama al método de cierre de sesión de Keycloak
  }

  // Método privado que agrupa los datos de chats por título
  private groupByTitle(data: any[]): Chats[] {
    // Objeto para almacenar los chats agrupados por título
    const grouped: { [title: string]: Chats } = {};

    // Obtiene nombre de usuario que se ha logeado
    this.keycloak.loadUserProfile().then(profile => {
      this.user = profile.username || 'Usuario Desconocido';
    })

    // Iterar sobre cada elemento del array de datos
    data.forEach(item => {
      // Desestructuración para obtener el título, contenido y tipo del chat
      const { user, title, content, type } = item;

      // Filtrar solo los mensajes del usuario que ha iniciado sesión
      if (user === this.user) {
        // Si el título no existe en el objeto agrupado, inicializa un nuevo objeto Chats
        if (!grouped[title]) {
          grouped[title] = { usuario: this.user, titulo: title, mensajes: [] };
        }

        // Agrega el mensaje al array de mensajes correspondiente
        grouped[title].mensajes.push({ texto: content, tipo: type });
      }
    });

    // Devuelve un array de Chats a partir del objeto agrupado
    return Object.values(grouped);
  }

  /**
   * Envía un mensaje al chatbot y actualiza la cadena de chat.
   * @param mensaje - El mensaje que se enviará a la API.
   */
  enviarMensaje(mensaje: string) {
    // Evita enviar una petición si ya se está cargando
    if (this.isLoading()) return;

    // Verifica que el mensaje no esté vacío
    if (mensaje.trim() != '') {
      // Activa la señal de carga
      this.isLoading.set(true);
      // Limpia el campo de entrada
      this.txtChat.nativeElement.value = '';

      // Agrega el mensaje del usuario a la cadena de chat
      this.chainChat.update(info => [
        ...info,
        { texto: mensaje, tipo: 'usuario' } // Agrega el mensaje del usuario
      ])
      // Guarda el mensaje en el historial
      this.guardarChat(mensaje, 'usuario');

      // Envía el mensaje al chatbot y maneja la respuesta
      this.chatbot.enviarPregunta(mensaje).subscribe({
        next: (resp) => {
          // Convierte la respuesta a JSON y la parsea
          const jsonString = JSON.stringify(resp);
          const jsonArray = JSON.parse(jsonString);

          // Agrega la respuesta del bot a la cadena de chat
          this.chainChat.update(info => [
            ...info,
            { texto: jsonArray.answare, tipo: 'bot' } // Agrega la respuesta de la API
          ])

          // Guarda la respuesta en el historial
          this.guardarChat(jsonArray.answare, 'bot');
          // Desactiva la señal de carga
          this.isLoading.set(false);
        }, error: (err) => {
          // Manejo de errores: agrega un mensaje de error a la cadena de chat
          this.chainChat.update(info => [
            ...info,
            { texto: 'Error', tipo: 'bot' } // Mensaje de error
          ])

          // Guarda la respuesta en el historial
          this.guardarChat('Error', 'bot');
          // Desactiva la señal de carga
          this.isLoading.set(false);
        }
      });
    }
  }

  /**
   * Guarda el chat en el historial.
   * @param contenido - Contenido del mensaje.
   * @param tipoUser - Tipo de usuario ('usuario' o 'bot').
   */
  guardarChat(contenido: string, tipoUser: 'usuario' | 'bot') {
    this.chat.update(data => {
      // Obtiene el título del chat
      const nuevoTitulo = this.query() ? this.query() : null;
      // Busca el índice del chat
      const index = data.findIndex(item => item.titulo === nuevoTitulo);

      // Si el chat ya existe, agrega el nuevo mensaje
      if (index !== -1) {
        data[index].mensajes.push({ texto: contenido, tipo: tipoUser });
      } else {
        // Si no existe, crea un nuevo chat
        data.push({
          usuario: this.user,
          titulo: nuevoTitulo,
          mensajes: [{ texto: contenido, tipo: tipoUser }]
        });
      }

      // Devuelve el nuevo estado del historial
      return data;
    })

    // Si hay un título de chat definido, guarda en localStorage y en la base de datos
    if (this.query() !== undefined) {
      localStorage.setItem('chatHistory', JSON.stringify(this.chat()));
      this.mysql.guardarMensaje(this.user, this.query(), contenido, tipoUser).subscribe();
    }
  }
}
