console.log('Bot is starting...');
const Discord = require('discord.js');
const osu = require('node-osu');
const chessBoard = require('./chess.js');
const config = require(`./config.js`);
const osuApi = new osu.Api(config.osuApi, {
    // baseUrl: sets the base api url (default: https://osu.ppy.sh/api)
    notFoundAsError: true, // Throw an error on not found instead of returning nothing. (default: true)
    completeScores: false, // When fetching scores also fetch the beatmap they are for (Allows getting accuracy) (default: false)
    parseNumeric: false // Parse numeric values into numbers/floats, excluding ids
});
const client = new Discord.Client({
    intents: [
        Discord.Intents.FLAGS.GUILDS,
        Discord.Intents.FLAGS.GUILD_MEMBERS,
        Discord.Intents.FLAGS.GUILD_BANS,
        Discord.Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
        Discord.Intents.FLAGS.GUILD_INTEGRATIONS,
        Discord.Intents.FLAGS.GUILD_WEBHOOKS,
        Discord.Intents.FLAGS.GUILD_INVITES,
        Discord.Intents.FLAGS.GUILD_VOICE_STATES,
        Discord.Intents.FLAGS.GUILD_MESSAGES,
        Discord.Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Discord.Intents.FLAGS.DIRECT_MESSAGES,
        Discord.Intents.FLAGS.DIRECT_MESSAGE_REACTIONS
    ],
    partials: ['MESSAGE', 'REACTION', 'CHANNEL']
});

//login with the Discord client using the Token
client.login(config.discordLogin);

//declare what the discord client should do when it's ready
client.on('ready', readyDiscord);

//declare the function which will be used when ready
function readyDiscord() {
    //log a message when ready
    console.log('The Bot is ready.');
    client.user.setPresence({
        status: 'online',  //You can show online, idle....
        activities: [{
            name: 'Rob',  //The message shown
            type: 'LISTENING' //PLAYING: WATCHING: LISTENING: STREAMING:
        }]
    });
}



client.on('messageCreate', async (message) => {

    if (message.content.startsWith('!')) {
        let contentWithoutPrefix = message.content.slice(1);
        let trimmedContent = contentWithoutPrefix.trim();
        let args = trimmedContent.split(/ +/);
        let commandName = args.shift().toLowerCase();

        if (commandName === 'chess') {
            chessBoard.execute(message);
        }
        if (commandName === 'chessgame') {
            // Get the opponent's user ID from the message
            let opponentId = message.author.id;
            // Send a message to confirm that the game has started
            message.channel.send(`Game started with opponent: <@${opponentId}>`);
            // Start the game logic here
        }


        // Command to search and ping multilinks for tournaments !ml id1 id2 acronyms
        if (commandName === 'ml') {

            if (args.length < 2) {
                return message.channel.send(`You only gave me one matchID, you're a fool :KEKW:.`)
            }
            let firstNumber = parseInt(args[0]);
            let lastNumber = parseInt(args[1]);
            if (isNaN(firstNumber)) {
                return message.channel.send(`The value ${firstNumber} is not a number, you suck :KEKW:.`);
            }
            if (isNaN(lastNumber)) {
                return message.channel.send(`The value ${lastNumber} is not a number, you suck :KEKW:.`);
            }
            if (firstNumber > lastNumber) {
                return message.channel.send(`Number ${firstNumber} is larger than ${lastNumber} wow, I didn't expect anyone to be this stupid :KEKW:. `)
            }
            for (let i = firstNumber; i <= lastNumber; i++) {
                console.log(i, `https://osu.ppy.sh/community/matches/${i}`);

                await osuApi.getMatch({ mp: i })
                    .then(match => {
                        if (args.length < 3) {
                            if (match.name.toLowerCase().match(/.+:.+vs.+/g) && match.games[0] && match.games[0].scores.length > 0) {
                                message.channel.send(`<https://osu.ppy.sh/community/matches/${i}>`);
                            }
                        } else {
                            let tournamentAcronym = args[2].toLowerCase();
                            if (match.name.toLowerCase().startsWith(tournamentAcronym)) {
                                message.channel.send(`<https://osu.ppy.sh/community/matches/${i}>`);
                                i = Infinity;
                            }
                        }
                    })
                    .catch(error => {
                        if (error.message !== 'Not found') {
                            console.log(error);
                        }
                    });
                await pause(200);
            }
            message.reply(`Process finished.`);
        }

        //command to search for multiplayer ID's in a certain time frame  
        else if (commandName === 'sid') {
            let startID = args.shift();
            let matchInfo = await getFirstMatch(startID);
            console.log(matchInfo)
            let targetDate = new Date(args.join(' ')).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h24' });
            console.log(targetDate)
            await osuApi.getMatch({ mp: startID })
                .then(match => {
                    let startTime = Date.parse(match.raw_start).toString();
                    let foundDate = new Date(match.raw_start).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h24' });
                    if (startTime > Date.parse(targetDate)) {

                        //figure out here how to search AGANE but for a larger ID

                        console.log('Yep, the start time of this match is in the future.');
                        message.reply(`This match was created on ${foundDate} which is after the desired date ${targetDate}.`);
                    }
                    else {

                        //figure out here how to search AGANE but for a smaller ID

                        console.log('Nope, the start time of this match is in the past.');
                        message.reply(`This match was created on ${foundDate} which was before the desired date ${targetDate}.`);
                    }
                })
                .catch(error => {
                    if (error.message !== 'Not found') {
                        console.log(error);
                    }
                });
        }
    }
});
async function pause(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getFirstMatch(matchID) {
    return await osuApi.getMatch({ mp: matchID })
        .then(match => {
            let matchInfo = {
                matchID: match.id,
                date: Date.parse(match.raw_start)
            };
            return matchInfo;
        })
        .catch(error => {
            if (error.message === 'Not found') {
                return getFirstMatch(matchID - 1);
            } else {
                console.log(error);
            }
        });
}




