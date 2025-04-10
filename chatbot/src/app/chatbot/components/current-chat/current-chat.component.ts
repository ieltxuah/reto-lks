import { AfterViewChecked, Component, ElementRef, inject, input, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';
import type { Chats } from '../../interfaces/mensaje.interface';

@Component({
  selector: 'chat-current',
  imports: [],
  templateUrl: './current-chat.component.html',
})
export class CurrentChatComponent implements AfterViewChecked {
  // Referencia al contenedor del chat
  @ViewChild('scrollContainer') scrollContainer!: ElementRef;
  // Lista de chats con su contenido que se mostrarán en el chat seleccionado
  chats = input<Chats[]>();

  // Obtiene el parámetro 'query' de la ruta activa
  query = toSignal(
    inject(ActivatedRoute).params.pipe(map(params => params['query']))
  );

  /**
   * Se ejecuta después de que la vista ha sido inicializada.
   * Desplaza el contenedor del chat hacia abajo.
   */
  ngAfterViewInit(): void {
    this.scrollToBottom();
  }

  /**
   * Se ejecuta después de cada verificación de la vista.
   * Desplaza el contenedor del chat hacia abajo si hay nuevos mensajes.
   */
  ngAfterViewChecked() {
    this.scrollToBottom();
  }

  /**
   * Desplaza el contenedor del chat hacia la parte inferior.
   */
  scrollToBottom(): void {
    const chat = this.scrollContainer.nativeElement;
    // Ajusta el desplazamiento al final del contenedor
    chat.scrollTop = chat.scrollHeight;
  }
}
