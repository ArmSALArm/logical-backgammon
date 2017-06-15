var model = require('../model.js');
var Rule = require('./AbstractRule.js');

/**
 * One of the less popular variants of backgammon in Bulgaria (гюлбара).
 * @constructor
 * @extends Rule
 */
function RuleAmLongBackgammon() {
    Rule.call(this);

    /**
     * Rule name, matching the class name (eg. 'RuleAmLongBackgammon')
     * @type {string}
     */
    this.name = 'RuleAmLongBackgammon';

    /**
     * Short title describing rule specifics
     * @type {string}
     */
    this.title = 'Long Backgammon';

    /**
     * Full description of rule
     * @type {string}
     */
    this.description = 'One of the less popular variants of backgammon in Armenia.';

    /**
     * Full name of country where this rule (variant) is played.
     * To list multiple countries use a pipe ('|') character as separator.
     * @type {string}
     */
    this.country = 'Armenia';

    /**
     * Two character ISO code of country where this rule (variant) is played.
     * To list multiple codes use a pipe ('|') character as separator.
     * List codes in same order as countries in the field above.
     * @type {string}
     */
    this.countryCode = 'am';

    /**
     * Descendents should list all action types that are allowed in this rule.
     * @type {MoveActionType[]}
     */
    this.allowedActions = [
        model.MoveActionType.MOVE,
        model.MoveActionType.BEAR
    ];
}

RuleAmLongBackgammon.prototype = Object.create(Rule.prototype);
RuleAmLongBackgammon.prototype.constructor = RuleAmLongBackgammon;

/**
 * Reset state to initial position of pieces according to current rule.
 * @memberOf RuleAmLongBackgammon
 * @param {State} state - Board state
 */
RuleAmLongBackgammon.prototype.resetState = function(state) {
    /**
     * Move pieces to correct initial positions for both players.
     * Values in state.points are zero based and denote the .
     * the number of pieces on each position.
     * Index 0 of array is position 1 and increments to the number of maximum
     * points.
     *
     * Position: |12 13 14 15 16 17| |18 19 20 21 22 23|
     *           |                 | |              15w| <-
     *           |                 | |                 |
     *           |                 | |                 |
     *           |                 | |                 |
     *        -> |15b              | |                 |
     * Position: |11 10 09 08 07 06| |05 04 03 02 01 00|
     *
     */


    model.State.clear(state);

    this.place(state, 15, model.PieceType.WHITE, 23);

    this.place(state, 15, model.PieceType.BLACK, 11);
};

/**
 * Increment position by specified number of steps and return an incremented position
 * @memberOf RuleAmLongBackgammon
 * @param {number} position - Denormalized position
 * @param {PieceType} type - Type of piece
 * @param {number} steps - Number of steps to increment towards first home position
 * @returns {number} - Incremented position (denormalized)
 */
RuleAmLongBackgammon.prototype.incPos = function(position, type, steps) {
    var newPosition;
    if (type === model.PieceType.WHITE) {
        newPosition = position - steps;
    }
    else {
        newPosition = position - steps;
        if ((position < 12) && (newPosition < 0)) {
            newPosition = 24 + newPosition;
        }
        else if ((position >= 12) && (newPosition <= 11)) {
            newPosition = newPosition - 12;
        }
    }

    console.log('New pos:', position, newPosition, steps);

    return newPosition;
};

/**
 * Normalize position - Normalized positions start from 0 to 23 for both players,
 * where 0 is the first position in the home part of the board, 6 is the last
 * position in the home part and 23 is the furthest position - in the opponent's
 * home.
 * @memberOf RuleAmLongBackgammon
 * @param {number} position - Denormalized position (0 to 23 for white and 12 to 11 for black)
 * @param {PieceType} type - Type of piece (white/black)
 * @returns {number} - Normalized position (0 to 23 for both players)
 */
RuleAmLongBackgammon.prototype.normPos = function(position, type) {
    var normPosition = position;

    if (type === model.PieceType.BLACK) {
        if (position < 0) {
            normPosition = position;
        }
        else if (position >= 12) {
            normPosition = position - 12;
        }
        else {
            normPosition = position + 12;
        }
    }
    return normPosition;
};

/**
 * Get denormalized position - start from 0 to 23 for white player and from
 * 12 to 11 for black player.
 * @memberOf RuleAmLongBackgammon
 * @param {number} position - Normalized position (0 to 23 for both players)
 * @param {PieceType} type - Type of piece (white/black)
 * @return {number} - Denormalized position (0 to 23 for white and 12 to 11 for black)
 */
RuleAmLongBackgammon.prototype.denormPos = function(position, type) {
    var denormPosition = position;

    if (type === model.PieceType.BLACK) {
        if (position < 0) {
            denormPosition = position;
        }
        else if (position >= 12) {
            denormPosition = position - 12;
        }
        else {
            denormPosition = position + 12;
        }
    }
    return denormPosition;
};

/**
 * Call this method after a request for moving a piece has been made.
 * Determines if the move is allowed and what actions will have to be made as
 * a result. Actions can be `move`, `place`, `hit` or `bear`.
 *
 * If move is allowed or not depends on the current state of the game. For example,
 * if the player has pieces on the bar, they will only be allowed to place pieces.
 *
 * Multiple actions can be returned, if required. Placing (or moving) a piece over
 * an opponent's blot will result in two actions: `hit` first, then `place` (or `move`).
 *
 * The list of actions returned would usually be appllied to game state and then
 * sent to client. The client's UI would play the actions (eg. with movement animation)
 * in the same order.
 *
 * @memberOf RuleAmLongBackgammon
 * @param {State} state - State
 * @param {Piece} piece - Piece to move
 * @param {PieceType} type - Type of piece
 * @param {number} steps - Number of steps to increment towards first home position
 * @returns {MoveAction[]} - List of actions if move is allowed, empty list otherwise.
 */
