const start =
    `Welcome to Idle Text Adventure! You are a lone adventurer, and your task is to upgrade your equipment and skills to embark on dangerous quests. The game progresses through a series of text-based choices and encounters. To begin, you will have to make choices that will lead to certain outcomes and rewards. You can earn in-game currency by waiting for the story to progress or by actively choosing specific options. To get started, simply write '!adventure' and make your first choice, good luck on your adventure!`

module.exports = {
    name: `Idle text adventure`,
    Description: `In this game, players start as a lone adventurer and must incrementally upgrade their equipment and skills by choosing different options to progress the story. The game progresses through a series of text-based choices and encounters, such as battling monsters, solving puzzles, and making strategic decisions to ensure the survival of the player's character. As the player progresses through the game, they will encounter more powerful enemies, and more challenging quests, and must make strategic decisions to ensure their survival. Players can earn in-game currency by waiting for the story to progress or by actively choosing specific options that will lead to more rewards. The game will feature different branches of story depending on the choices made by the player, leading to different endings and outcomes. `,
    start(message) {
        message.channel.send(start);
    },
    adventure: function (message) {
        let players = {};

        function createPlayerProfile(playerName) {
            // Check if player already exists
            if (!players[playerName]) {
                players[playerName] = {
                    name: playerName,
                    level: 1,
                    gold: 0,
                    equipment: []
                };
                console.log(`Player ${playerName} profile created successfully!`);
            } else {
                console.log(`Player ${playerName} already exists!`);
            }
        }


    }
}