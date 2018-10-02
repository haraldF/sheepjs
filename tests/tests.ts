import { assert } from "chai";
import { GameRules, GameType, GameColor } from "../src/gamerules";
import { Card, Color, Rank } from "../src/card";
import { Player } from "../src/player";

describe("GameRules", function() {
    it("cardSortRank", function() {
        const rules = new GameRules(GameType.Solo, GameColor.Hearts);

        const heartSeven = new Card(Color.Hearts, Rank.Seven);
        const leavesEight = new Card(Color.Leaves, Rank.Eight);

        assert.isAbove(rules.cardSortRank(heartSeven), rules.cardSortRank(leavesEight));

        const deck = [
            new Card(Color.Hearts, Rank.King),
            new Card(Color.Bells,  Rank.Seven),
            new Card(Color.Hearts, Rank.Queen),
            new Card(Color.Bells,  Rank.Ten),
            new Card(Color.Bells,  Rank.Nine),
            new Card(Color.Leaves, Rank.Nine)
        ];

        deck.sort((a, b) => rules.cardSortRank(b) - rules.cardSortRank(a));

        const expected = [
            new Card(Color.Hearts, Rank.Queen),
            new Card(Color.Hearts, Rank.King),
            new Card(Color.Leaves, Rank.Nine),
            new Card(Color.Bells,  Rank.Ten),
            new Card(Color.Bells,  Rank.Nine),
            new Card(Color.Bells,  Rank.Seven)
        ];

        assert.deepEqual(deck, expected);
    });

    it("playerHasGameAce", function() {
        const player = new Player(0);
        player.cards = [
            new Card(Color.Hearts, Rank.King),
            new Card(Color.Bells,  Rank.Seven),
            new Card(Color.Hearts, Rank.Queen),
            new Card(Color.Bells,  Rank.Ten),
            new Card(Color.Bells,  Rank.Ace),
            new Card(Color.Leaves, Rank.Nine)
        ];

        const rules1 = new GameRules(GameType.Sau, GameColor.Leaves);
        assert.isFalse(rules1.playerHasGameAce(player));

        const rules2 = new GameRules(GameType.Sau, GameColor.Bells);
        assert.isTrue(rules2.playerHasGameAce(player));
    });
});
