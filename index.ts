import { Players, Game, Winner } from "./src/game";
import { PlayerNumber, Player } from "./src/player";
import { AiPlayer } from "./src/aiplayer";
import { GameRules, GameType, GameColor } from "./src/gamerules";
import { Card } from "./src/card";
import { Hand } from "./src/hand";
import { CardImages } from "./src/cardimages";

declare const lang: string;

const players: Players = [
    new Player(PlayerNumber.First),
    new AiPlayer(PlayerNumber.Second),
    new AiPlayer(PlayerNumber.Third),
    new AiPlayer(PlayerNumber.Fourth)
];

const game = new Game(players);
const cardImages = new CardImages("images");

const heartSolo = new GameRules(GameType.Solo, GameColor.Hearts);

const gameTypeSelect = document.getElementById("gameType") as HTMLSelectElement;
const gameColorSelect = document.getElementById("gameColor") as HTMLSelectElement;
const logText = document.getElementById("log") as HTMLTextAreaElement;

const de: { [index: string] : string } = {
    "Shuffle": "Mischen",
    "Bells": "Schelln",
    "Hearts": "Herz",
    "Leaves": "Gras",
    "Acorns": "Eichel",
    "ColorLess": "Farblos",
    "<none>": "<leer>",
    "Seven": "Sieben",
    "Eight": "Acht",
    "Nine": "Neun",
    "Ten": "Zehn",
    "Jack": "Unter",
    "Queen": "Ober",
    "King": "König",
    "Ace": "Ass",
    "Play": "Spielen",
    "Game": "Spiel",
    "Cards": "Karten",
    "Stacks": "Stiche",
    "Current": "Aktueller",
    "Previous": "Letzter",
    "Hand": "Stich"
};

function _(text: string): string {

    if (text.includes(" "))
        return text.split(" ").map(item => _(item)).join(" ");

    if (lang === "de") {
        const translation = de[text];
        if (translation !== undefined)
            return translation;
    }
    return text;
}

function log(text: string) {
    logText.value += text + "\n";
}

function shuffle() {
    game.start();
    players[0].sortCards(((c1, c2) => heartSolo.compare(c1, c2)));
}

function updateCards() {
    const cards = players[0].cards;
    for (let i = 0; i < 8; ++i) {
        const tableData = document.getElementById(`player1_card${i}_label`) as HTMLDivElement;
        const card = cards[i];

        const cardImage = document.getElementById(`player1_card${i}_image`) as HTMLImageElement;
        if (card !== undefined) {
            cardImage.src = cardImages.getImage(card)
        } else {
            cardImage.src = "";
        }

        const cardLabel = card === undefined ? _("<none>") : _(card.description());
        tableData.innerText = cardLabel;
    }

    function updateStack(id: string, hand: Hand | undefined) {
        let playerIndex = hand === undefined ? 0 : hand.firstPlayerIndex;
        for (let i = 0; i < 4; ++i) {
            const cardLabel = document.getElementById(`${id}_${i}_label`) as HTMLDivElement;
            const cardImage = document.getElementById(`${id}_${i}_image`) as HTMLImageElement;
            const card = hand === undefined ? undefined : hand.cards[i];
            if (card !== undefined) {
                cardImage.src = cardImages.getImage(card);
                cardLabel.innerText = `P${playerIndex}: ${_(card.description())}`;
            } else {
                cardImage.src = "";
                cardLabel.innerText = _("<none>");
            }
            playerIndex = Game.nextPlayerIndex(playerIndex);
        }
    }

    updateStack("stack1", game.getCurrentHand());
    updateStack("stack2", game.getPreviousHand());

    const playableCards = game.playableCards();
    for (let i = 0; i < 8; ++i) {
        const playButton = document.getElementById(`player1_card${i}_play`) as HTMLButtonElement;
        const card = document.getElementById(`player1_card${i}_image`) as HTMLImageElement;

        const opacity = game.currentGameRules() !== undefined && playableCards[i] === undefined ? 0.5 : 1.0;
        playButton.disabled = playableCards[i] === undefined;
        card.setAttribute("style", `opacity: ${opacity};`);
    }
}

