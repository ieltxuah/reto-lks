# Proyecto Practicas de CF Somorrostro - LKS

Este es un proyecto de Angular que utiliza Docker, MySQL como base de datos y Keycloak para la gestión de autenticación y autorización. Este README proporciona información sobre cómo configurar y ejecutar el proyecto de practicas.

## Requisitos Previos

Antes de comenzar, asegúrate de tener instalados los siguientes programas en tu máquina:

- [Node.js](https://nodejs.org/) (versión 22 o superior)
- [Docker](https://www.docker.com/get-started)

## Configuración del Proyecto

1. **Clona el repositorio:**

```bash
git clone https://github.com/ieltxuah/reto-lks.git
cd reto-lks/chatbot
```

2. **Instala las dependencias:**

```bash
npm install
```

3. **Instala las dependencias del backend:**

```bash
cd backend
npm install
```

4. **Instala la base de datos MySQL:**

Puedes crear un contenedor de MySQL utilizando el siguiente comando:

```bash
docker run --name mysql-server -e MYSQL_ROOT_PASSWORD=tu_contraseña -d -p 3306:3306 mysql:latest
```

5. **Configura la base de datos MySQL:**

Puedes instalar una herramienta como MySQL Workbench para acceder a la base de datos con las credenciales `root/root` y realizar la configuración de MySQL.

```sql
use chatbot;
CREATE TABLE messages (
  user varchar(50),
  title VARCHAR(30),
  content TEXT,
  type ENUM('usuario', 'bot')
);
CREATE USER 'chatbot'@'%' IDENTIFIED BY 'chatbot';
GRANT ALL PRIVILEGES ON chatbot.* TO 'chatbot'@'%';
INSERT INTO messages (title, content, type) VALUES ('Prueba', 'Este es un mensaje de prueba', 'usuario');
CREATE DATABASE keycloak;
CREATE USER 'keycloak'@'%' IDENTIFIED BY 'keycloak';
GRANT ALL PRIVILEGES ON keycloak.* TO 'keycloak'@'%';
```

6. **Configura Keycloak:**

	1. **Instalar Keycloak**
Para ejecutar Keycloak, utiliza el siguiente comando:

```bash
docker run -d --name keycloak -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin -e DB_VENDOR=mysql -e DB_ADDR=127.0.0.1:3306 -e DB_DATABASE=keycloak -e DB_USER=keycloak -e DB_PASSWORD=keycloak --link mysql-server:mysql keycloak/keycloak:latest start-dev
```

Esto levantará un contenedor de Keycloak accesible en `http://localhost:8080`. Puedes acceder a la consola de administración con las credenciales:

- Usuario: `admin`
- Contraseña: `admin`

	2. **Crear un nuevo Realm**:
	   - Accede a la consola de administración de Keycloak (normalmente en `http://localhost:8080/`).
	   - Inicia sesión con las credenciales de administrador.
	   - Crea un nuevo Realm haciendo clic en "Add Realm", le pones LKS como "Realm name".

	3. **Crear un cliente**:
	   - Dentro del nuevo Realm, ve a la sección "Clients".
	   - Haz clic en "Create" y le pones como "Client ID" el nombre de `chatlks-angular-app`.
	   - Configura el `Root URL` y `Web origins` con la URL de tu aplicación Angular que será `http://localhost:4200`. También se configurara `Valid redirect URIs` para que sea `http://localhost:4200/*`.

	4. **Crear un usuario**:
	   - Ve a la sección "Users" y crea un nuevo usuario para probar la autenticación.

	5. (Opcional) **Configurar tema personalizado**:
Para configurar el tema personalizado en Keycloak, hay que hacer lo siguiente en la consola:

```bash
cd ../..
docker cp lks-login keycloak:/opt/keycloak/themes/lks-login
```

Esto habría subido el tema personalizado al Keycloak; para usarlo, primero hay que reiniciar el docker de Keycloak. A continuación, se realizan los siguientes pasos:

- Dentro del realm LKS, ve a la sección "Realm settings".
- Haz clic en "Themes" y le pones como "Login theme" la opción `lks-login`.

## Construcción y Ejecución de la Aplicación Angular

Para construir la imagen de la aplicación Angular, navega al directorio de chatbot y ejecuta:

```bash
docker build -t chatbot .
```

Luego, ejecuta el contenedor de la aplicación:

```bash
docker run --name chatbot -p 4201:4200 chatbot
```

## Ejecución del Backend de la Aplicación Angular

Lo último que falta por ejecutar es el backend, que hace que funcionen todas las funcionalidades de la base de datos en Angular. Navega hasta el directorio backend dentro de chatbot y ejecuta:

```bash
node server.js
```

## Acceso a la Aplicación

Una vez que los contenedores estén en funcionamiento, podrás acceder a la aplicación Angular en tu navegador en la siguiente dirección:

```code
http://localhost:4200
```

## Detener la Aplicación

Para detener los contenedores, puedes usar los siguientes comandos:

```bash
docker stop chatbot
docker stop keycloak
docker stop mysql-server
```

Y para eliminar los contenedores:

```bash
docker rm chatbot
docker rm keycloak
docker rm mysql-server
```
