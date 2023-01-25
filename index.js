console.log('Bot is starting...');
const Discord = require('discord.js');
const osu = require('node-osu');
const chess = require('./chess.js');
const config = require(`./config.js`);
const idle = require(`./adventure.js`);
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
            chess.execute(message);
        }
        if (commandName === 'chessgame') {
            chess.startchessgame(message);
        }
        if (commandName === 'start') {
            idle.start(message);
        }
        if (commandName === 'adventure') {
            console.log(message.author.username)
            idle.adventure.name(message.author.username);
            idle.adventure.createPlayerProfile(message);
        }
        // Command to return a matchID that's the closest to the given date
        if (commandName === 'findmatch') {
            let maxMatchId;
            // this is the id from a match on 25-01-2023
            let id = 106458592;
            let attempts = 0;
            // 1 attempt is about 1,5 months range
            const maxAttempts = 20;
            const maxDifference = 55 * 24 * 60 * 60 * 1000;
            const currentDate = new Date();
            const args = message.content.split(' ');
            let targetDate;
            const dateRegex = /(\d{2})-(\d{2})-(\d{4})/;
            const dateString = args.slice(1).join(' ');
            const match = dateString.match(dateRegex);
            const sixMonthsInMilliseconds = 6 * 30 * 24 * 60 * 60 * 1000;
            if (match) {
                const [_, day, month, year] = match;
                targetDate = new Date(`${year}-${month}-${day} ${dateString.slice(10)}`);
            } else {
                targetDate = new Date(dateString);
            }
            if (targetDate > currentDate) {
                message.reply(`The date you have entered is in the future, please enter a date that's in the past.`);
                return;
            }
            if (currentDate - targetDate > sixMonthsInMilliseconds) {
                message.reply("The target date can be at most 6 months in the past.");
                return;
            }

            while (attempts < maxAttempts) {
                try {
                    const match = await osuApi.getMatch({ mp: id });
                    console.log(`checking id: ${id} to see the date.`)
                    const matchDate = new Date(match.raw_start);
                    const difference = currentDate - matchDate;
                    if (difference < maxDifference) {
                        maxMatchId = id + 1000000;
                        break;
                    }
                } catch (error) {
                    if (error.message !== 'Not found') {
                        console.log(error);
                        break;
                    }
                }
                id += 1000000;
                attempts++;
            }

            if (attempts >= maxAttempts) {
                console.log("Max attempts to find latest id was reached, no max match id found, you probably haven't used the bot for a while? re-adjust the id value in the code.");
            }
            else {
                // calculate the min match id
                const minMatchId = maxMatchId - 4000000;
                const MAX_TRIES = 20;
                let closestMatchId;
                let closestDifference = Infinity;
                let minId = minMatchId;
                let maxId = maxMatchId;
                let tries = 0;
                let middleId = Math.floor((minId + maxId) / 2);
                let closest;
                console.log(`This is the target date: ${targetDate}`)
                while (minId <= maxId && tries < MAX_TRIES) {
                    try {
                        console.log(`Current range: ${minId} - ${maxId}`)
                        const match = await osuApi.getMatch({ mp: middleId });
                        const matchDate = new Date(match.raw_start);
                        const difference = Math.abs(targetDate - matchDate);
                        if (difference < closestDifference) {
                            closestMatchId = match.match_id;
                            closestDifference = difference;
                        }
                        if (matchDate > targetDate) {
                            closest = middleId
                            maxId = middleId - 1;
                            middleId = Math.floor((minId + maxId) / 2);
                            tries++;
                        } else {
                            closest = middleId
                            minId = middleId + 1;
                            middleId = Math.floor((minId + maxId) / 2);
                            tries++;
                        }
                    } catch (error) {
                        if (error.message !== 'Not found') {
                            console.log(error);
                        }
                        else {
                            maxId = middleId
                            newMiddleId = middleId + Math.floor(Math.random() * (maxId - minId)) - Math.floor(Math.random() * (maxId - minId));
                            if (newMiddleId <= maxId && newMiddleId >= minId) {
                                tries++;
                                console.log(`This was try number ${tries}, the id did not give a response, created a new random id: ${newMiddleId}`);
                                middleId = newMiddleId;
                            } else {
                            }
                        }
                    }
                    if (tries >= MAX_TRIES) {
                        message.reply(`The closest match to the provided date and time after 20 searches is match ID: ${closest}. Visit the multi link here https://osu.ppy.sh/community/matches/${closest} `);
                    }
                }
            }
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
        //Command to search for multiplayer ID's in a certain time frame  
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





