import { Game, Players } from "./game";
import { PlayerNumber } from "./player";
import { AiPlayer } from "./aiplayer";
import { GameType, GameColor } from "./gamerules";
import { Deck } from "./deck";

const players: Players = [
    new AiPlayer(PlayerNumber.First),
    new AiPlayer(PlayerNumber.Second),
    new AiPlayer(PlayerNumber.Third),
    new AiPlayer(PlayerNumber.Fourth)
];

const player = players[0];
const game = new Game(players);

const batchSize = 256;
const gamesPlayed = 256;

game.start();
game.setGameType(GameType.Solo, GameColor.Hearts, player);

console.log("[");

for (let g = 0; g < gamesPlayed; ++g) {

    const playerCards = player.cards.slice(0);
    let opponentCards = new Deck().cards.filter(card => playerCards.find(playerCard => playerCard!.isEqual(card)) === undefined);

    for (let i = 0; i < batchSize; ++i) {
        players.forEach(player => player.cards.length = 0);
        Deck.shuffleArray(playerCards);
        Deck.shuffleArray(opponentCards);
        player.cards.push(...playerCards);
        opponentCards.forEach((card, idx) => players[(idx % 3) + 1].cards.push(card));

        const cardsPlayed = new Array<number>();

        for (let p = 0; p < 32; ++p) {
            const currentPlayer = game.getCurrentPlayer();
            const cardIdx = (currentPlayer as AiPlayer).playCard(game.currentGameRules()!, game.getCurrentHand()!);
            cardsPlayed.push(currentPlayer.cards[cardIdx]!.hash());
            game.playCard(cardIdx);
        }

        const winner = game.getWinner();
        if (winner === undefined)
            throw new Error("Game has no winner");

        const points = game.gamePlayerPoints();
        cardsPlayed.push(points);

        console.log(JSON.stringify(cardsPlayed) + ",");

        game.start();
        game.setGameType(GameType.Solo, GameColor.Hearts, player);
    }
}

console.log("]");
