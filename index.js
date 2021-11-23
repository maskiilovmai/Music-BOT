/**
 * Module Imports
 */
const { Client, Collection } = require("discord.js");
const { readdirSync } = require("fs");
const { join } = require("path");
const { TOKEN, PREFIX } = require("./util/Util");
const i18n = require("./util/i18n");

const client = new Client({
  disableMentions: "everyone",
  restTimeOffset: 0
});

client.login(TOKEN);
client.commands = new Collection();
client.prefix = PREFIX;
client.queue = new Map();
const cooldowns = new Collection();
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Client Events
 */
client.on("ready", () => {
  console.log(`${client.user.username} ready!`);
  setInterval(() => {

    const statuses = [
        `${client.guilds.cache.size} servers!`, // Enables the bot to show how many servers it's in, in the status
        `${client.channels.cache.size} channels!`, // Enables the bot to show how many channels it's in, in the status
        `${client.users.cache.size} user!`,
        `"${PREFIX}help" to help`,
        `"${PREFIX}play" to play`,
        "with Everyone",
        "Music", // Enables the bot to send a message of your choice
    ]

    const status = statuses[Math.floor(Math.random() * statuses.length)] // Chooses a random list from statuses and puts it into a variable.
    client.user.setActivity(status, { type: "STREAMING", url: "https://www.twitch.tv/nocopyrightsounds" }) // Status changer - WATCHING / LISTENING / STREAMING / DND / ONLINE

}, 

        5000)
});
client.on("warn", (info) => console.log(info));
client.on("error", console.error);

/**
 * Import all commands
 */
const commandFiles = readdirSync(join(__dirname, "commands")).filter((file) => file.endsWith(".js"));
for (const file of commandFiles) {
  const command = require(join(__dirname, "commands", `${file}`));
  client.commands.set(command.name, command);
}

client.on("message", async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const prefixRegex = new RegExp(`^(<@!?${client.user.id}>|${escapeRegex(PREFIX)})\\s*`);
  if (!prefixRegex.test(message.content)) return;

  const [, matchedPrefix] = message.content.match(prefixRegex);

  const args = message.content.slice(matchedPrefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command =
    client.commands.get(commandName) ||
    client.commands.find((cmd) => cmd.aliases && cmd.aliases.includes(commandName));

  if (!command) return;

  if (!cooldowns.has(command.name)) {
    cooldowns.set(command.name, new Collection());
  }

  const now = Date.now();
  const timestamps = cooldowns.get(command.name);
  const cooldownAmount = (command.cooldown || 1) * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

    if (now < expirationTime) {
      const timeLeft = (expirationTime - now) / 1000;
      return message.reply(
        i18n.__mf("common.cooldownMessage", { time: timeLeft.toFixed(1), name: command.name })
      );
    }
  }

  timestamps.set(message.author.id, now);
  setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply(i18n.__("common.errorCommand")).catch(console.error);
  }
});
// client.on('message', function(message) {
//   if (message.content === '-join') {
//       if(!message.member.voice.channel) return message.channel.send("Hãy kết nối với kênh thoại trước!"); //If you are not in the voice channel, then return a message

//       message.member.voice.channel.join(); //Join the voice channel
//   }

//   if (message.content === '-leave') {
//       if(!message.member.voice.channel) return; //u cant try disconnect without entering a vc

//       message.member.voice.channel.leave(); //Leave the voice channel
//   }
// });