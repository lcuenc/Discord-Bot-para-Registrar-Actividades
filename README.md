---

# Bot de Discord para Registrar Actividades

Este es un bot de Discord desarrollado con `discord.js` que permite a los usuarios registrar sus actividades y ver el top de usuarios más activos.

## Requisitos

- Node.js v16.6.0 o superior
- npm (Node Package Manager)

## Instalación

1. Clona este repositorio:

    ```bash
    git clone https://github.com/tu-usuario/tu-repositorio.git
    cd tu-repositorio
    ```

2. Instala las dependencias necesarias:

    ```bash
    npm install
    ```

3. Crea un archivo `.env` en la raíz del proyecto y agrega tus credenciales de Discord:

    ```env
    DISCORD_TOKEN=your_discord_token
    CLIENT_ID=your_client_id
    GUILD_ID=your_guild_id
    ```

4. Configura los canales de administración y roles en el archivo `index.js`:

    ```javascript
    const adminChannels = {
        'CHANNEL_ID_1': 'ADMIN_CHANNEL_ID_1',
        'CHANNEL_ID_2': 'ADMIN_CHANNEL_ID_2'
    };

    const roles = {
        'CHANNEL_ID_1': 'camioneros',
        'CHANNEL_ID_2': 'pilotos'
    };
    ```

5. Inicia el bot:

    ```bash
    node index.js
    ```

## Uso

### Comandos

- `/registrar`: Abre un formulario modal para registrar una nueva actividad.
- `/top`: Muestra el top de usuarios más activos en los últimos 30 días.

### Registro de Actividades

1. Escribe `/registrar` en un canal habilitado.
2. Completa el formulario modal con la información requerida.
3. El bot enviará una notificación al canal de administración correspondiente y registrará la actividad.

### Ver el Top de Usuarios

1. Escribe `/top` en cualquier canal habilitado.
2. El bot mostrará un mensaje con los usuarios más activos en los últimos 30 días.

## Contribuciones

¡Las contribuciones son bienvenidas! Si tienes alguna mejora o corrección, no dudes en abrir un issue o enviar un pull request.

## Licencia

Este proyecto está bajo la licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

Asegúrate de reemplazar los valores de ejemplo con tus datos reales antes de ejecutar el bot.
