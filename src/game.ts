import { Card, Color, Rank } from "./card";
import { Player, PlayerNumber } from "./player";
import { Deck } from "./deck";
import { Hand } from "./hand";
import { GameRules, GameColor, GameType, GameExtraFlags } from "./gamerules";
import { GameStack } from "./gamestack";

export type Players = [Player, Player, Player, Player];

export const enum Winner {
    Players, Opponents
}

export class Game {

    private currentPlayer: Player;
    private currentStack?: GameStack;
    private deck?: Deck;
    private firstPlayer: Player;
    private gameRules?: GameRules;

    private gamePlayers?: [ Player, Player | undefined ];
    private gamePlayersWon? = false;

    constructor(readonly players: Players) {
        this.currentPlayer = this.firstPlayer = players[0];
    }

    currentGameRules(): GameRules | undefined { return this.gameRules; }
    getCurrentPlayer(): Player { return this.currentPlayer; }
    getCurrentHand(): Hand | undefined { return this.currentStack ? this.currentStack.currentHand : undefined; }
    getPreviousHand(): Hand | undefined { return this.currentStack ? this.currentStack.hands[this.currentStack.hands.length - 1] : undefined; }

    getWinner(): Winner | undefined {
        if (this.gamePlayersWon === undefined)
            return undefined;
        return this.gamePlayersWon === true ? Winner.Players : Winner.Opponents;
    }

    start() {
        this.currentStack = new GameStack(this.currentPlayer.position);
        this.deck = new Deck();
        this.deck.shuffle()

        this.gameRules = undefined;
        this.gamePlayers = undefined;
        this.gamePlayersWon = undefined;

        for (let player of this.players)
            player.cards = new Array<Card>();

        this.deck.cards.forEach((card, i) => {
            this.players[i % 4].cards.push(card);
        });
    }

    setGameType(gameType: GameType, gameColor: GameColor, player1: Player, gameExtraFlags: GameExtraFlags = GameExtraFlags.Normal) {
        if (this.gameRules !== undefined)
            throw new Error("Cannot change running game");

        const gameRules = new GameRules(gameType, gameColor, gameExtraFlags);

        if (gameType === GameType.Sau) {
            if (gameRules.playerHasGameAce(player1))
                throw new Error("Player must not have game ace");
            if (!gameRules.playerHasColor(player1, gameColor.valueOf()))
                throw new Error("Player must have at least one card in game color");
        }

        this.gameRules = gameRules;

        let player2 = undefined;
        if (gameType === GameType.Sau) {
            player2 = this.players.find(player => gameRules.playerHasGameAce(player));
        }

        this.gamePlayers = [ player1, player2 ];
    }

    playCard(cardIndex: number) {
        if (this.gameRules === undefined)
            throw new Error("No game in progress")

        const card = this.currentPlayer.cards[cardIndex];
        if (card === undefined || !this.gameRules.isCardAllowed(card, this.currentStack!.currentHand, this.currentPlayer))
            throw new Error("Invalid card");

        this.currentPlayer.cards[cardIndex] = undefined;
        this.currentStack!.currentHand.cards.push(card);
        this.nextTurn();
    }

    private nextTurn() {
        this.updateCurrentWinner();

        //if (this.gameRules!.gameExtraFlags === GameExtraFlags.Tout && )
        // ### TODO

        if (this.currentStack!.currentHand.cards.length === 4)
            this.finalizeCurrentHand()
        else
            this.currentPlayer = this.players[Game.nextPlayerIndex(this.currentPlayer.position)];
    }

    playableCards() {
        if (this.gameRules === undefined)
            return [];
        return this.currentPlayer.cards.map(card => {
            if (card === undefined)
                return card;
            if (this.gameRules!.isCardAllowed(card, this.currentStack!.currentHand, this.currentPlayer))
                return card;
            return undefined;
        });
    }

    private updateCurrentWinner() {
        const currentHand = this.currentStack!.currentHand
        if (currentHand.cards.length == 1) {
            currentHand.winner = this.currentPlayer.position;
            currentHand.winningCardIndex = 0;
            return
        }

        const winningCard = currentHand.cards[currentHand.winningCardIndex!];
        if (this.gameRules!.isHigherCard(winningCard, currentHand.cards[currentHand.cards.length - 1])) {
            currentHand.winner = this.currentPlayer.position;
            currentHand.winningCardIndex = currentHand.cards.length - 1;
        }
    }

    static nextPlayerIndex(playerIdx: number): number {
        return playerIdx === 3 ? 0 : playerIdx + 1;
    }

    static previousPlayerIndex(playerIdx: number): number {
        return playerIdx === 0 ? 3 : playerIdx - 1;
    }

    private nextPlayer(player: Player): Player {
        return this.players[Game.nextPlayerIndex(player.position)];
    }

    private finalizeCurrentHand() {
        const winner = this.players[this.currentStack!.currentHand.winner!];
        this.currentPlayer = winner;

        this.currentStack!.finalizeCurrentHand(this.currentPlayer.position);

        if (this.currentPlayer.cardsLeft() === 0) {
            this.finalizeCurrentGame();
        }
    }

    public gamePlayerPoints(): number {
        const points = this.currentStack!.getPoints();

        let team1Points = 0;

        const player1Position = this.gamePlayers![0].position;
        const player2Position = this.gamePlayers![1] === undefined ? -1 : this.gamePlayers![1]!.position;
        points.forEach((point, i) => {
            if (i === player1Position || i === player2Position)
                team1Points += point;
        });

        return team1Points
    }

    private finalizeCurrentGame() {
        // TODO - update credits
        this.currentPlayer = this.nextPlayer(this.firstPlayer);
        this.firstPlayer = this.currentPlayer;
        this.gamePlayersWon = this.gamePlayerPoints() > 60;
    }
}