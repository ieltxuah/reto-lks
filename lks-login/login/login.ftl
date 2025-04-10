<#assign title = "Iniciar Sesión" />

<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} LKS</title>
    <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
    <link rel="icon" type="image/x-icon" href="${url.resourcesPath}/lks-logo.png">
</head>
<body>
    <div class="flex justify-center items-center min-h-screen bg-gray-100">
        <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-sm relative">
            <a href="javascript:history.back()" class="absolute top-4 left-4 bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5 20v-9.15L2.2 13L1 11.4L12 3l4 3.05V4h3v4.35l4 3.05l-1.2 1.6l-2.8-2.15V20h-5v-6h-4v6zm5-9.975h4q0-.8-.6-1.313T12 8.2t-1.4.513t-.6 1.312"/>
                </svg>
            </a>

            <h2 class="text-2xl font-semibold text-center mb-6">${title}</h2>

            <form action="${url.loginAction}" method="POST">
                <!-- Campo de usuario -->
                <div class="mb-4">
                    <label for="username" class="block text-sm font-medium text-gray-700">Usuario</label>
                    <input type="text" id="username" name="username" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Usuario" required />
                </div>

                <!-- Campo de contraseña -->
                <div class="mb-6">
                    <label for="password" class="block text-sm font-medium text-gray-700">Contraseña</label>
                    <input type="password" id="password" name="password" class="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contraseña" required />
                </div>

                <!-- Botón de iniciar sesión -->
                <button type="submit" class="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                    Iniciar Sesión
                </button>
            </form>
        </div>
    </div>
</body>
</html>