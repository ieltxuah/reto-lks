/**
 * Interfaz que representa un chat.
 * @interface Chats
 * @property {string} usuario - Nombre del usuario que participa en el chat.
 * @property {string} titulo - Título del chat.
 * @property {Mensajes[]} mensajes - Lista de mensajes en el chat.
 */
export interface Chats {
    usuario: string;
    titulo: string;
    mensajes: Mensajes[];
}

/**
 * Interfaz que representa un mensaje en el sistema del chatbot.
 * @interface Mensajes
 * @property {string} texto - El contenido del mensaje.
 * @property {'usuario' | 'bot'} tipo - Indica el tipo de remitente del mensaje.
 * Puede ser 'usuario' para mensajes enviados por el usuario o 'bot' para mensajes recibidos por la API.
 */
export interface Mensajes {
    texto: string;
    tipo: 'usuario' | 'bot'
}
