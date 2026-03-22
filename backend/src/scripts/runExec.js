const { execSync } = require('child_process');
try {
  const result = execSync('node c:/Users/priya/OneDrive/Desktop/rental_platform/backend/src/scripts/testAdminQueries.js', { encoding: 'utf-8' });
  console.log("OUT:::", result);
} catch (e) {
  console.log("ERR:::", e.stdout, e.stderr);
}
