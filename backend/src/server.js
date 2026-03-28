const cluster = require('cluster');
const os = require('os');
require('dotenv').config();

const numCPUs = os.cpus().length;

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);

    // Fork workers.
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died. Forking a new one...`);
        cluster.fork();
    });
} else {
    const app = require('./app');
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
        console.log(`Worker ${process.pid} started and listening on port ${PORT}`);
    });
}