RuleAmLongBackgammon.prototype.getMoveActions = function(state, piece, steps) {
    var actionList = [];

    // Next, check conditions specific to this game rule and build the list of
    // actions that has to be made.

    /**
     * Create a new move action and add it to actionList. Used internally.
     *
     * @alias RuleAmLongBackgammon.getMoveActions.addAction
     * @memberof RuleAmLongBackgammon.getMoveActions
     * @method RuleAmLongBackgammon.getMoveActions.addAction
     * @param {MoveActionType} moveActionType - Type of move action (eg. move, hit, bear)
     * @param {Piece} piece - Piece to move
     * @param {number} from - Denormalized source position. If action uses only one position parameter, this one is used.
     * @param {number} to - Denormalized destination position.
     * @returns {MoveAction}
     * @see {@link getMoveActions} for more information on purpose of move actions.
     */
    function addAction(moveActionType, piece, from, to) {
        var action = new model.MoveAction();
        action.type = moveActionType;
        action.piece = piece;
        action.position = from;
        action.from = from;
        if (typeof to !== "undefined") {
            action.to = to;
        }
        actionList.push(action);
        return action;
    }

    // TODO: Catch exceptions due to disallowed move requests and pass them as error message to the client.
    try {
        var position = model.State.getPiecePos(state, piece);

        // TODO: Consider using state machine? Is it worth, can it be useful in other methods too?
        if (this.allPiecesAreHome(state, piece.type)) {
          /*
           If all pieces are in home field, the player can bear pieces
           Cases:
           - Normalized position >= 0 --> Just move the piece
           - Normalized position === -1 --> Bear piece
           - Normalized position < -1 --> Bear piece, only if there are no player pieces at higher positions

           +12-13-14-15-16-17------18-19-20-21-22-23-+
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |    O  O          |
           |                  |   | O  O  O          |
           +11-10--9--8--7--6-------5--4--3--2--1--0-+ -1

           */
            var destination = this.incPos(position, piece.type, steps);
            var normDestination = this.normPos(destination, piece.type);

            // Move the piece, unless point is blocked by opponent
            if (normDestination >= 0) {

                var destTopPiece = model.State.getTopPiece(state, destination);
                var destTopPieceType = (destTopPiece) ? destTopPiece.type : null;

                // There are no pieces at this point or the top piece is owned by player,
                // so just move piece to that position
                if ((destTopPieceType === null) || (destTopPieceType === piece.type)) {
                    addAction(
                        model.MoveActionType.MOVE, piece, position, destination
                    );
                }
            }
            // If steps are just enought to reach position -1, bear piece
            else if (normDestination === -1) {
                addAction(
                    model.MoveActionType.BEAR, piece, position
                );
            }
            // If steps move the piece beyond -1 position, the player can bear the piece,
            // only if there are no other pieces at higher positions
            else {
                var normSource = this.normPos(position, piece.type);
                if (this.countAtHigherPos(state, normSource + 1, piece.type) <= 0) {
                    addAction(
                        model.MoveActionType.BEAR, piece, position
                    );
                }
            }
        }
        else {
          /*
           If there are no pieces at bar, and at least one piece outside home,
           just move the piece.
           Input data: position=13, steps=3
           Cases:
           - Opponent has one or more pieces --> point is blocked, cannot place piece there
           - Opponent has no pieces there
                Cases:
                -piece is block last place of side and not allow opponent go to finish
                    Cases:
                    -opponent have a piece('s) which are passed blocked side --> point is blocked, cannot place piece there
                --> place the checker at position 10
           !
           +12-13-14-15-16-17------18-19-20-21-22-23-+
           |    O             |   | X                |
           |    O             |   | X                |
           |                  |   | X                |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |                  |
           |                  |   |       O          |
           |                  |   | O  O  O          |
           +11-10--9--8--7--6-------5--4--3--2--1--0-+ -1
           !
           */

            var destination = this.incPos(position, piece.type, steps);

            // Make sure that destination is within board
            if ((destination >= 0) && (destination <= 23)) {
                var normDest = this.normPos(destination, piece.type);
                // TODO: Make sure position is not outside board

                var destTopPiece = model.State.getTopPiece(state, destination);
                var destTopPieceType = (destTopPiece) ? destTopPiece.type : null;

                // There are no pieces at this point or the top piece is owned by player
                if ((destTopPieceType === null) || (destTopPieceType === piece.type)) {
                    addAction(
                        model.MoveActionType.MOVE, piece, position, destination
                    );
                }
            }
        }
    }
    catch (e) {
        actionList = [];
        return actionList;
    }

    return actionList;
};

/**
 * Mark move as played
 * @memberOf RuleAmLongBackgammon
 * @abstract
 * @param {Game} game - Game
 * @param {number} move - Move (number of steps)
 * @returns {boolean} - True if piece was moved/borne/recovered
 */
RuleAmLongBackgammon.prototype.markAsPlayed = function (game, move) {
    // Once a piece is moved, consider that the turn has been started.
    // This flag is used when the player cannot play all moves.
    // Remaining moves are tranfered to other player, only if
    // the turn has been started.
    game.turnStarted = true;
    Rule.prototype.markAsPlayed.call(this, game, move);
};

module.exports = new RuleAmLongBackgammon();