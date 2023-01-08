import {
  ActivityType,
  Client,
  DMChannel,
  GatewayIntentBits,
  messageLink,
  PermissionsBitField,
  PresenceManager,
  REST,
  Routes,
} from "discord.js";
import { WebSocketServer } from "ws";
import * as dotenv from "dotenv";
import axios from "axios";
import emoji from "node-emoji";

dotenv.config();
let port;
if (!Number.isNaN(parseInt(process.env.PORT!))) {
  port = parseInt(process.env.PORT!);
} else {
  console.error("Invalid port in .env file");
  process.exit(1);
}

//@ts-ignore
let ws = new WebSocketServer({ port });
ws.on("connection", (socket) => {
  socket.on("message", async (data) => {
    let channel = await client.channels.fetch(process.env.CHANNEL_ID!);
    new Promise(async (resolve: any, reject: any) => {
      console.log(data.toString());
      let msg = data.toString();
      if (data.toString().includes("@")) {
        msg.split(" ").forEach(async (word) => {
          console.log(word);
          console.log(word.length);
          if (word.includes("@") && word.length > 1) {
            console.log("here");
            //@ts-ignore
            let guild = await client.guilds
              //@ts-ignore
              .fetch(process.env.GUILD_ID);
            console.log(guild.name);
            let members = await guild.members.search({
              query: word.substring(1),
            });
            members.forEach((member) => {
              console.log(member.user.username);
              msg = msg.replace(word, `<@${member.user.id}>`);
            });
          }
        });
      }
      resolve(msg);
    }).then((msg) => {
      //@ts-ignore
      channel.send(msg);
    });
  });
});

// Discord bot initialization
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// Discord bot events
client.on("ready", () => {
  console.log("Bot is ready!");
});

client.on("interactionCreate", async (interaction) => {
  // @ts-ignore
  if (!interaction.isCommand()) return;
  if (interaction.commandName === "status") {
    await interaction.reply(
      (
        await axios.get(
          `http://${process.env.SERVERHOST}:${process.env.SERVERPORT}`,
          {
            method: "GET",
            data: "playercount",
          }
        )
      ).status == 200
        ? "Server is online!"
        : "Server is offline!"
    );
  }
  if (interaction.commandName === "playercount") {
    let playercount = "error";
    // make axios request to get playercount
    let res = await axios.get(
      `http://${process.env.SERVERHOST}:${process.env.SERVERPORT}`,
      {
        method: "GET",
        data: "playercount",
      }
    );
    if (res.status == 200) {
      playercount = res.data;
    }
    await interaction.reply(playercount.toString());
  }
  if (interaction.commandName === "playerlist") {
    let playerlist = "error";
    try {
      // make axios request to get playercount
      let res = await axios.get(
        `http://${process.env.SERVERHOST}:${process.env.SERVERPORT}`,
        {
          method: "GET",
          data: "playerlist",
        }
      );
      if (res.status == 200) {
        playerlist = res.data;
      }
      if (playerlist == "") {
        await interaction.reply("No players online!");
      } else {
        await interaction.reply(playerlist.toString());
      }
    } catch (error) {
      await interaction.reply("Error getting playerlist!");
    }
  }
  console.log(interaction);
  if (interaction.commandName === "execute") {
    if (
      // @ts-ignore
      interaction.member!.permissions.has(
        PermissionsBitField.Flags.Administrator
      )
    ) {
      try {
        let res = await axios.get(
          `http://${process.env.SERVERHOST}:${process.env.SERVERPORT}`,
          {
            method: "GET",
            data: `execute ${interaction.options.get("command")!.value}`,
          }
        );
        await interaction.reply(res.data);
      } catch (error) {
        await interaction.reply("Error executing command!");
      }
    }
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.id == process.env.CHANNEL_ID!) {
    let msg = emoji.replace(
      message.content,
      (emoji: { key: any }) => `:${emoji.key}:`
    );
    console.log(msg);
    axios
      .get(`http://${process.env.SERVERHOST}:${process.env.SERVERPORT}`, {
        method: "GET",
        data: `message <${message.author.username}> ${msg}`,
      })
      .catch((err) => {
        message.reply("Error sending message to server!");
      });
  }
});

// Discord bot login
client.login(process.env.BTOKEN);
client.user?.setPresence({
  activities: [{ name: "Minecraft", type: ActivityType.Playing }],
  status: "online",
});

// Discord bot slash commands
const commands = [
  {
    name: "status",
    description: "Get the status of the server",
  },
  {
    name: "playercount",
    description: "Get the player count of the server",
  },
  {
    name: "playerlist",
    description: "Get the players of the server",
  },
  {
    name: "execute",
    description: "Execute a command on the server",
    options: [
      {
        name: "command",
        description: "The command to execute",
        type: 3,
        required: true,
      },
    ],
  },
];
//@ts-ignore
const rest = new REST({ version: "10" }).setToken(process.env.BTOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
while(process.env.SERVERHOST == undefined || process.env.SERVERPORT == undefined) {
    setTimeout(() => {
axios
  .get(`http://${process.env.SERVERHOST}:${process.env.SERVERPORT}`, {
    method: "GET",
    data: "wsconnect",
  })
  .catch((err) => {
    console.log(err)
    console.log("Server not up");
  });
}, 1000);
}
