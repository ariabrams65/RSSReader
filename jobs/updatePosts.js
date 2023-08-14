const Client = require('pg').Client;
const client = new Client();

async function updatePosts() {
}

//Should I await this???
//When does the worker thread get removed??? 
updatePosts()