// First steps, returns the starting position of a chessboard
let invites = [];
const chessBoard =
  '```\n' +
  'r  n  b  q  k  b  n  r\n' +
  'p  p  p  p  p  p  p  p\n' +
  '.  .  .  .  .  .  .  .\n' +
  '.  .  .  .  .  .  .  .\n' +
  '.  .  .  .  .  .  .  .\n' +
  '.  .  .  .  .  .  .  .\n' +
  'P  P  P  P  P  P  P  P\n' +
  'R  N  B  Q  K  B  N  R\n' +
  '```';

module.exports = {
  name: 'chessboard',
  description: 'Returns the starting position of a chess board.',
  execute(message) {
    message.channel.send(chessBoard);
  },
  startchessgame: function (message) {

    // Get the user ID from the message to create player1
    let Player1 = message.author.id;

    // Check if someone was mentioned to create player2
    if (message.mentions.users.size === 0) {
      message.reply('Please mention someone to invite them to play a game.');
    } else {
      let Player2 = message.mentions.users.first();
      let invite = {
        sender: message.author.id,
        receiver: Player2.id,
        status: 'pending',
        timestamp: new Date()
      };
      invites.push(invite);
      // Send the invited player the invite
      message.channel.send(`${Player2} you have been invited to a game by ${message.author}. Use !accept or !reject to accept or reject the invite.`);

      // Check if the invite was accepted
      client.on('message', message => {
        if (message.content === '!accept') {
          let invite = invites.find(invite => invite.receiver === message.author.id);
          if (!invite) {
            message.reply('You have not been invited to any game.');
          } else {
            invite.status = 'accepted';
            message.channel.send(`${message.author} has accepted the game invite from ${invite.sender}. Game started between: <@${Player1}> and ${Player2}, Have fun!`);
          }
        }
        if (message.content === '!reject') {
          let invite = invites.find(invite => invite.receiver === message.author.id);
          if (!invite) {
            message.reply('You have not been invited to any game.');
          } else {
            invite.status = 'rejected';
            message.channel.send(`${message.author} has rejected the game invite from ${invite.sender}.`);
          }
        }
      });
    }

  },
}




