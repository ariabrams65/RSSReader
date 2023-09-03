if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const tableQueries = require('./db/queries/tableQueries');
const Bree = require('bree');
app =  require('./app');

tableQueries.createTables();

const bree = new Bree({
    jobs: [{
        name: 'updatePosts',
        cron: '*/10 * * * *'
    }]
});
(async () => {
    await bree.start();
})();

bree.on('worker created', (name) => {
    console.log('worker created', name);
});
bree.on('worker deleted', (name) => {
    console.log('worker deleted', name);
});

app.listen(5000);