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