import {
    provideKeycloak,
    withAutoRefreshToken,
    AutoRefreshTokenService,
    UserActivityService
} from 'keycloak-angular';

/**
 * Proporciona la configuración de Keycloak para la aplicación Angular.
 * @returns {Function} Función de configuración de Keycloak.
 */
export const provideKeycloakAngular = () =>
    provideKeycloak({
        config: {
            // URL del servidor Keycloak
            url: 'http://localhost:8080',
            // Nombre del reino en Keycloak
            realm: 'LKS',
            // ID del cliente registrado en Keycloak
            clientId: 'chatlks-angular-app'
        },
        initOptions: {
            // Opción para cargar el SSO
            onLoad: 'check-sso',
            // URI para la verificación silenciosa del SSO
            silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
            // URI de redirección después de la autenticación
            redirectUri: window.location.origin + '/'
        },
        features: [
            // Configuración para el refresco automático del token
            withAutoRefreshToken({
                // Acción a realizar en caso de tiempo de inactividad
                onInactivityTimeout: 'logout',
                // Tiempo de sesión en milisegundos
                sessionTimeout: 60000
            })
        ],
        providers: [
            // Servicio para refrescar el token automáticamente
            AutoRefreshTokenService,
            // Servicio para rastrear la actividad del usuario
            UserActivityService,
        ]
    });