/*

(
  Bonus feature notes and implementations at bottom of file

  Other features to do:
  - Keep Score:
    - First to win 5 games wins the overall match
    - Report game wins after each game
    - Scores reset to 0 for each player at start of new match
    - No global variables
    - Can use a global constant for number of games needed to win match
  - Create setting at top of program to let user choose whether to go first
    or let computer go first
    - Can have a global constant that says who starts, with options being
      "player", "computer", or "choose" (where "choose" prompts the user
      to decide)

  More challenging ideas:
  - Minimax algorithm
    - Build an unbeatbale tic tac toe using the minimax algorithm
    - https://en.wikipedia.org/wiki/Minimax
  - Bigger board
    - What happens with a 5x5 board instead of 3x3? 9x9?
  - More players
    - Play against 2 computers? 2 humans against a computer?
)


High-level breakdown:

1. Display the initial empty 3x3 board.
2. Ask the user to mark a square.
3. Computer marks a square.
4. Display the updated board state.
5. If it's a winning board, display the winner.
6. If the board is full, display tie.
7. If neither player won and the board is not full, go to #2
8. Play again?
9. If yes, go to #1
10. Goodbye!


Notes:

The idea of the "board" is involved in almost all steps in our flowchart
- Main data structure of the program
- Could use 9-element array, nested array, or an object (as we do here)

In the board object, each key (1-9) represents a specific square
- (left to right, top to bottom)
- Spaces for empty squares to not mess up formatting

No magic constants
- Use symbolic constants
- For empty squares and human and computer markers

Use `console.clear` at beginning of display function to clear terminal

Have `detectWinner` return the name of the winner as a string, or `null` if
the game is a tie
- That way, `someoneWon` can treat that value as truthy or falsey with `!!`


*/

const rlSync = require('readline-sync');

const COMPUTER = "Computer";
const PLAYER = "Player";
const STARTING_PLAYER = PLAYER;

const INITIAL_MARKER = ' ';
const HUMAN_MARKER = 'X';
const COMPUTER_MARKER = 'O';
const INPUT_ERROR_PROMPT = "Sorry, that's not a valid choice.";

const WINNING_LINES = [
  [1, 2, 3], [4, 5, 6], [7, 8, 9],  // rows
  [1, 4, 7], [2, 5, 8], [3, 6, 9],  // columns
  [1, 5, 9], [3, 5, 7]              // diagonals
];

//

function displayPrompt(prompt) {
  console.log(`=> ${prompt}`);
}

function displayBoard(board) {
  console.clear();

  console.log(`You are ${HUMAN_MARKER}. Computer is ${COMPUTER_MARKER}.`);

  console.log('');
  console.log('     |     |');
  console.log(`  ${board['1']}  |  ${board['2']}  |  ${board['3']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['4']}  |  ${board['5']}  |  ${board['6']}`);
  console.log('     |     |');
  console.log('-----+-----+-----');
  console.log('     |     |');
  console.log(`  ${board['7']}  |  ${board['8']}  |  ${board['9']}`);
  console.log('     |     |');
  console.log('');
}

function initializeBoard() {
  let board = {};

  for (let square = 1; square <= 9; square += 1) {
    board[String(square)] = INITIAL_MARKER;
  }

  return board;
}

function emptySquares(board) {
  return Object.keys(board).filter((key) => board[key] === INITIAL_MARKER);
}

function playerChoosesSquare(board) {
  let square;

  while (true) {
    displayPrompt(`Choose a square: ${joinOr(emptySquares(board))}:`);
    square = rlSync.question().trim();

    if (emptySquares(board).includes(square)) break;

    displayPrompt(INPUT_ERROR_PROMPT);
  }

  board[square] = HUMAN_MARKER;
}

function computerChoosesSquare(board) {
  // Offense - look for a winning move
  let square = findAtRiskSquare(board, COMPUTER_MARKER);

  // Defense - block a user's winning move
  if (!square) {
    square = findAtRiskSquare(board, HUMAN_MARKER);
  }

  // Choose square 5 if available
  if (!square && board['5'] === INITIAL_MARKER) {
    square = '5';
  }

  // Choose a random square:
  if (!square) {
    let randomIdx = Math.floor(Math.random() * emptySquares(board).length);
    square = emptySquares(board)[randomIdx];
  }

  board[square] = COMPUTER_MARKER;
}

