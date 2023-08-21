const query = require('../dbConn');

async function createUser(email, password) {
    const addUserQuery =
    `
    INSERT INTO users (email, password)
    VALUES ($1, $2);
    `
    await query(addUserQuery, [email, password]);
}

async function getUserByEmail(email) {
    const getUserQuery =
    `
    SELECT id, email, password
    FROM users
    WHERE email = $1;
    `;
    const res = await query(getUserQuery, [email]);
    return res.rows[0];
} 

async function getUserById(id) {
    const getUserQuery = 
    `
    SELECT id, email, password
    FROM users
    WHERE id = $1;
    `;   
    const res = await query(getUserQuery, [id]);
    return res.rows[0];
}

module.exports = { createUser, getUserByEmail, getUserById };