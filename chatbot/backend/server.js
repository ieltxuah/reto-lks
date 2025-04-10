const express = require('express'); // Importa el módulo express para crear el servidor
const mysql = require('mysql2'); // Importa el módulo mysql2 para conectarse a la base de datos
const cors = require('cors'); // Importa cors para permitir solicitudes de diferentes orígenes (no se está utilizando actualmente)

// Crea la aplicación Express
const app = express();
// Define el puerto del servidor
const port = 3301;

// Habilita CORS (no se está utilizando actualmente)
app.use(cors());
// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());

// Configuración de la conexión a la base de datos MySQL
const db = mysql.createConnection({
    host: 'localhost', // Host de la base de datos
    user: 'chatbot', // Usuario de la base de datos
    password: 'chatbot', // Contraseña de la base de datos
    database: 'chatbot' // Nombre de la base de datos
});

// Conexión a la base de datos
db.connect(err => {
    if (err) {
        console.error('Error al conectar a la base de datos MySQL:', err.message);
        return; // Salimos de la función si hay un error
    }
    console.log('Conectado a la base de datos MySQL'); // Mensaje de éxito en la conexión
});

// Rutas para manejar los mensajes
// Ruta para insertar un nuevo mensaje
app.post('/messages', (req, res) => {
    // Desestructura los campos del cuerpo de la solicitud
    const { user, title, content, type } = req.body;

    // Verifica que todos los campos requeridos estén presentes
    if (user && title && content && type) {
        db.query('INSERT INTO messages (user, title, content, type) VALUES (?, ?, ?, ?)', [user, title, content, type],
            (err, result) => {
                if (err) {
                    console.error(err); // Imprime el error en la consola
                    return res.status(500).send({ error: 'Error al insertar el mensaje' }); // Responde con un error 500
                }
                // Responde con un mensaje de éxito
                res.status(200).send({ message: 'Insert recibido' })
            });
    } else {
        // Responde con un error 400 si faltan campos
        res.status(400).send({ error: 'Faltan campos requeridos' });
    }
});

// Ruta para obtener todos los mensajes
app.get('/messages', (req, res) => {
    db.query('SELECT * FROM messages', (err, results) => {
        if (err) {
            console.error(err); // Imprime el error en la consola
            return res.status(500).send({ error: 'Error al obtener mensajes' }) // Responde con un error 500
        };
        // Responde con un mensaje de éxito
        res.status(200).send(results);
    });
});

// Ruta para eliminar un mensaje específico por título
app.delete('/messages/:user/:title', (req, res) => {
    // Obtiene el título del mensaje a eliminar de los parámetros de la ruta
    const { user, title } = req.params;

    // Verifica que el título esté presente
    if (user && title) {
        db.query('DELETE FROM messages WHERE user = ? and title = ?', [user, title], (err, result) => {
            if (err) {
                console.error(err); // Imprime el error en la consola
                return res.status(500).send({ error: 'Error al borrar mensajes' }) // Responde con un error 500
            };
            // Responde con un mensaje de éxito
            res.status(200).send({ message: 'Mensaje eliminado' });
        });
    } else {
        // Responde con un error 400 si faltan campos
        res.status(400).send({ error: 'Faltan campos requeridos' });
    }
});

// Ruta para eliminar todos los mensajes
app.delete('/messages/:user', (req, res) => {
    const { user } = req.params;
    if (user) {
        db.query('DELETE FROM messages WHERE user = ?', [user], (err, result) => {
            if (err) {
                console.error(err); // Imprime el error en la consola
                return res.status(500).send({ error: 'Error al borrar mensajes' }); // Responde con un error 500
            }
            // Responde con un mensaje de éxito
            res.status(200).send({ message: 'Todos los mensajes eliminados' });
        });
    } else {
        // Responde con un error 400 si faltan campos
        res.status(400).send({ error: 'Faltan campos requeridos' });
    }
});

// Iniciar el servidor
app.listen(port, () => {
    // Mensaje de inicio del servidor
    console.log(`Servidor escuchando en http://localhost:${port}`);
});