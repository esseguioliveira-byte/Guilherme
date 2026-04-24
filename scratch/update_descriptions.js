
const { db } = require('./db');
const { products, categories } = require('./db/schema');
const { eq } = require('drizzle-orm');

async function updateDescriptions() {
  try {
    const targetCategoryName = 'CONTA OFFLINE STEAM';
    const newDescription = `🎮 CONTA STEAM • Acesso Digital para PC
🔒 Foco na campanha single-player e modo offline

✅ Sobre o Acesso
Você recebe uma conta Steam já vinculada ao jogo.
✔️ Ativação simples
✔️ Modo offline garantido
✔️ Ideal para quem quer jogar sem interrupções!

🚀 Vantagens Inclusas
💡 1. Entrega Imediata
Receba os dados de login logo após a confirmação do pagamento.

📴 2. Modo Offline Garantido
Jogue a campanha single-player com total estabilidade, sem precisar de internet.

💰 3. Economia Inteligente
A melhor relação custo-benefício para ampliar sua biblioteca no PC.

⚙️ 4. Configuração Rápida
Acompanhe o guia rápido e comece a jogar em poucos minutos.

🕹️ Como Começar
1️⃣ Conclua a compra
Pagamento 100% seguro.

2️⃣ Receba os dados por e-mail
Envio imediato após a confirmação.

3️⃣ Ative o modo offline
Siga o passo a passo incluso.

4️⃣ Aproveite o jogo!
Curta a campanha completa no seu ritmo.

🎯 Perfeito para você se...
🎮 Gosta de jogar campanhas single-player sem distrações
💸 Quer o melhor custo-benefício para jogar no PC
🌐 Não pretende usar o multiplayer online deste jogo`;

    // 1. Find the category
    const categoryList = await db.select().from(categories).where(eq(categories.name, targetCategoryName));
    
    if (categoryList.length === 0) {
      console.log(`Category "${targetCategoryName}" not found.`);
      return;
    }

    const categoryId = categoryList[0].id;
    console.log(`Found category "${targetCategoryName}" with ID: ${categoryId}`);

    // 2. Update products
    const result = await db.update(products)
      .set({ description: newDescription })
      .where(eq(products.categoryId, categoryId));

    console.log(`Updated products in category "${targetCategoryName}".`);
  } catch (error) {
    console.error('Error updating descriptions:', error);
  } finally {
    process.exit();
  }
}

updateDescriptions();
