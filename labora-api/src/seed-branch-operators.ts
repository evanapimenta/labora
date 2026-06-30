import dotenv from 'dotenv';
import path from 'path';
import mongoose from 'mongoose';
import Admin from './models/Admin';
import Branch from './models/Branch';

dotenv.config();

async function runSeed() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("MONGODB_URI não encontrado no arquivo .env");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Conectado ao MongoDB!");

  try {
    // 1. Buscar todas as filiais ativas
    const branches = await Branch.find({ status: 'Ativa' }).lean() as any[];
    console.log(`Encontradas ${branches.length} filiais ativas.`);

    // 2. Buscar todos os operadores técnicos ativos
    const operators = await Admin.find({ scope: 'TECH', status: 'Ativo' }) as any[];
    console.log(`Encontrados ${operators.length} operadores com scope TECH ativos.`);

    if (operators.length < 2) {
      console.error("Erro: Menos de 2 operadores TECH ativos no banco de dados para distribuir.");
      await mongoose.disconnect();
      return;
    }

    // 3. Garantir que cada filial tenha pelo menos 2 operadores
    for (const branch of branches) {
      const branchIdStr = String(branch._id);

      // Encontrar quais dos operadores já estão atribuídos a esta filial
      let assignedOperators = operators.filter(o => 
        o.assignedTo && o.assignedTo.some((id: any) => String(id) === branchIdStr)
      );

      console.log(`Filial "${branch.name}" atualmente tem ${assignedOperators.length} operadores.`);

      // Se tiver menos de 2, precisamos atribuir mais
      if (assignedOperators.length < 2) {
        const needed = 2 - assignedOperators.length;
        console.log(`-> Atribuindo mais ${needed} operadores para a filial "${branch.name}"...`);

        // Encontrar operadores ativos que ainda não estão nesta filial, ordenando pelos que têm menos atribuições
        let candidates = operators.filter(o => 
          !o.assignedTo || !o.assignedTo.some((id: any) => String(id) === branchIdStr)
        );

        // Ordenar candidatos pelo número de filiais que já estão atribuídos (menor primeiro) para balancear
        candidates.sort((a, b) => (a.assignedTo?.length || 0) - (b.assignedTo?.length || 0));

        for (let i = 0; i < needed; i++) {
          const operatorToAssign = candidates[i];
          if (!operatorToAssign) break;

          if (!operatorToAssign.assignedTo) {
            operatorToAssign.assignedTo = [];
          }
          operatorToAssign.assignedTo.push(branch._id);
          
          // Atualizar no banco de dados
          await Admin.findByIdAndUpdate(operatorToAssign._id, {
            assignedTo: operatorToAssign.assignedTo
          });

          console.log(`   Assigned operator "${operatorToAssign.name}" to branch "${branch.name}"`);
        }
      }
    }

    // 4. Verificação final
    console.log("\n--- VERIFICAÇÃO FINAL ---");
    const updatedBranches = await Branch.find({ status: 'Ativa' }).lean() as any[];
    for (const b of updatedBranches) {
      const bIdStr = String(b._id);
      const ops = await Admin.find({ scope: 'TECH', status: 'Ativo', assignedTo: b._id }).select('name').lean();
      console.log(`Filial: "${b.name}" | Operadores Atribuídos (${ops.length}): ${ops.map(o => o.name).join(', ')}`);
    }

    console.log("\n✅ Seed concluído com sucesso!");
  } catch (error) {
    console.error("Erro durante o seed:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado do MongoDB.");
  }
}

runSeed();
