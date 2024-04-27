function generateRandomID(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomID = '';
    for (let i = 0; i < length; i++) {
        randomID += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return randomID;
}


module.exports = { generateRandomID };