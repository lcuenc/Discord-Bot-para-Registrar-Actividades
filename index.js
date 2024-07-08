const { Client, GatewayIntentBits, Partials, ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, EmbedBuilder } = require('discord.js');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const { SlashCommandBuilder } = require('@discordjs/builders');
const moment = require('moment');

// Valores de configuración directamente en el código (reemplazar con valores reales)
const token = "YOUR_DISCORD_TOKEN";
const clientId = "YOUR_CLIENT_ID";
const guildId = "YOUR_GUILD_ID";

// Mapeo de canales y roles de administración
const adminChannels = {
    'CHANNEL_ID_1': 'ADMIN_CHANNEL_ID_1', // Canal de camioneros -> Admin Channel 1
    'CHANNEL_ID_2': 'ADMIN_CHANNEL_ID_2'  // Canal de pilotos -> Admin Channel 2
};

// Roles de los canales
const roles = {
    'CHANNEL_ID_1': 'camioneros',
    'CHANNEL_ID_2': 'pilotos'
};

// Almacén de registros de actividades
const registros = {
    camioneros: {},
    pilotos: {}
};

// Configurar el cliente de Discord
const client = new Client({ 
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
    partials: [Partials.Channel]
});

// Evento que se ejecuta cuando el bot está listo
client.once('ready', () => {
    console.log('Bot is online!');
    client.user.setActivity('/registrar para informar de tu actividad. Powered By HarSz');

    // Registrar los comandos de barra
    const commands = [
        new SlashCommandBuilder()
            .setName('registrar')
            .setDescription('Registrar una actividad'),
        new SlashCommandBuilder()
            .setName('top')
            .setDescription('Mostrar el top de actividad de camioneros y pilotos')
    ].map(command => command.toJSON());

    const rest = new REST({ version: '9' }).setToken(token);

    (async () => {
        try {
            console.log('Started refreshing application (/) commands.');

            await rest.put(
                Routes.applicationGuildCommands(clientId, guildId),
                { body: commands }
            );

            console.log('Successfully reloaded application (/) commands.');
        } catch (error) {
            console.error(error);
        }
    })();
});

// Evento que se ejecuta cuando se crea una interacción
client.on('interactionCreate', async interaction => {
    if (interaction.isCommand()) {
        // Comando para registrar una actividad
        if (interaction.commandName === 'registrar') {
            const modal = new ModalBuilder()
                .setCustomId('registerActivity')
                .setTitle('Registrar Actividad')
                .addComponents(
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('vehicle')
                            .setLabel('Vehículo utilizado')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Ej. Maverick')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('startTime')
                            .setLabel('Fecha y hora de inicio')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Ej. 2024-06-30 14:00')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('endTime')
                            .setLabel('Fecha y hora de finalización')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Ej. 2024-06-30 16:00')
                            .setRequired(true)
                    ),
                    new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('vehicleStatus')
                            .setLabel('Estado del vehículo')
                            .setStyle(TextInputStyle.Short)
                            .setPlaceholder('Ej. Buen estado')
                            .setRequired(true)
                    )
                );

            await interaction.showModal(modal);
        } else if (interaction.commandName === 'top') {
            // Comando para mostrar el top de actividades
            const now = moment();
            const thirtyDaysAgo = moment().subtract(30, 'days');

            // Filtrar y contar los registros de los últimos 30 días para camioneros
            const topCamioneros = Object.entries(registros.camioneros)
                .map(([usuario, registros]) => ({
                    usuario,
                    cantidad: registros.filter(registro => moment(registro).isBetween(thirtyDaysAgo, now)).length
                }))
                .filter(entry => entry.cantidad > 0)
                .sort((a, b) => b.cantidad - a.cantidad);

            // Filtrar y contar los registros de los últimos 30 días para pilotos
            const topPilotos = Object.entries(registros.pilotos)
                .map(([usuario, registros]) => ({
                    usuario,
                    cantidad: registros.filter(registro => moment(registro).isBetween(thirtyDaysAgo, now)).length
                }))
                .filter(entry => entry.cantidad > 0)
                .sort((a, b) => b.cantidad - a.cantidad);

            const topCamionerosEmbed = new EmbedBuilder()
                .setTitle('Top Camioneros')
                .setDescription(
                    topCamioneros.length > 0 ?
                        topCamioneros.map((entry, index) => `${index + 1}. ${entry.usuario} - ${entry.cantidad} registros`).join('\n') :
                        'No hay registros de camioneros en los últimos 30 días.'
                )
                .setColor('#FFA500');

            const topPilotosEmbed = new EmbedBuilder()
                .setTitle('Top Pilotos')
                .setDescription(
                    topPilotos.length > 0 ?
                        topPilotos.map((entry, index) => `${index + 1}. ${entry.usuario} - ${entry.cantidad} registros`).join('\n') :
                        'No hay registros de pilotos en los últimos 30 días.'
                )
                .setColor('#00BFFF');

            await interaction.reply({ embeds: [topCamionerosEmbed, topPilotosEmbed], ephemeral: true });
        }
    }

    if (interaction.isModalSubmit()) {
        if (interaction.customId === 'registerActivity') {
            // Obtener datos del formulario modal
            const vehicle = interaction.fields.getTextInputValue('vehicle');
            const startTime = interaction.fields.getTextInputValue('startTime');
            const endTime = interaction.fields.getTextInputValue('endTime');
            const vehicleStatus = interaction.fields.getTextInputValue('vehicleStatus');
            const userName = interaction.user.tag; // Obtener el nombre de usuario que creó la actividad
            const member = await interaction.guild.members.fetch(interaction.user.id); // Obtener el miembro del servidor
            const userNickname = member.nickname || userName; // Obtener el apodo del usuario o usar el nombre de usuario si no tiene apodo
            const adminChannelId = adminChannels[interaction.channelId]; // Obtener el ID del canal de administración correspondiente
            const role = roles[interaction.channelId]; // Obtener el rol (camionero o piloto)

            if (!adminChannelId || !role) {
                return interaction.reply({ content: 'Este canal no está configurado para registrar actividades.', ephemeral: true });
            }

            const adminChannel = client.channels.cache.get(adminChannelId);
            if (!adminChannel) {
                return interaction.reply({ content: 'No se pudo encontrar el canal de administración.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Nueva Actividad Registrada')
                .addFields(
                    { name: 'Usuario', value: userName },
                    { name: 'Apodo', value: userNickname },
                    { name: 'Vehículo utilizado', value: vehicle },
                    { name: 'Fecha y hora de inicio', value: startTime },
                    { name: 'Fecha y hora de finalización', value: endTime },
                    { name: 'Estado del vehículo', value: vehicleStatus }
                )
                .setColor('#FF0000'); // Utiliza un color hexadecimal en lugar de "RED"

            adminChannel.send({ embeds: [embed] });

            // Registrar la actividad en el almacén
            if (!registros[role][userName]) {
                registros[role][userName] = [];
            }
            registros[role][userName].push(new Date());

            await interaction.reply({ content: 'Tu actividad ha sido registrada con éxito.', ephemeral: true });
        }
    }
});

// Iniciar sesión en el bot de Discord
client.login(token);
