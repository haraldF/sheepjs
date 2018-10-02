import { Hand } from "./hand";

export class GameStack {
    currentHand: Hand;
    readonly hands = new Array<Hand>();

    constructor(firstPlayerIndex: number) {
        this.currentHand = new Hand(firstPlayerIndex);
    }

    finalizeCurrentHand(firstPlayerIndex: number) {
        if (this.currentHand.cards.length !== 4)
            throw new Error("Unable to finalize hand");

        this.hands.push(this.currentHand)
        this.currentHand = new Hand(firstPlayerIndex);
    }

    getPoints(): [number, number, number, number] {
        const points: [number, number, number, number] = [ 0, 0, 0, 0 ];
        for (let hand of this.hands)
            points[hand.winner!] += hand.currentPointValue();
        return points;
    }

    containsCardByPlayer(playerIndex: number): boolean {
        const idx = Math.abs(this.currentHand.firstPlayerIndex - playerIndex) % 4;
        return this.currentHand.cards[idx] !== undefined;
    }
}