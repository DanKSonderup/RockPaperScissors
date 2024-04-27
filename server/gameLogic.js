
function findWinner(player1value, player2value) {
    let outcomes = {
        RR: -1,
        RP: 1,
        RS: 0,
        PP: -1,
        PR: 0,
        PS: 1,
        SS: -1,
        SR: 1,
        SP: 0,
    };

    return outcomes[player1value + player2value];
}


module.exports = { findWinner };