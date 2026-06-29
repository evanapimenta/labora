/**
 * seed-branches-sp.ts
 * Atualiza as filiais existentes: adiciona lat/lng, endereço real e nome correto
 * para municípios da Grande São Paulo (mínimo 3 por cidade).
 *
 * Cidades: São Paulo (6), Barueri (3), Carapicuíba (3), Cotia (3),
 *          Osasco (3), Jandira (3), Taboão da Serra (3), Santana de Parnaíba (3)
 *
 * Uso: npx ts-node src/seed-branches-sp.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function run() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error('MONGODB_URI não encontrada no .env');

  await mongoose.connect(uri);
  console.log('Conectado ao MongoDB');

  const db = mongoose.connection.db!;
  const col = db.collection('branches');

  // ─── Mapeamento: _id existente → dados novos ─────────────────────────────

  const updates: Array<{ id: string; name: string; address: object; email: string; phoneNumber: string }> = [

    // ── SÃO PAULO (6 filiais) ────────────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d0be',
      name: 'Biocentro Central - Filial São Paulo Centro',
      email: 'filial.centro@biocentro.com.br',
      phoneNumber: '11910018001',
      address: {
        street: 'Praça da Sé', number: '107', complement: 'Sala 12',
        neighborhood: 'Sé', city: 'São Paulo', state: 'SP',
        zipCode: '01001000', country: 'Brasil',
        latitude: -23.5506507, longitude: -46.6333824
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0ee',
      name: "D'Or Exame - Filial São Paulo Paulista",
      email: 'filial.paulista@dorexame.com.br',
      phoneNumber: '11910018002',
      address: {
        street: 'Avenida Paulista', number: '1578', complement: 'Andar 8',
        neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP',
        zipCode: '01310100', country: 'Brasil',
        latitude: -23.5618659, longitude: -46.6561867
      }
    },
    {
      id: '6a29efb9851896bd4bb6d11e',
      name: 'LabMais Análises - Filial São Paulo Pinheiros',
      email: 'filial.pinheiros@labmais.com.br',
      phoneNumber: '11910018003',
      address: {
        street: 'Rua dos Pinheiros', number: '810', complement: '',
        neighborhood: 'Pinheiros', city: 'São Paulo', state: 'SP',
        zipCode: '05422010', country: 'Brasil',
        latitude: -23.5659927, longitude: -46.6780136
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0f1',
      name: 'LabVida - Filial São Paulo Tatuapé',
      email: 'filial.tatuape@labvida.com.br',
      phoneNumber: '11910018004',
      address: {
        street: 'Rua Tuiuti', number: '2400', complement: '',
        neighborhood: 'Tatuapé', city: 'São Paulo', state: 'SP',
        zipCode: '03081000', country: 'Brasil',
        latitude: -23.5388889, longitude: -46.5772222
      }
    },
    {
      id: '6a29efb9851896bd4bb6d115',
      name: 'São Lucas - Filial São Paulo Santo André',
      email: 'filial.stoandre@saolucas.com.br',
      phoneNumber: '11910018005',
      address: {
        street: 'Rua das Figueiras', number: '300', complement: '',
        neighborhood: 'Vila Bastos', city: 'São Paulo', state: 'SP',
        zipCode: '09020180', country: 'Brasil',
        latitude: -23.6638, longitude: -46.5272
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0c1',
      name: 'São Lucas - Filial São Paulo Mooca',
      email: 'filial.mooca@saolucas.com.br',
      phoneNumber: '11910018006',
      address: {
        street: 'Rua da Mooca', number: '1450', complement: '',
        neighborhood: 'Mooca', city: 'São Paulo', state: 'SP',
        zipCode: '03103001', country: 'Brasil',
        latitude: -23.5491, longitude: -46.5993
      }
    },

    // ── BARUERI (3 filiais) ──────────────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d0d6',
      name: 'Alpha - Filial Barueri Alphaville',
      email: 'filial.alphaville@alpha.com.br',
      phoneNumber: '11910018007',
      address: {
        street: 'Alameda Rio Negro', number: '500', complement: 'Sala 101',
        neighborhood: 'Alphaville', city: 'Barueri', state: 'SP',
        zipCode: '06454000', country: 'Brasil',
        latitude: -23.4997, longitude: -46.8497
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0dc',
      name: 'Bioclínico - Filial Barueri Centro',
      email: 'filial.barueri@bioclinico.com.br',
      phoneNumber: '11910018008',
      address: {
        street: 'Rua Cel. Raul Goulart', number: '275', complement: '',
        neighborhood: 'Jardim Belval', city: 'Barueri', state: 'SP',
        zipCode: '06401040', country: 'Brasil',
        latitude: -23.5104, longitude: -46.8760
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0d9',
      name: 'LabClin Exames - Filial Barueri Tamboré',
      email: 'filial.tamboré@labclin.com.br',
      phoneNumber: '11910018009',
      address: {
        street: 'Rua Inácio Pinto dos Santos', number: '38', complement: '',
        neighborhood: 'Tamboré', city: 'Barueri', state: 'SP',
        zipCode: '06460040', country: 'Brasil',
        latitude: -23.4839, longitude: -46.8362
      }
    },

    // ── CARAPICUÍBA (3 filiais) ──────────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d106',
      name: 'Bioclínico - Filial Carapicuíba Centro',
      email: 'filial.carapicuiba@bioclinico.com.br',
      phoneNumber: '11910018010',
      address: {
        street: 'Rua Presidente Vargas', number: '155', complement: '',
        neighborhood: 'Centro', city: 'Carapicuíba', state: 'SP',
        zipCode: '06320100', country: 'Brasil',
        latitude: -23.5228, longitude: -46.8356
      }
    },
    {
      id: '6a29efb9851896bd4bb6d109',
      name: 'ProExame Laboratório - Filial Carapicuíba Cohab',
      email: 'filial.cohab@proexame.com.br',
      phoneNumber: '11910018011',
      address: {
        street: 'Avenida Deputado Emílio Carlos', number: '1000', complement: '',
        neighborhood: 'Cohab', city: 'Carapicuíba', state: 'SP',
        zipCode: '06315010', country: 'Brasil',
        latitude: -23.5309, longitude: -46.8451
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0f4',
      name: 'LabMais Análises - Filial Carapicuíba Vila Menck',
      email: 'filial.vilamenck@labmais.com.br',
      phoneNumber: '11910018012',
      address: {
        street: 'Rua João Pessoa', number: '500', complement: '',
        neighborhood: 'Vila Menck', city: 'Carapicuíba', state: 'SP',
        zipCode: '06330190', country: 'Brasil',
        latitude: -23.5151, longitude: -46.8292
      }
    },

    // ── COTIA (3 filiais) ────────────────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d103',
      name: 'LabClin Exames - Filial Cotia Centro',
      email: 'filial.cotia@labclin.com.br',
      phoneNumber: '11910018013',
      address: {
        street: 'Rua Quinze de Novembro', number: '300', complement: '',
        neighborhood: 'Centro', city: 'Cotia', state: 'SP',
        zipCode: '06705060', country: 'Brasil',
        latitude: -23.6035, longitude: -46.9197
      }
    },
    {
      id: '6a29efb9851896bd4bb6d12d',
      name: 'LabClin Exames - Filial Cotia Granja Viana',
      email: 'filial.granjaviana@labclin.com.br',
      phoneNumber: '11910018014',
      address: {
        street: 'Estrada Velha de Itu', number: '1500', complement: '',
        neighborhood: 'Granja Viana', city: 'Cotia', state: 'SP',
        zipCode: '06711250', country: 'Brasil',
        latitude: -23.5851, longitude: -46.8940
      }
    },
    {
      id: '6a29efb9851896bd4bb6d130',
      name: 'Bioclínico - Filial Cotia Caucaia',
      email: 'filial.caucaia@bioclinico.com.br',
      phoneNumber: '11910018015',
      address: {
        street: 'Estrada do Rio Cotia', number: '200', complement: '',
        neighborhood: 'Caucaia do Alto', city: 'Cotia', state: 'SP',
        zipCode: '06718120', country: 'Brasil',
        latitude: -23.6367, longitude: -46.9574
      }
    },

    // ── OSASCO (3 filiais) ───────────────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d0ca',
      name: 'LabMais Análises - Filial Osasco Centro',
      email: 'filial.osasco@labmais.com.br',
      phoneNumber: '11910018016',
      address: {
        street: 'Rua Antônio Agu', number: '450', complement: '',
        neighborhood: 'Centro', city: 'Osasco', state: 'SP',
        zipCode: '06010010', country: 'Brasil',
        latitude: -23.5328, longitude: -46.7919
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0cd',
      name: 'Santa Maria - Filial Osasco Km 18',
      email: 'filial.km18@santamaria.com.br',
      phoneNumber: '11910018017',
      address: {
        street: 'Avenida dos Autonomistas', number: '1800', complement: '',
        neighborhood: 'Vila Yara', city: 'Osasco', state: 'SP',
        zipCode: '06030100', country: 'Brasil',
        latitude: -23.5234, longitude: -46.7770
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0d0',
      name: 'Diagnósticos do Sul - Filial Osasco Bela Vista',
      email: 'filial.belavista@diagnosticossul.com.br',
      phoneNumber: '11910018018',
      address: {
        street: 'Rua Cipriano Barata', number: '120', complement: '',
        neighborhood: 'Bela Vista', city: 'Osasco', state: 'SP',
        zipCode: '06018010', country: 'Brasil',
        latitude: -23.5411, longitude: -46.8012
      }
    },

    // ── JANDIRA (3 filiais) ──────────────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d0e2',
      name: 'Cura - Filial Jandira Centro',
      email: 'filial.jandira@cura.com.br',
      phoneNumber: '11910018019',
      address: {
        street: 'Avenida Brasil', number: '550', complement: '',
        neighborhood: 'Centro', city: 'Jandira', state: 'SP',
        zipCode: '06612010', country: 'Brasil',
        latitude: -23.5281, longitude: -46.9023
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0e5',
      name: 'BioAnálise Labs - Filial Jandira Parque São George',
      email: 'filial.jandira@bioanalise.com.br',
      phoneNumber: '11910018020',
      address: {
        street: 'Rua das Palmeiras', number: '210', complement: '',
        neighborhood: 'Parque São George', city: 'Jandira', state: 'SP',
        zipCode: '06614100', country: 'Brasil',
        latitude: -23.5340, longitude: -46.9105
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0e8',
      name: 'Biocentro Central - Filial Jandira Vila Pavan',
      email: 'filial.vilapavan@biocentro.com.br',
      phoneNumber: '11910018021',
      address: {
        street: 'Rua Joaquim Nabuco', number: '80', complement: '',
        neighborhood: 'Vila Pavan', city: 'Jandira', state: 'SP',
        zipCode: '06615080', country: 'Brasil',
        latitude: -23.5218, longitude: -46.9140
      }
    },

    // ── TABOÃO DA SERRA (3 filiais) ──────────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d0eb',
      name: 'São Lucas - Filial Taboão da Serra Centro',
      email: 'filial.taboao@saolucas.com.br',
      phoneNumber: '11910018022',
      address: {
        street: 'Rua Benedito Prado de Arruda', number: '130', complement: '',
        neighborhood: 'Centro', city: 'Taboão da Serra', state: 'SP',
        zipCode: '06763010', country: 'Brasil',
        latitude: -23.6096, longitude: -46.7542
      }
    },
    {
      id: '6a29efb9851896bd4bb6d0f7',
      name: 'Santa Maria - Filial Taboão da Serra Jardim Boa Vista',
      email: 'filial.taboao@santamaria.com.br',
      phoneNumber: '11910018023',
      address: {
        street: 'Estrada de Itapecerica', number: '2230', complement: '',
        neighborhood: 'Jardim Boa Vista', city: 'Taboão da Serra', state: 'SP',
        zipCode: '06762170', country: 'Brasil',
        latitude: -23.6173, longitude: -46.7460
      }
    },
    {
      id: '6a29efb9851896bd4bb6d100',
      name: 'Alpha - Filial Taboão da Serra Jardim Monte Alegre',
      email: 'filial.montealegre@alpha.com.br',
      phoneNumber: '11910018024',
      address: {
        street: 'Rua Clovis Graciano', number: '400', complement: '',
        neighborhood: 'Jardim Monte Alegre', city: 'Taboão da Serra', state: 'SP',
        zipCode: '06766120', country: 'Brasil',
        latitude: -23.6020, longitude: -46.7620
      }
    },

    // ── SANTANA DE PARNAÍBA (3 filiais) ─────────────────────────────────────
    {
      id: '6a29efb9851896bd4bb6d10c',
      name: 'Cura - Filial Santana de Parnaíba Alphaville',
      email: 'filial.parnaiba@cura.com.br',
      phoneNumber: '11910018025',
      address: {
        street: 'Alameda Araguaia', number: '900', complement: 'Sala 5',
        neighborhood: 'Alphaville', city: 'Santana de Parnaíba', state: 'SP',
        zipCode: '06543001', country: 'Brasil',
        latitude: -23.4682, longitude: -46.8656
      }
    },
    {
      id: '6a29efb9851896bd4bb6d10f',
      name: 'BioAnálise Labs - Filial Santana de Parnaíba Centro',
      email: 'filial.parnaiba@bioanalise.com.br',
      phoneNumber: '11910018026',
      address: {
        street: 'Rua São Bento', number: '55', complement: '',
        neighborhood: 'Centro Histórico', city: 'Santana de Parnaíba', state: 'SP',
        zipCode: '06500000', country: 'Brasil',
        latitude: -23.4444, longitude: -46.9171
      }
    },
    {
      id: '6a29efb9851896bd4bb6d112',
      name: 'Biocentro Central - Filial Santana de Parnaíba Chácaras',
      email: 'filial.chacaras@biocentro.com.br',
      phoneNumber: '11910018027',
      address: {
        street: 'Estrada Tenente Marques', number: '350', complement: '',
        neighborhood: 'Chácara Recreio Alvorada', city: 'Santana de Parnaíba', state: 'SP',
        zipCode: '06510020', country: 'Brasil',
        latitude: -23.4591, longitude: -46.9012
      }
    },
  ];

  // ─── Executa os updates ───────────────────────────────────────────────────

  let updated = 0;
  let failed = 0;

  for (const u of updates) {
    try {
      const result = await col.updateOne(
        { _id: new mongoose.Types.ObjectId(u.id) },
        {
          $set: {
            name: u.name,
            email: u.email,
            phoneNumber: u.phoneNumber,
            address: u.address,
          }
        }
      );

      if (result.matchedCount === 0) {
        console.warn(`  ⚠️  Não encontrado: ${u.id} (${u.name})`);
        failed++;
      } else {
        console.log(`  ✅ ${u.name}`);
        updated++;
      }
    } catch (e: any) {
      console.error(`  ❌ Erro em ${u.id}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n🏁 Concluído: ${updated} filiais atualizadas, ${failed} falhas.`);
  await mongoose.disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
