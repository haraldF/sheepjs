import { PlayerNumber, Player } from "./player";
import { GameRules } from "./gamerules";
import { Hand } from "./hand";

export class AiPlayer extends Player {

    constructor(position: PlayerNumber) {
        super(position);
    }

    playCard(gameRules: GameRules, currentHand: Hand): number {

        for (let i = 0; i < this.cards.length; ++i) {
            const card = this.cards[i];
            if (card !== undefined && gameRules.isCardAllowed(card, currentHand, this))
                return i;
        }

        throw new Error("No playable card");
    }
}