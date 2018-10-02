import { Card, Rank, Color } from "./card";
import { Player } from "./player";
import { Hand } from "./hand";

export enum GameType {
    Solo = 0,
    Wenz = 1,
    Geier = 2,
    Sau = 3
}

export enum GameColor {
    Bells = 0,
    Hearts = 1,
    Leaves = 2,
    Acorns = 3,
    ColorLess = 4
}

export enum GameExtraFlags {
    Normal = 0,
    Tout = 1,
    Sie = 2
}

export class GameRules {

    public readonly trumpColor: GameColor;

    constructor(readonly gameType: GameType, readonly gameColor: GameColor, readonly gameExtraFlags: GameExtraFlags = GameExtraFlags.Normal) {
        if (gameColor == GameColor.ColorLess && (gameType == GameType.Solo || gameType == GameType.Sau))
            throw new Error("Invalid Game");
        if (gameType === GameType.Sau && gameColor === GameColor.Hearts)
            throw new Error("Invalid Game");
        this.trumpColor = gameType === GameType.Sau ? GameColor.Hearts : gameColor;
    }

    isHigherCard(oldCard: Card, newCard: Card): boolean {
        const oldTrumpValue = this.trumpValue(oldCard)
        const newTrumpValue = this.trumpValue(newCard)

        if (newTrumpValue > oldTrumpValue)
            return true;
        if (newTrumpValue < oldTrumpValue)
            return false;

        if (oldCard.color == newCard.color)
            return newCard.rank > oldCard.rank;
        return false;
    }

    trumpValue(card: Card): number {
        if (card.rank === Rank.Queen && this.gameType !== GameType.Wenz)
            return (card.color + 1) << 24;
        if (card.rank === Rank.Jack && this.gameType !== GameType.Geier)
            return (card.color + 1) << 16;
        if (card.color as number === this.trumpColor)
            return card.rank + 1;
        return 0;
    }

    isTrump(card: Card): boolean {
        return this.trumpValue(card) != 0
    }

    isGameAce(card: Card): boolean {
        return card.color.valueOf() === this.gameColor.valueOf() && card.rank === Rank.Ace;
    }

    isCardAllowed(card: Card, hand: Hand, player: Player): boolean {
        if (hand.cards.length === 0) {
            if (this.gameType !== GameType.Sau)
                return true; // all cards allowed
            if (!this.playerHasGameAce(player))
                return true;
            // ### TODO - davonlaufen?
            if (!this.isTrump(card) && this.gameColor.valueOf() === card.color.valueOf() && card.rank !== Rank.Ace)
                return false;
            return true;
        }

        const firstCard = hand.cards[0];

        if (this.gameType === GameType.Sau && this.playerHasGameAce(player)) {
            // first card is game color - player must play Ace
            if (firstCard.color.valueOf() === this.gameColor.valueOf())
                return this.isGameAce(card);
            else if (this.isGameAce(card))
                return false; // player must not play game ace
        }

        if (this.isTrump(firstCard)) {
            if (this.isTrump(card))
                return true;
            return !this.playerHasTrump(player);
        }

        if (firstCard.color == card.color && !this.isTrump(card))
            return true;
        return !this.playerHasColor(player, firstCard.color)
    }

    playerHasTrump(player: Player): boolean {
        return player.cards.find(card => card !== undefined && this.isTrump(card)) !== undefined;
    }

    playerHasColor(player: Player, color: Color): boolean {
        return player.cards.find(card => card !== undefined && card.color === color && !this.isTrump(card)) !== undefined;
    }

    playerColorCount(player: Player, color: Color): number {
        return player.cards.reduce((count, card): number => {
            if (card !== undefined && card.color == color && !this.isTrump(card))
                return count + 1;
            return count;
        }, 0);
    }

    playerHasGameAce(player: Player): boolean {
        return player.cards.find(card => card !== undefined && this.isGameAce(card)) !== undefined;
    }

    cardSortRank(card: Card | undefined) {
        if (card === undefined)
            return -1;

        const trumpValue = this.trumpValue(card);
        if (trumpValue !== 0)
            return trumpValue * 64;
        return card.rank.valueOf() + (card.color.valueOf() * 8);
    }

    compare(card1: Card | undefined, card2: Card | undefined) {
        return this.cardSortRank(card2) - this.cardSortRank(card1);
    }
}