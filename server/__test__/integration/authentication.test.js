describe('POST /login' ,() => {
    test.todo('Logging in is successful');
    test.todo('Logging in with unregistered user returns 400')
    test.todo('Logging in with empty params returns 400');
    test.todo("Logging in with missing params returns 400");
});

describe('DELETE /logout' ,() => {
    test.todo('Logging out is successful');
    test.todo('Logging out user who isnt logged in returns 400');
    // test.todo('Logging out with empty params returns 400');
    // test.todo('Logging out with missing params returns 400');
});

describe('GET /authenticated' ,() => {
    test.todo('Returns 204 for user who is authenticated');
    test.todo('Returns 401 for user who is not authenticated');
});