function chooseSquare(board, currentPlayer) {
  if (currentPlayer === PLAYER) {
    playerChoosesSquare(board);
  } else {
    computerChoosesSquare(board);
  }
}

function alternatePlayer(currentPlayer) {
  return currentPlayer === PLAYER ? COMPUTER : PLAYER;
}

function boardFull(board) {
  return emptySquares(board).length === 0;
}

function someoneWon(board) {
  return !!detectWinner(board);
}

function detectWinner(board) {
  for (let idx = 0; idx < WINNING_LINES.length; idx += 1) {
    let [ sq1, sq2, sq3 ] = WINNING_LINES[idx];

    if (
      board[sq1] === HUMAN_MARKER &&
      board[sq2] === HUMAN_MARKER &&
      board[sq3] === HUMAN_MARKER
    ) {
      return PLAYER;
    }

    if (
      board[sq1] === COMPUTER_MARKER &&
      board[sq2] === COMPUTER_MARKER &&
      board[sq3] === COMPUTER_MARKER
    ) {
      return COMPUTER;
    }
  }

  return null;
}

//

while (true) {
  let board = initializeBoard();
  let currentPlayer = STARTING_PLAYER;

  while (true) {
    // Here, board gets displayed after each individual turn, but the call to
    // `console.clear` in `displayBoard` clears the first, and user only sees
    // the second as they input their next choice
    displayBoard(board);
    chooseSquare(board, currentPlayer);
    currentPlayer = alternatePlayer(currentPlayer);
    if (someoneWon(board) || boardFull(board)) break;
  }

  displayBoard(board);

  if (someoneWon(board)) {
    displayPrompt(`${detectWinner(board)} won!`);
  } else {
    displayPrompt("It's a tie!");
  }

  let answer;
  while (true) {
    displayPrompt('Play again? (y or n)');
    answer = rlSync.question().trim().toLowerCase();
    if (answer === 'y' || answer === 'n') break;
    displayPrompt(INPUT_ERROR_PROMPT);
  }
  if (answer === 'n') break;
}

displayPrompt('Thanks for playing Tic Tac Toe!');

// =============================================================
// =============================================================

// Bonus Features

/*

`joinOr`

input: list of values, optional delimiter (defaults to ', '), optional
  join word (defaults to 'or')
output: string representing the list

If input array is empty, return an empty string
If input array has one value, return that value as a string
If input array has two values, return those values separated by the join word
  without using the delimiter
Otherwise, return the concatenation of input array values:
- Add delimiter between each pair of values
- Add join word before last value

*/

// console.log(
//   joinOr([1, 2, 3]),               // => "1, 2, or 3"
//   joinOr([1, 2, 3], '; '),         // => "1; 2; or 3"
//   joinOr([1, 2, 3], ', ', 'and'),  // => "1, 2, and 3"
//   joinOr([]),                       // => ""
//   joinOr([5]),                      // => "5"
//   joinOr([1, 2]),                   // => "1 or 2"
// );

function joinOr(list, delimiter = ', ', joinWord = 'or') {
  switch (list.length) {
    case 0: return '';
    case 1: return String(list[0]);
    case 2: return list.join(` ${joinWord} `);
    default:
      // Take slice of input array excluding last element, and concatenate with
      // delimiter, join word, and last element
      return `${list.slice(0, -1).join(delimiter)}${delimiter}${joinWord} ${list.at(-1)}`;
  }
}


// Computer choices:

// - Computer Offense: Look for a winning move to play

// - Computer Defense: If no winning move available, look for a user's
//   impending winning move to block

// - If no winning move to make or block, choose square 5 if available, or else
//   then pick a random square


// If two squares in the given line have values that match the marker, and
// the third square is still available, return that available square
function checkForAtRiskSquare(line, board, marker) {
  let markersInLine = line.map((square) => board[square]);

  if (markersInLine.filter((val) => val === marker).length === 2) {
    let unusedSquare = line.find((square) => board[square] === INITIAL_MARKER);
    if (unusedSquare !== undefined) {
      return unusedSquare;
    }
  }

  return null;
}

// Search board for an at-risk square using the given marker; return the
// square if one is found
function findAtRiskSquare(board, marker) {
  let unusedSquare;
  for (let idx = 0; idx < WINNING_LINES.length; idx += 1) {
    let line = WINNING_LINES[idx];
    unusedSquare = checkForAtRiskSquare(line, board, marker);
    if (unusedSquare) return unusedSquare;
  }
  return null;
}
