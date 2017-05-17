'use strict'

const hapi = require('hapi')
const server = new hapi.Server()

const port = 3000
const host = 'localhost'
server.connection({ port : port , host : host , labels: ['app'] })
//server.connection({ port : 3000 , host : host , labels: ['chat'] })

var visitorsData = []

server.register(require('inert'), (err) => {

})


server.register(require('vision'), (err) => {
    server.views({
        engines: {
            html: require('handlebars')
        }
    });
})


server.route({
    method: 'GET',
    path: '/',
    handler: function (request, reply) {
        reply.file('./frontend/index.html');
    }
});

server.route({
    method: 'GET',
    path: '/about',
    handler: function (request, reply) {
        reply.file('./frontend/index.html');
    }
});

server.route({
    method: 'GET',
    path: '/contact',
    handler: function (request, reply) {
        reply.file('./frontend/index.html');
    }
});

server.route({
    method: 'GET',
    path: '/dashboard',
    handler: function (request, reply) {
        reply.file('./frontend/dashboard.html');
    }
});


server.route({
    method: 'GET',
    path: '/socket.io/socket.io.js',
    handler: function(request,reply){
         reply.file('./node_modules/socket.io-client/dist/socket.io.js');
    }
});

server.route({
    method: 'GET',
    path: '/{param*}',
    handler: {
        directory: {
            path: './frontend',
            redirectToSlash: true,
            index: true
        }
    }
});

const io = require('socket.io')( server.select('app').listener )

io.on('connection', function (socket) {

    console.log( socket.handshake.headers.referer )
    if (socket.handshake.headers.referer.indexOf('/dashboard') > -1) {
    // if someone visits '/dashboard' send them the computed visitor data
        io.emit('updated-stats', computeStats());
    }

    socket.on('visitor-data', function(data) {
        visitorsData[socket.id] = data;
        io.emit('updated-stats', computeStats())
    })

    socket.on('disconnect', function() {
        delete visitorsData[socket.id];
        io.emit('updated-stats', computeStats())
    })

})
/*
io.on( 'connection')
    .then( (socket) => {
    
        socket.emit('connected !!')

        socket.on('visitor-data', function(data) {
            visitorsData[socket.id] = data;
            io.emit('updated-stats', computeStats())
        })

        socket.on('disconnect', function() {
            delete visitorsData[socket.id];
            io.emit('updated-stats', computeStats())
        })

    } )
    .catch( (err) => { console.err( err ); process.exit() } )
*/

function computeStats(){
    console.log( computePageCounts() , computeRefererCounts() , getActiveUsers() )
  return {
    pages: computePageCounts(),
    referrers: computeRefererCounts(),
    activeUsers: getActiveUsers()
  };
}


function computePageCounts() {
  // sample data in pageCounts object:
  // { "/": 13, "/about": 5 }
  var pageCounts = {};
  for (var key in visitorsData) {
    var page = visitorsData[key].page;
    if (page in pageCounts) {
      pageCounts[page]++;
    } else {
      pageCounts[page] = 1;
    }
  }
  return pageCounts;
}

function computeRefererCounts() {
  // sample data in referrerCounts object:
  // { "http://twitter.com/": 3, "http://stackoverflow.com/": 6 }
  var referrerCounts = {};
  for (var key in visitorsData) {
    var referringSite = visitorsData[key].referringSite || '(direct)';
    if (referringSite in referrerCounts) {
      referrerCounts[referringSite]++;
    } else {
      referrerCounts[referringSite] = 1;
    }
  }
  return referrerCounts;
}

function getActiveUsers() {
  return Object.keys(visitorsData).length;
}



server.start()
    .then( () => console.log(`Server running at: ${server.info.uri}`) )
    .catch( (err) => { console.err( err ); process.exit() } )
