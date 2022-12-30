import {Client, GatewayIntentBits, REST, Routes} from "discord.js"
import {WebSocket, WebSocketServer} from "ws"
import { config } from "dotenv"
import axios from "axios";

const botToken = ""
const channelID = ""

let ws = new WebSocketServer({port: 6969});
ws.on("connection", (socket) => {
    socket.on("message", (data) => {
        console.log(data.toString());
        client.channels.fetch("844682984506654774").then((channel) => {
            // @ts-ignore
            channel.send(data.toString());
        })
    })
});


// Discord bot initialization
const client = new Client({intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]})

// Discord bot events
client.on("ready", () => {
    console.log("Bot is ready!")
})

client.on("interactionCreate", async (interaction) => {
    // @ts-ignore
    if(!interaction.isCommand()) return;
    if(interaction.commandName === "status") {
            await interaction.reply((await axios.get("http://localhost:6960/", {
                method: "GET",
                data: "playercount"
            })).status == 200 ? "Server is online!" : "Server is offline!");
    }
    if(interaction.commandName === "playercount") {
        let playercount = "error";
            // make axios request to get playercount
            let res = await axios.get("http://localhost:6960/", {
                method: "GET",
                data: "playercount"
            })
            if(res.status == 200) {
                playercount = res.data;
            }
            await interaction.reply(playercount.toString());
    }
    if(interaction.commandName === "playerlist") {
        let playerlist = "error";
            // make axios request to get playercount
            let res = await axios.get("http://localhost:6960/", {
                method: "GET",
                data: "playerlist"
            }) 
            if(res.status == 200) {
                playerlist = res.data;
            }
            if(playerlist == ""){
                await interaction.reply("No players online!");
            } else {
            await interaction.reply(playerlist.toString());
            }
    }
    console.log(interaction)
    if(interaction.commandName === "execute") {
        if(interaction.user.id == "252588139401576448" || interaction.user.id == "333617780207124480"){
            let res = await axios.get("http://localhost:6960/", {
                method: "GET",
                data: `execute ${interaction.options.get("command")!.value}`
            })
            await interaction.reply(res.data);
        }
        await interaction.reply("test");
    }
})

client.on("messageCreate", async (message) => {
    if(message.author.bot) return;
    if(message.channel.id == channelID){
        axios.get("http://localhost:6960/", {
            method: "GET",
            data: `message <${message.author.username}> ${message.content}`
        }).catch((err) => {
            console.log(err);
        })
    }
})


// Discord bot login
client.login(botToken)

// Discord bot slash commands
const commands = [
    {
      name: 'status',
      description: 'Get the status of the server',
    },
    {
        name: "playercount",
        description: "Get the player count of the server"
    },
    {
        name: "playerlist",
        description: "Get the players of the server"
    },
    {
        name: "execute",
        description: "Execute a command on the server",
        options: [
            {
            name: "command",
            description: "The command to execute",
            type: 3,
            required: true
            }
        ]
    }
  ];
  //@ts-ignore
  console.log(process.env.BOT_TOKEN)
  //@ts-ignore
  const rest = new REST({ version: '10' }).setToken(botToken);
  
  (async () => {
    try {
      console.log('Started refreshing application (/) commands.');
  
      await rest.put(Routes.applicationCommands("847552036852989993"), { body: commands });
  
      console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
      console.error(error);
    }
  })();
  axios.get("http://localhost:6960/", {
        method: "GET",
        data: "wsconnect"
  }).catch((err) => {
        console.log(err);
  })