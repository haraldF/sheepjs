import { Card } from "./card";

export class CardImages {

    constructor(public readonly path: string) {}

    getImage(card: Card): string {
        const colorNames = [
            "schelln",
            "herz",
            "gras",
            "eichel"
        ];
        const rankNames = [
            "7er",
            "8er",
            "9er",
            "Unter",
            "Ober",
            "König",
            "10er",
            "Sau"
        ];

        return `${this.path}/${colorNames[card.color]}${rankNames[card.rank]}.svg`;
    }
}