import { synchronizeGlobalStock } from '../app/actions/stock-sync';

async function main() {
  console.log('Starting global stock synchronization...');
  const result = await synchronizeGlobalStock();
  console.log('Result:', result);
}

main().catch(console.error);
