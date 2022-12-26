import {Client, GatewayIntentBits} from "discord.js"
import {WebSocket, WebSocketServer} from "ws"

//Websocket stuff
const wsServer = new WebSocketServer({path: "ws://50.116.39.151:3000"}); 

const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

client.on("ready", () => {
    console.log("Bot is ready!")
})

client.on("interactionCreate", async (interaction) => {
    console.log("fuck")
})