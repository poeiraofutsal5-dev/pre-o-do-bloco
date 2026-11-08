import React from 'react';
import { AppState, ProductId, SectionId } from '../../types';
import { calculateProduct, PRODUCT_IDS } from '../../utils/calc';
import { brl, pct } from '../../utils/format';
import {
  Box,
  ArrowRight,
  Sliders,
  Wallet,
  Factory,
  ChevronRight,
  Info,
} from 'lucide-react';
import { RichButton } from '@/registry/spell-ui/rich-button';

interface CostControlViewProps {
  state: AppState;
  onNavigate: (section: SectionId) => void;
  onSelectProduct: (id: ProductId) => void;
}

export const CostControlView: React.FC<CostControlViewProps> = ({
  state,
  onNavigate,
  onSelectProduct,
}) => {
  const quickActions = [
    {
      section: 'materiais' as SectionId,
      icon: Sliders,
      title: 'Atualizar materiais',
      desc: 'Cimento, pó de pedra, areia e outros',
    },
    {
      section: 'inicio' as SectionId,
      icon: Wallet,
      title: 'Definir preço de venda',
      desc: 'Ajuste no slider e veja o lucro',
    },
    {
      section: 'producao' as SectionId,
      icon: Factory,
      title: 'Projetar produção',
      desc: 'Bateladas, dias e lucro esperado',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Product KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {PRODUCT_IDS.map((pid) => {
          const product = state.products[pid];
          const calc = calculateProduct(
            product,
            state.materials,
            state.maintenancePercent
          );
          const isPending = calc.unit === null;

          return (
            <div
              key={pid}
              className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs flex flex-col justify-between hover:border-[#cfdfd6] transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#f0f6f2] border border-[#e5efe8] text-[#0b7759] flex items-center justify-center">
                    <Box size={20} />
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold ${
                      isPending
                        ? 'bg-[#fff6e4] text-[#b38331]'
                        : 'bg-[#eaf8f0] text-[#12875d]'
                    }`}
                  >
                    {isPending ? 'Pendente' : 'Calculado'}
                  </span>
                </div>

                <span className="text-[13px] font-bold text-[#355244] block mb-1">
                  {product.name}
                </span>

                <div className="text-[32px] font-extrabold tracking-tight text-[#173d2f] leading-none mb-1">
                  {calc.unit === null ? '—' : brl(calc.unit)}
                </div>

                <span className="text-[11px] text-[#8e9f96] block mb-4">
                  Custo de fabricação por bloco
                </span>
              </div>

              <div>
                <div className="h-px bg-[#edf2ef] my-3.5" />

                <div className="flex items-center justify-between text-[11.5px] text-[#869b8f]">
                  <span>
                    Preço:{' '}
                    <b className="text-[#324f42] font-bold">
                      {product.salePrice === null ? 'A definir' : brl(product.salePrice)}
                    </b>
                  </span>
                  <span>
                    Margem:{' '}
                    <b
                      className={`font-bold ${
                        calc.margin !== null
                          ? calc.margin >= 0
                            ? 'text-[#078353]'
                            : 'text-[#cc5252]'
                          : ''
                      }`}
                    >
                      {pct(calc.margin)}
                    </b>
                  </span>
                </div>

                <RichButton
                  color="emerald"
                  size="sm"
                  onClick={() => {
                    onSelectProduct(pid);
                    onNavigate('inicio');
                  }}
                  className="mt-4 w-full justify-between text-xs font-bold rounded-lg shadow-sm"
                >
                  <span>Abrir simulador</span>
                  <ArrowRight size={15} />
                </RichButton>
              </div>
            </div>
          );
        })}
      </div>

      {/* Two columns: Comparison Chart + Quick Shortcuts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Comparison Stacked Plot */}
        <div className="lg:col-span-7 bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
          <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
            <div>
              <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
                Comparação de custo e lucro
              </h2>
              <p className="text-[12px] text-[#869c91] mt-0.5">
                Por unidade, com os preços de venda atuais
              </p>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-[#84948b]">
              <span className="inline-flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-sm bg-[#abcdbf] inline-block" />
                <span>Custo</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <i className="w-2.5 h-2.5 rounded-sm bg-[#0e9b68] inline-block" />
                <span>Lucro</span>
              </span>
            </div>
          </div>

          <div className="space-y-6 my-6">
            {PRODUCT_IDS.map((pid) => {
              const p = state.products[pid];
              const c = calculateProduct(
                p,
                state.materials,
                state.maintenancePercent
              );
              const maxVal = Math.max(4, p.salePrice || 0, c.unit || 0);

              const costPercent = c.unit ? Math.min(100, (c.unit / maxVal) * 100) : 0;
              const profitPercent =
                c.profit !== null && c.profit > 0
                  ? Math.min(100 - costPercent, (c.profit / maxVal) * 100)
                  : 0;

              return (
                <div key={pid} className="space-y-1.5">
                  <div className="flex items-center justify-between text-[12.5px]">
                    <span className="font-bold text-[#355244]">{p.name}</span>
                    <b
                      className={`font-bold ${
                        c.profit !== null
                          ? c.profit >= 0
                            ? 'text-[#168361]'
                            : 'text-[#cc5252]'
                          : 'text-[#9faaa2]'
                      }`}
                    >
                      {c.profit === null ? '—' : brl(c.profit)}
                    </b>
                  </div>

                  {c.profit !== null && c.unit !== null ? (
                    <div className="h-4 bg-[#edf5f0] rounded-full overflow-hidden flex w-full">
                      <div
                        className="bg-[#abcdbf] h-full transition-all duration-300"
                        style={{ width: `${costPercent}%` }}
                        title={`Custo: ${brl(c.unit)}`}
                      />
                      <div
                        className={`h-full transition-all duration-300 ${
                          c.profit < 0 ? 'bg-[#e0797a]' : 'bg-[#0e9b68]'
                        }`}
                        style={{ width: `${profitPercent}%` }}
                        title={`Lucro: ${brl(c.profit)}`}
                      />
                    </div>
                  ) : (
                    <div className="h-4 bg-[#f2f6f4] rounded-full flex items-center px-3 text-[10.5px] text-[#9faaa2]">
                      Aguardando rendimento ou preço
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#edf2ef] text-[11px] text-[#98a59d]">
            O gráfico não representa vendas realizadas. Valores apenas simulados.
          </div>
        </div>

        {/* Right Column (5 cols): Quick Actions */}
        <div className="lg:col-span-5 bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
              Atalhos rápidos
            </h2>
            <p className="text-[12px] text-[#869c91] mt-0.5 mb-4">
              Você controla todos os valores do sistema.
            </p>

            <div className="divide-y divide-[#edf1ee]">
              {quickActions.map((qa, i) => {
                const Icon = qa.icon;
                return (
                  <button
                    key={i}
                    onClick={() => onNavigate(qa.section)}
                    className="w-full py-4 flex items-center gap-3.5 text-left group hover:bg-[#fbfdfc] transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#f0f8f3] text-[#07875c] flex items-center justify-center shrink-0 group-hover:bg-[#e4f5ea] transition-colors">
                      <Icon size={19} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <strong className="text-[13px] font-bold text-[#2d483c] group-hover:text-[#008b5a] transition-colors block">
                        {qa.title}
                      </strong>
                      <span className="text-[11px] text-[#9aa9a1] block truncate">
                        {qa.desc}
                      </span>
                    </div>
                    <ChevronRight
                      size={18}
                      className="text-[#b2c2b9] group-hover:text-[#07875c] group-hover:translate-x-0.5 transition-all"
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer Box */}
      <div className="bg-[#f0f8f4] border border-[#e1efe6] rounded-2xl p-4 flex items-start gap-3 text-[12px] text-[#678275] leading-relaxed">
        <Info size={18} className="text-[#16805a] shrink-0 mt-0.5" />
        <span>
          Os custos iniciais incluem materiais e manutenção de 10%, mas não incluem mão de obra, frete, tributos ou perdas que não estejam cadastrados.
        </span>
      </div>
    </div>
  );
};
