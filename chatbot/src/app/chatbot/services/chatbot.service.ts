import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private http = inject(HttpClient);

  /**
   * Envía una pregunta al chatbot.
   * @param parameter - La pregunta que se enviará al chatbot.
   * @returns Observable - Un observable que representa la respuesta del servidor.
   */
  enviarPregunta(parameter: string) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'accept': '*/*'
    });

    const requestBody: ChatRequest = {
      question: parameter
    };

    return this.http.post(environment.chatbotURL, requestBody, { headers });
    // Pruebas sin conexión
    // return this.http.get(environment.chatbotURL);
  }
}

/**
 * Interfaz para representar una solicitud de chat.
 * @interface ChatRequest
 * @property {string} question - El contenido de la pregunta por el usuario
 */
interface ChatRequest {
  question: string;
}