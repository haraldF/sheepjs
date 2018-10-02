export enum Color {
    Bells = 0,
    Hearts = 1,
    Leaves = 2,
    Acorns = 3
}

export enum Rank {
    Seven = 0,
    Eight = 1,
    Nine = 2,
    Jack = 3,
    Queen = 4,
    King = 5,
    Ten = 6,
    Ace = 7
}

export class Card {
    private static readonly pointValues = [ 0, 0, 0, 2, 3, 4, 10, 11 ];

    constructor(public readonly color: Color, public readonly rank: Rank) {}

    pointValue(): number {
        return Card.pointValues[this.rank];
    }

    description(): string {
        return `${Color[this.color]} ${Rank[this.rank]}`;
    }

    isEqual(other: Card): boolean {
        return this.color === other.color && this.rank === other.rank;
    }

    hash(): number {
        return this.color * 8 + this.rank;
    }
}
