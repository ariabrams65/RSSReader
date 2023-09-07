const db = require("../../db/db");
const request = require('supertest');
const { getNumRows } = require("./utils/dbHelpers");
const app = require("../../app");

beforeEach(async () => {
    await db.resetTables();
});

describe('POST /register' ,() => {
    test('Registering is successful', async () => {
        expect(await getNumRows('users')).toBe(0);
        const res = await request(app)
            .post('/register')
            .send({email: "test@test", password: 'test'});
        expect(res.statusCode).toBe(201);
        expect(await getNumRows('users')).toBe(1);
    }); 

    test('Duplicate email should respond with 400', async () => {
        await request(app)
            .post('/register')
            .send({email: "test@test", password: 'test'});
        expect(await getNumRows('users')).toBe(1);

        const res = await request(app)
            .post('/register')
            .send({email: "test@test", password: 'test2'});
        expect(res.statusCode).toBe(400);
        expect(await getNumRows('users')).toBe(1);
    });

    test('Empty params should respond with 400', async () => {
        const res = await request(app)
            .post('/register')
            .send({email: '', password: ''});
        expect(res.statusCode).toBe(400);
    });

    test('Missing params should respond with 400', async () => {
        const res = await request(app)
            .post('/register');
        expect(res.statusCode).toBe(400);
    });
});