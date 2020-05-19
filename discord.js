'use strict';
require('dotenv').config();

const Discord = require('discord.js');
const bot = new Discord.Client();

bot.on('ready', () => {
  console.log(`Bot ${bot.user.tag} ready!`);
  bot.user.setStatus('online');
});

bot.login(process.env.DISCORD_BOT_TOKEN);

module.exports = bot;
