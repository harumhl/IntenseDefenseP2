var server=require('node_modules/node-http-server/server/http.js');

console.log(server);

server.deploy(
    {
        verbose: true,
        port: 14487,
        root:__dirname+'../IntenseDefenseP2D1/'
    }
);
