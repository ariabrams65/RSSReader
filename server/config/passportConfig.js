const localStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');
const db = require('../db/db');

function initialize(passport) {
    const authenticateUser = async (email, password, done) => {
        try {
            const user = await db.getUserByEmail(email);
            if (user === undefined) {
                return done(null, false, { message: 'No user with that email' });
            }
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
        }
    }        
    passport.use(new localStrategy({ usernameField: 'email'}, authenticateUser));
    passport.serializeUser((user, done) => done(null, user.id));
    passport.deserializeUser(async (id, done) => {
        return done(null, await db.getUserById(id));
    });
}

module.exports = initialize;