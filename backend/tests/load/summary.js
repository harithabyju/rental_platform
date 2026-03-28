const fs = require('fs');
const path = require('path');

const reportFile = process.argv[2];

if (!reportFile) {
    console.error('Please provide a report JSON file path.');
    process.exit(1);
}

try {
    const data = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
    const aggregate = data.aggregate;
    const counters = aggregate.counters;
    const summaries = aggregate.summaries;

    console.log(`\n=== LOAD TEST SUMMARY: ${path.basename(reportFile)} ===`);
    console.log(`-------------------------------------------`);
    console.log(`VUsers Created:   ${counters['vusers.created'] || 0}`);
    console.log(`VUsers Completed: ${counters['vusers.completed'] || 0}`);
    console.log(`VUsers Failed:    ${counters['vusers.failed'] || 0}`);
    console.log(`-------------------------------------------`);
    
    if (summaries['http.response_time']) {
        const rt = summaries['http.response_time'];
        console.log(`Response Time (ms):`);
        console.log(`  Median: ${rt.median}`);
        console.log(`  p95:    ${rt.p95}`);
        console.log(`  p99:    ${rt.p99}`);
    }

    console.log(`-------------------------------------------`);
    console.log(`HTTP Codes:`);
    Object.keys(counters).filter(k => k.startsWith('http.codes.')).forEach(k => {
        console.log(`  ${k.replace('http.codes.', '')}: ${counters[k]}`);
    });

    const errors = Object.keys(counters).filter(k => k.includes('errors.'));
    if (errors.length > 0) {
        console.log(`-------------------------------------------`);
        console.log(`Errors:`);
        errors.forEach(k => {
            console.log(`  ${k.replace('errors.', '')}: ${counters[k]}`);
        });
    }
    console.log(`===========================================\n`);

} catch (err) {
    console.error('Error reading or parsing report file:', err.message);
}
