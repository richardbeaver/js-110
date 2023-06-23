/*

- Initialize deck
- Deal cards to player and dealer
- Player turn: hit or stay
  - Repeat until bust or stay
- If player bust, dealer wins.
- Dealer turn: hit or stay
  - Repeat until total >= dealer minimum score
- If dealer busts, player wins.
- Compare cards and declare winner.

Deck data structure
- Nested array
- Each sub-array represents a card
  - [<suit>, <value>] (both strings)

*/

const rlSync = require('readline-sync');

const PLAYER = 'Player';
const DEALER = 'DEALER';
const INPUT_ERROR_PROMPT = "Sorry, that's not a valid choice";

const SUITS = ['C', 'D', 'H', 'S'];
const VALUES = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];
const MAX_SCORE = 21;
const DEALER_MIN = 17;

// =================================================================
// =================================================================

function displayPrompt(prompt) {
  console.log(`=> ${prompt}`);
}

function cardAsString(card) {
  return `${card[1]}-${card[0]}`;
}

function handAsString(hand) {
  return hand.map((card) => cardAsString(card)).join(' ');
}

// Fisher-Yates shuffle
// https://en.wikipedia.org/wiki/Fisher–Yates_shuffle
function shuffleDeck(deck) {
  for (let index = deck.length - 1; index > 0; index--) {
    let otherIndex = Math.floor(Math.random() * (index + 1)); // 0 to index
    [deck[index], deck[otherIndex]] = [deck[otherIndex], deck[index]]; // swap elements
  }

  return deck;
}

function initializeDeck() {
  let deck = [];
  SUITS.forEach((suit) => {
    VALUES.forEach((value) => {
      deck.push([suit, value]);
    });
  });

  return shuffleDeck(deck);
}

function dealHand(deck) {
  return [deck.pop(), deck.pop()];
}

function hit(deck, currentHand) {
  currentHand.push(deck.pop());
}

/*
`total`

input: nested array representing cards in a hand
output: integer of the hand's value

- Assume Aces are 11 - sum values
- If value over `MAX_SCORE`:
  - Remove 10 points for each Ace in hand until sum <= `MAX_SCORE`
- Return total
*/

// Tests with `MAX_SCORE` at 21:
// console.log(
//   total([['H', '3'], ['S', 'Q']]) === 13,
//   total([['H', 'A'], ['S', 'Q']]) === 21,
//   total([['H', 'A'], ['S', 'A']]) === 12,
//   total([['H', '3'], ['S', 'Q'], ['D', 'A']]) === 14,
//   total([['H', 'A'], ['S', 'A'], ['D', 'A']]) === 13,
//   total([['H', 'Q'], ['S', 'A'], ['D', 'A'], ['H', 'A']]) === 13,
// )

function total(cards) {
  // cards = [['H', '3'], ['S', 'Q'], ... ]
  let values = cards.map((card) => card.at(1));

  let sum = values.reduce((acc, value) => {
    if (value === 'A') return acc + 11;
    if (['J', 'Q', 'K'].includes(value)) return acc + 10;
    return acc + Number(value);
  }, 0);

  if (sum > MAX_SCORE) {
    values.forEach((value) => {
      if (value === 'A' && sum > MAX_SCORE) sum -= 10;
    });
  }

  return sum;
}

function busted(playerTotal) {
  return playerTotal > MAX_SCORE;
}

/*
`playerTurn`

1. Ask player to hit or stay
2. If stay, stop asking
3. If hit, deal card and check if player has busted
3. Repeat
*/
function playerTurn(deck, playerHand, dealerCard) {
  while (true) {
    console.clear();

    let playerTotal = total(playerHand);

    displayPrompt(`Your hand: ${handAsString(playerHand)}`);
    displayPrompt(`Your score: ${playerTotal}`);
    displayPrompt(`Dealer card: ${cardAsString(dealerCard)}`);

    if (busted(playerTotal)) break;

    let answer;
    while (true) {
      displayPrompt('Would you like to (h)it or (s)tay?');
      answer = rlSync.question().toLowerCase();
      if (answer === 'h' || answer === 's') break;
      displayPrompt(`${INPUT_ERROR_PROMPT}: Please enter 'h' or 's'.`);
    }

    if (answer === 'h') hit(deck, playerHand);
    if (answer === 's') break;
  }
}

function dealerTurn(deck, dealerHand) {
  while (total(dealerHand) < DEALER_MIN) {
    hit(deck, dealerHand);
  }
}

function detectWinner(playerTotal, dealerTotal) {
  if (playerTotal > MAX_SCORE) return DEALER;
  if (dealerTotal > MAX_SCORE || playerTotal > dealerTotal) return PLAYER;
  if (playerTotal < dealerTotal) return DEALER;
  return null;
}

function displayResult(winner) {
  if (winner === PLAYER) {
    displayPrompt('You won!');
  } else if (winner === DEALER) {
    displayPrompt('You lost!');
  } else {
    displayPrompt("It's a tie!");
  }
}

function playAgain() {
  displayPrompt('--------------------------');
  let answer;
  while (true) {
    displayPrompt('Play again? (y or n)');
    answer = rlSync.question().toLowerCase();
    if (answer === 'y' || answer === 'n') break;
    displayPrompt(`${INPUT_ERROR_PROMPT}: Please enter 'y' or 'n'.`);
  }

  return answer === 'y';
}

// =================================================================
// =================================================================

while (true) {
  // Each game:
  let deck = initializeDeck();
  let playerHand = dealHand(deck);
  let dealerHand = dealHand(deck);

  playerTurn(deck, playerHand, dealerHand[0]);
  let playerTotal = total(playerHand);

  let winner;
  if (busted(playerTotal)) {
    displayPrompt('Looks like you busted');
    winner = DEALER;
  } else {
    displayPrompt('You chose to stay');

    dealerTurn(deck, dealerHand);
    let dealerTotal = total(dealerHand);

    displayPrompt(`Dealer hand: ${handAsString(dealerHand)}`);
    displayPrompt(
      dealerTotal > MAX_SCORE ? 'Dealer busted' : `Dealer got ${dealerTotal}`
    );

    winner = detectWinner(playerTotal, dealerTotal);
  }

  displayResult(winner);

  if (!playAgain()) break;
}

displayPrompt('Thanks for playing!');