function printWinner() {

    if (game.getCurrentHand()!.cards.length === 0)
        log(`Player ${game.getPreviousHand()!.winner} won current hand`);

    const winner = game.getWinner();
    if (winner !== undefined) {
        const points = game.gamePlayerPoints();
        if (winner === Winner.Players)
            log(`Player won game with ${points} points`);
        else
            log(`Player lost game with ${points} points`);
    }
}

function aiPlay() {
    while (game.getCurrentPlayer().position != PlayerNumber.First) {
        const player = game.getCurrentPlayer();
        if (player.cardsLeft() === 0)
            break;

        const cardIdx = (player as AiPlayer).playCard(game.currentGameRules()!, game.getCurrentHand()!);
        log(`Player ${player.position} plays ${player.cards[cardIdx]!.description()}`);

        game.playCard(cardIdx);
        printWinner();
    }
    updateCards();
}

function startGame() {
    const gameColor = gameColorSelect.selectedIndex as GameColor;
    const gameType = gameTypeSelect.selectedIndex as GameType;

    game.setGameType(gameType, gameColor, players[0]);
    players[0].sortCards(((c1, c2) => game.currentGameRules()!.compare(c1, c2)));

    if (game.getCurrentPlayer().position !== PlayerNumber.First)
        aiPlay();
}

function playCard(cardIdx: number) {
    const card = players[0].cards[cardIdx];
    if (card === undefined)
        throw new Error("Invalid card");

    log(`Player 0 plays ${card.description()}`);

    game.playCard(cardIdx);
    updateCards();
    printWinner();

    aiPlay();
}

function initializeHtml() {

    function clearElement(element: HTMLElement) {
        while (element.firstChild)
            element.removeChild(element.firstChild);
    }

    const shuffleButton = document.getElementById("shuffle") as HTMLButtonElement;
    shuffleButton.onclick = () => {
        shuffle();
        updateCards();
    }
    shuffleButton.innerText = _("Shuffle");

    const gameButton = document.getElementById("play") as HTMLButtonElement;
    gameButton.onclick = () => {
        startGame();
        updateCards();
    }
    gameButton.innerText = _("Play");

    document.getElementById("select_game")!.innerText = _("Game");
    document.getElementById("cards_heading")!.innerText = _("Cards");
    document.getElementById("stacks_heading")!.innerText = _("Stacks");
    document.getElementById("current_hand")!.innerText = _("Current Hand");
    document.getElementById("previous_hand")!.innerText = _("Previous Hand");

    clearElement(gameTypeSelect);

    for (let i = 0; i < 4; ++i) {
        const option = document.createElement("option");
        option.innerText = _(GameType[i]);
        gameTypeSelect.appendChild(option);
    }

    clearElement(gameColorSelect);

    for (let i = 0; i < 5; ++i) {
        const option = document.createElement("option");
        option.innerText = _(GameColor[i]);
        gameColorSelect.appendChild(option);
    }

    const cardsRow = document.getElementById("player1") as HTMLTableRowElement;
    clearElement(cardsRow);
    for (let i = 0; i < 8; ++i) {
        const tableData = document.createElement("td");
        tableData.id = `player1_card${i}`;
        const cardImage = document.createElement("img");
        cardImage.id = `player1_card${i}_image`;
        const cardLabel = document.createElement("div");
        cardLabel.id = `player1_card${i}_label`;
        const playButton = document.createElement("button");
        playButton.id = `player1_card${i}_play`;
        playButton.innerText = "play";
        playButton.disabled = true;
        playButton.onclick = () => playCard(i);
        playButton.innerText = _("Play");
        tableData.appendChild(cardImage);
        tableData.appendChild(cardLabel);
        tableData.appendChild(playButton);

        cardsRow.appendChild(tableData);
    }

    function initStack(id: string) {
        const tableRow = document.getElementById(id) as HTMLTableRowElement;
        clearElement(tableRow);
        for (let i = 0; i < 4; ++i) {
            const tableData = document.createElement("td");
            const cardImage = document.createElement("img");
            cardImage.id = `${id}_${i}_image`;
            const cardLabel = document.createElement("div");
            cardLabel.id = `${id}_${i}_label`;
            tableData.appendChild(cardImage);
            tableData.appendChild(cardLabel);
            tableRow.appendChild(tableData);
        }
    }

    initStack("stack1");
    initStack("stack2");
}

initializeHtml();
shuffle();
updateCards();
