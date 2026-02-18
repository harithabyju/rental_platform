const net = require('net');

console.log("diagnose.js started");

const client = new net.Socket();
const startTime = Date.now();

client.setTimeout(2000); // 2 second timeout

client.connect(5432, '127.0.0.1', function () {
    console.log('Connected to 127.0.0.1:5432 - Database IS listening');
    client.destroy();
});

client.on('error', function (err) {
    console.log('Connection Error: ' + err.message);
    // Try localhost if 127.0.0.1 fails
    console.log("Trying localhost...");
    const client2 = new net.Socket();
    client2.setTimeout(2000);
    client2.connect(5432, 'localhost', function () {
        console.log('Connected to localhost:5432 - Database IS listening');
        client2.destroy();
    });
    client2.on('error', (err2) => {
        console.log('Connection Error (localhost): ' + err2.message);
    });
    client2.on('timeout', () => {
        console.log('Connection Timeout (localhost)');
        client2.destroy();
    });
});

client.on('timeout', function () {
    console.log('Connection Timeout (127.0.0.1)');
    client.destroy();
});
