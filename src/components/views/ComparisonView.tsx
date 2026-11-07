import React from 'react';
import { AppState, ProductId, SectionId } from '../../types';
import { calculateProduct, PRODUCT_IDS } from '../../utils/calc';
import { brl, num, pct } from '../../utils/format';
import { ArrowRight, Info } from 'lucide-react';
import { RichButton } from '@/registry/spell-ui/rich-button';

interface ComparisonViewProps {
  state: AppState;
  onNavigate: (section: SectionId) => void;
  onSelectProduct: (id: ProductId) => void;
}

export const ComparisonView: React.FC<ComparisonViewProps> = ({
  state,
  onNavigate,
  onSelectProduct,
}) => {
  const data = PRODUCT_IDS.map((id) => ({
    product: state.products[id],
    calc: calculateProduct(
      state.products[id],
      state.materials,
      state.maintenancePercent
    ),
  }));

  const metrics: {
    title: string;
    getValue: (item: (typeof data)[number]) => string;
    isProfitMetric?: boolean;
    getProfitValue?: (item: (typeof data)[number]) => number | null;
  }[] = [
    {
      title: 'Blocos por batelada',
      getValue: (x) =>
        x.product.blocksPerBatch === null
          ? 'A definir'
          : `${num(x.product.blocksPerBatch, 0)}`,
    },
    {
      title: 'Custo por batelada',
      getValue: (x) => brl(x.calc.batch),
    },
    {
      title: 'Custo por bloco',
      getValue: (x) =>
        x.calc.unit === null ? 'A definir' : brl(x.calc.unit),
    },
    {
      title: 'Preço de venda',
      getValue: (x) =>
        x.product.salePrice === null
          ? 'A definir'
          : brl(x.product.salePrice),
    },
    {
      title: 'Lucro bruto por bloco',
      getValue: (x) =>
        x.calc.profit === null ? 'A definir' : brl(x.calc.profit),
      isProfitMetric: true,
      getProfitValue: (x) => x.calc.profit,
    },
    {
      title: 'Lucro bruto por milheiro',
      getValue: (x) =>
        x.calc.profit === null ? 'A definir' : brl(x.calc.profit * 1000),
      isProfitMetric: true,
      getProfitValue: (x) => x.calc.profit,
    },
    {
      title: 'Margem bruta',
      getValue: (x) => pct(x.calc.margin),
      isProfitMetric: true,
      getProfitValue: (x) => x.calc.margin,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Comparison Matrix Card */}
      <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
        <div className="mb-6">
          <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
            Comparativo dos produtos
          </h2>
          <p className="text-[12px] text-[#869c91] mt-0.5">
            Resultados atualizados com os preços e rendimentos cadastrados.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[#edf1ee]">
          <table className="w-full text-[12.5px]">
            <thead>
              <tr className="bg-[#f8faf8] border-b border-[#edf1ee] text-[#718b7e] text-[11px] font-extrabold uppercase tracking-wider">
                <th className="py-4 px-5 text-left font-bold">Indicador</th>
                {data.map((x) => (
                  <th
                    key={x.product.id}
                    className="py-4 px-5 text-center font-extrabold text-[#28493a]"
                  >
                    {x.product.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eff2f0]">
              {metrics.map((m, idx) => (
                <tr key={idx} className="hover:bg-[#fafcfa]">
                  <td className="py-3.5 px-5 font-bold text-[#44614e]">
                    {m.title}
                  </td>
                  {data.map((x) => {
                    const profitVal = m.getProfitValue ? m.getProfitValue(x) : null;
                    const isProfit = m.isProfitMetric && profitVal !== null;
                    const isPositive = profitVal !== null && profitVal >= 0;

                    return (
                      <td
                        key={x.product.id}
                        className={`py-3.5 px-5 text-center font-semibold ${
                          isProfit
                            ? isPositive
                              ? 'text-[#078353] font-bold'
                              : 'text-[#cc5252] font-bold'
                            : 'text-[#486355]'
                        }`}
                      >
                        {m.getValue(x)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Buttons to navigate and edit each product */}
        <div className="mt-6 pt-5 border-t border-[#edf2ef] flex flex-wrap items-center justify-end gap-3">
          {PRODUCT_IDS.map((pid) => (
            <RichButton
              key={pid}
              color="emerald"
              size="sm"
              onClick={() => {
                onSelectProduct(pid);
                onNavigate('inicio');
              }}
              className="text-xs rounded-lg shadow-sm"
            >
              <span>Editar {state.products[pid].name}</span>
              <ArrowRight size={14} />
            </RichButton>
          ))}
        </div>
      </div>

      {/* Disclaimer */}
      <div className="bg-[#f0f8f4] border border-[#e1efe6] rounded-2xl p-4 flex items-start gap-3 text-[12px] text-[#678275] leading-relaxed">
        <Info size={18} className="text-[#16805a] shrink-0 mt-0.5" />
        <span>
          O Bloco de 9 permanece com o rendimento pendente até você informar. As receitas de venda apresentadas são projeções.
        </span>
      </div>
    </div>
  );
};
