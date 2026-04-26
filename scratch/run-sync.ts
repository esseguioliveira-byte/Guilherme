const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

console.log('DATABASE_URL carregada:', !!process.env.DATABASE_URL);

// Importar dinamicamente para garantir que o dotenv já tenha rodado
async function main() {
  console.log('Executando sincronização de estoque...');
  try {
    const { synchronizeGlobalStock } = await import('../app/actions/stock-sync');
    const result = await synchronizeGlobalStock();
    console.log('Resultado:', result);
  } catch (e) {
    console.error('Erro na execução:', e);
  }
  process.exit(0);
}

main();
