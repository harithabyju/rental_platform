const fs = require('fs');
const out = [];
const log = (...args) => { const s = args.join(' '); console.log(s); out.push(s); };
const err = (...args) => { const s = args.join(' '); console.error(s); out.push('ERROR: ' + s); };

const mods = [
    '../modules/shops/shop.repository',
    '../modules/shops/shop.service',
    '../modules/shops/shop.controller',
    '../modules/shops/shop.routes',
    '../modules/items/item.repository',
    '../modules/items/item.service',
    '../modules/items/item.controller',
    '../modules/items/item.routes',
    '../server',
];

for (const m of mods) {
    try {
        require(m);
        log(`✅ ${m}`);
    } catch(e) {
        err(`❌ ${m}: ${e.message}`);
    }
}

fs.writeFileSync(__dirname + '/server_diag.txt', out.join('\n'));
log('Written to server_diag.txt');
process.exit(0);
