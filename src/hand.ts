import { Card } from "./card";

export class Hand {
    readonly cards = new Array<Card>();
    winner?: number = undefined;
    winningCardIndex?: number = undefined

    constructor(public readonly firstPlayerIndex: number) {}

    currentPointValue(): number {
        let sum = 0;
        for (let card of this.cards) {
            sum += card.pointValue();
        }
        return sum
    }
}