import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardData() {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Zerar horas para comparar apenas datas

    // Data daqui a 30 dias
    const next30Days = new Date();
    next30Days.setDate(today.getDate() + 30);

    // Data de 30 dias atrás
    const past30Days = new Date();
    past30Days.setDate(today.getDate() - 30);

    const [
      totalContracts,
      activeTotalContracts,
      contractsTotalValue,
      totalDocuments,
      totalAdditives,
      expiringContractsList, // Agora retorna a LISTA, não só a conta
      expiredOver30DaysList, // Lista de vencidos
      expiringAdditivesList, // Lista de aditivos
    ] = await Promise.all([
      // 1. Total Contratos
      this.prisma.contract.count(),

      // 2. Contratos Ativos
      this.prisma.contract.count({
        where: { status: 'ATIVO' },
      }),

      // 3. Valor Total
      this.prisma.contract.aggregate({
        _sum: { contractValue: true },
      }),

      // 4. Documentos
      this.prisma.document.count(),

      // 5. Termos Aditivos
      this.prisma.additive.count(),

      // 6. LISTA: Vencendo em 30 dias
      this.prisma.contract.findMany({
        where: {
          endDate: {
            gte: today,
            lte: next30Days,
          },
          status: 'ATIVO',
        },
        select: {
          idContracts: true,
          contractNum: true, // "006/2025"
          contractor: true, // "R N CONSTRUTORA LTDA"
          endDate: true, // Para calcular "24 dias restantes" no front
          contractValue: true,
        },
        orderBy: {
          endDate: 'asc', // Mostra os que vencem mais cedo primeiro
        },
      }),

      // 7. LISTA: Vencidos +30 dias
      this.prisma.contract.findMany({
        where: {
          endDate: {
            lte: past30Days,
          },
        },
        select: {
          idContracts: true,
          contractNum: true,
          contractor: true,
          endDate: true,
        },
      }),

      // 8. LISTA: Aditivos Vencendo
      this.prisma.additive.findMany({
        where: {
          newEndDate: {
            gte: today,
            lte: next30Days,
          },
        },
        select: {
          idAdditive: true,

          newEndDate: true,
          // Incluímos dados do contrato pai para saber de quem é o aditivo
          contract: {
            select: {
              contractNum: true,
              contractor: true,
            },
          },
        },
      }),
    ]);

    return {
      // Cards de Totais
      totalContracts,
      activeTotalContracts,
      contractsTotalValue: contractsTotalValue._sum.contractValue || 0,
      totalDocuments,
      totalAdditives,

      // Cards de Alerta (Agora com Lista + Contagem)

      // Card Amarelo + Lista Inferior "Contratos Vencendo"
      expiringContracts: {
        count: expiringContractsList.length, // Use isso para o número "7"
        list: expiringContractsList, // Use isso para a tabela/lista
      },

      // Card Vermelho Esquerdo
      expiredOver30Days: {
        count: expiredOver30DaysList.length,
        list: expiredOver30DaysList,
      },

      // Card Vermelho Direito
      expiringAdditives: {
        count: expiringAdditivesList.length,
        list: expiringAdditivesList,
      },
    };
  }
}
