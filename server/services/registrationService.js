const { UserError } = require('../customErrors');
const bcrypt = require('bcrypt');
const db = require('../db/db');

async function createUser(email, password) {
    if (await db.userExists(email)) {
        throw new UserError('User already exists');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.createUser(email, hashedPassword); 
}

module.exports = { createUser };