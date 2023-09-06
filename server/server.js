const Bree = require('bree');
app =  require('./app');

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