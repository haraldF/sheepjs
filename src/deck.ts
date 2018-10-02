import { Card, Color, Rank } from "./card";

export class Deck {
    readonly cards: Array<Card>;

    constructor() {
        this.cards = new Array<Card>();
        for (let color = Color.Bells; color <= Color.Acorns; ++color) {
            for (let rank = Rank.Seven; rank <= Rank.Ace; ++rank) {
                this.cards.push(new Card(color, rank));
            }
        }
    }

    shuffle() {
        Deck.shuffleArray(this.cards);
    }

    static shuffleArray<T>(arr: Array<T>) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
}