import { Card } from "./card";

export const enum PlayerNumber {
    First = 0,
    Second = 1,
    Third = 2,
    Fourth = 3
}

export class Player {
    public cards = new Array<Card | undefined>();

    constructor(public position: PlayerNumber) {
    }

    public sortCards(customCompare: (a: Card | undefined, b: Card | undefined) => number) {
        this.cards.sort(customCompare);
    }

    public cardsLeft(): number {
        return this.cards.reduce(((sum, card) => sum += (card === undefined ? 0 : 1)), 0);
    }
}