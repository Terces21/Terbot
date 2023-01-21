// First steps, returns the starting position of a chessboard
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
};

// Command to initiate a new game 
exports.startchessgame = function (message) {
  // Get the opponent's user ID from the message
  let opponentId = message.author.id;
  // Send a message to confirm that the game has started
  message.channel.send(`Game started with opponent: <@${opponentId}>`);
  // Start the game logic here

};



