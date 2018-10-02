import { Game, Players, Winner } from "./src/game";
import { GameRules, GameType, GameColor } from "./src/gamerules";
import { PlayerNumber, Player } from "./src/player";
import { AiPlayer } from "./src/aiplayer";
import { Card } from "./src/card";

import * as readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});
rl.setPrompt("SCHAF> ");

const players: Players = [
    new Player(PlayerNumber.First),
    new AiPlayer(PlayerNumber.Second),
    new AiPlayer(PlayerNumber.Third),
    new AiPlayer(PlayerNumber.Fourth)
];

const game = new Game(players);

const heartSolo = new GameRules(GameType.Solo, GameColor.Hearts);

function getCardCompareFunction(rules: GameRules) {
    return (a: Card | undefined, b: Card | undefined): number => rules.cardSortRank(b) - rules.cardSortRank(a);
}

function printWinner() {

    if (game.getCurrentHand()!.cards.length === 0)
        console.log("Player", game.getPreviousHand()!.winner, "won current hand");

    const winner = game.getWinner();
    if (winner !== undefined) {
        const points = game.gamePlayerPoints();
        if (winner === Winner.Players)
            console.log("Player won game with", points, "points");
        else
            console.log("Player lost game with", points, "points");
    }
}

function aiPlay() {
    while (game.getCurrentPlayer().position != PlayerNumber.First) {
        const player = game.getCurrentPlayer();
        if (player.cardsLeft() === 0)
            break;

        const cardIdx = (player as AiPlayer).playCard(game.currentGameRules()!, game.getCurrentHand()!);
        console.log("Player", player.position, "player", player.cards[cardIdx]!.description());

        game.playCard(cardIdx);
        printWinner();
    }
}

function dumpCards(cards: Array<Card | undefined>) {
    return cards.map((card, idx) => `${idx}: ${card !== undefined ? card.description() : "-"}`).join(", ");
}

function printPlayableCards() {
    game.playableCards().forEach((card, idx) => {
        if (card === undefined)
            return;
        console.log(idx, card.description());
    });
}

function playCard(cardIdx: number) {
    const card = players[0].cards[cardIdx];
    if (card === undefined)
        throw new Error("Invalid card");

    console.log("Player 0 plays", card.description());
    game.playCard(cardIdx);
    printWinner();

    aiPlay();
}

function print() {
    const gameRules = game.currentGameRules();
    if (gameRules !== undefined)
        console.log("Current game", GameType[gameRules.gameType], GameColor[gameRules.gameColor]);
    console.log("Current player", game.getCurrentPlayer().position);
    players.forEach((player, idx) => {
        console.log(`Player ${idx}:`, dumpCards(player.cards));
    });
}

rl.prompt();

rl.on("line", (line: string) => {
    try {
        const args = line.split(" ");

        switch (args[0]) {

        case 'start':
            game.start();
            players[0].sortCards(getCardCompareFunction(heartSolo));
            print();
            break;

        case 'game':
            const gameColorName = args[1] as keyof typeof GameColor;
            const gameTypeName = args[2] as keyof typeof GameType;

            const gameColor = GameColor[gameColorName];
            const gameType = GameType[gameTypeName];

            if (gameColor === undefined || gameType === undefined)
                throw new Error(`Invalid game ${args[1]} ${args[2]}`);

            game.setGameType(gameType, gameColor, players[0]);
            players[0].sortCards(getCardCompareFunction(game.currentGameRules()!));
            console.log("New game started");

            if (game.getCurrentPlayer().position !== PlayerNumber.First)
                aiPlay();

            printPlayableCards();
            break;

        case 'print':
            print();
            break;

        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
            playCard(Number.parseInt(line));
            printPlayableCards();
            break;

        case 'hand':
            const currentHand = game.getCurrentHand();
            if (currentHand !== undefined)
                console.log(dumpCards(currentHand.cards));
            break;

        default:
            console.log("Unknown command:", line);
        }
    } catch (err) {
        console.log("Error", err);
    }
    rl.prompt();
}).on("close", () => {
    console.log("Bye");
    process.exit(0);
});
