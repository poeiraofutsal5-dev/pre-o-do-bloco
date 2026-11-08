import React from 'react';
import { AppState, MaterialId, SectionId } from '../../types';
import { calculateMaterialCost, calculateProduct, MATERIAL_IDS } from '../../utils/calc';
import { brl } from '../../utils/format';
import { NumericInput } from '../NumericInput';
import { Sparkles, Info } from 'lucide-react';

interface MaterialsViewProps {
  state: AppState;
  onUpdateMaterial: (
    id: MaterialId,
    field: 'price' | 'packQty' | 'batchesPerPack',
    value: number | null
  ) => void;
  onUpdateMaintenance: (value: number | null) => void;
  onNavigate: (section: SectionId) => void;
}

const MATERIAL_EMOJIS: Record<MaterialId, string> = {
  cement: '▦',
  gravel0: '◬',
  powder: '◈',
  sand: '◫',
  slurry: '◍',
  additive: '◉',
  energy: 'ϟ',
  grease: '◧',
  water: '◌',
};

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  state,
  onUpdateMaterial,
  onUpdateMaintenance,
  onNavigate,
}) => {
  const cementCostBase = calculateMaterialCost(state.materials, 'cement', 6);
  const slurryCostBase = calculateMaterialCost(state.materials, 'slurry', 6.5);
  const p14Calc = calculateProduct(
    state.products.bloco14,
    state.materials,
    state.maintenancePercent
  );

  return (
    <div className="space-y-6">
      {/* Shared Materials Table Card */}
      <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs">
        <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-[17px] font-bold text-[#1a382d] tracking-tight">
              Tabela de materiais
            </h2>
            <p className="text-[12px] text-[#869c91] mt-0.5">
              Valores compartilhados entre todos os blocos. Edite preço e tamanho da embalagem.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10.5px] font-bold bg-[#eff6f1] text-[#2c775a] border border-[#e0f0e6]">
            <Sparkles size={12} className="text-[#109569]" />
            <span>Atualização automática</span>
          </span>
        </div>

        {/* Desktop Table Header */}
        <div className="hidden sm:grid sm:grid-cols-12 gap-4 pb-3 mb-2 border-b border-[#edf2ef] text-[11px] font-bold text-[#809b8c] uppercase tracking-wider px-2">
          <div className="sm:col-span-6">Material</div>
          <div className="sm:col-span-3 text-right sm:text-left">Preço de compra</div>
          <div className="sm:col-span-3 text-right sm:text-left">Quantidade da embalagem</div>
        </div>

        {/* Material Rows */}
        <div className="divide-y divide-[#edf2ee]">
          {MATERIAL_IDS.map((mid) => {
            const m = state.materials[mid];
            const isCement = mid === 'cement';

            return (
              <div
                key={mid}
                className="py-3.5 px-2 flex flex-col sm:grid sm:grid-cols-12 gap-3 sm:items-center hover:bg-[#fafcfa] rounded-xl transition-colors"
              >
                {/* Material Info */}
                <div className="sm:col-span-6 flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#eff8f2] text-[#0d8256] font-bold text-[18px] flex items-center justify-center shrink-0">
                    {MATERIAL_EMOJIS[mid]}
                  </div>
                  <div className="min-w-0">
                    <strong className="text-[13px] font-bold text-[#344f40] block truncate">
                      {m.name}
                    </strong>
                    <span className="text-[10px] text-[#97a89f] block">
                      {isCement
                        ? 'Custo por batelada via rendimento do saco'
                        : mid === 'slurry'
                        ? 'Preparo de 6 L (R$ 3,17 a embalagem)'
                        : 'Preço compartilhado na produção'}
                    </span>
                  </div>
                </div>

                {/* Purchase Price Input */}
                <div className="sm:col-span-3">
                  <NumericInput
                    value={m.price}
                    onChange={(val) => onUpdateMaterial(mid, 'price', val ?? 0)}
                    prefix="R$"
                    ariaLabel={`Preço de compra de ${m.name}`}
                    placeholder="0,00"
                    className="min-h-[38px]"
                  />
                </div>

                {/* Package Size Input */}
                <div className="sm:col-span-3">
                  <NumericInput
                    value={m.packQty}
                    onChange={(val) => onUpdateMaterial(mid, 'packQty', val ?? 1)}
                    suffix={m.packUnit === 'm3' ? 'm³' : m.packUnit}
                    ariaLabel={`Quantidade da embalagem de ${m.name}`}
                    placeholder="1"
                    min={0.01}
                    className="min-h-[38px]"
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3.5 border-t border-[#edf2ee] text-[11px] text-[#9bad9e]">
          Todos os preços são editáveis. Valores negativos e embalagens de tamanho zero não são aceitos.
        </div>
      </div>

      {/* Three cards: Cement Sack Yield + Slurry Recipe + Maintenance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Cement Sack Yield Card */}
        <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a382d] tracking-tight">
              Cimento: rendimento por saco
            </h2>
            <p className="text-[11.5px] text-[#869c91] mt-1 mb-4 leading-relaxed">
              O consumo-base é 6 litros por batelada e 8 bateladas por saco. O custo se ajusta proporcionalmente ao volume da receita.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-[11.5px] font-bold text-[#4c6257] block">
                Bateladas por saco
              </label>
              <NumericInput
                value={state.materials.cement.batchesPerPack}
                onChange={(val) => onUpdateMaterial('cement', 'batchesPerPack', val ?? 8)}
                suffix="bateladas"
                isInteger={true}
                min={1}
                ariaLabel="Bateladas por saco de cimento"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#eff8f3] border border-[#d6ecde] flex items-center justify-between text-[11.5px] text-[#557867]">
            <span>Custo para 6 L de cimento</span>
            <strong className="text-[14px] font-extrabold text-[#157a55]">
              {brl(cementCostBase)}
            </strong>
          </div>
        </div>

        {/* Slurry Recipe Card */}
        <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a382d] tracking-tight">
              Nata de cimento: preparo
            </h2>
            <p className="text-[11.5px] text-[#869c91] mt-1 mb-3 leading-relaxed">
              6 litros de nata custam R$ 3,17 (~R$ 0,53 por litro).
            </p>

            <div className="bg-[#f8faf8] border border-[#edf3ed] rounded-xl p-3 space-y-2 text-[11px] text-[#4d6659] mb-4">
              <div className="flex justify-between items-center">
                <span>Paver:</span>
                <strong className="text-[#194b38] font-bold">1 L nos 10 pavers (100 ml/paver)</strong>
              </div>
              <div className="flex justify-between items-center">
                <span>Pingadeira:</span>
                <strong className="text-[#194b38] font-bold">1,2 L para 4 pingadeiras (300 ml/unid)</strong>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#eff8f3] border border-[#d6ecde] flex items-center justify-between text-[11.5px] text-[#557867]">
            <span>Custo do preparo ({state.materials.slurry.packQty} L)</span>
            <strong className="text-[14px] font-extrabold text-[#157a55]">
              {brl(calculateMaterialCost(state.materials, 'slurry', state.materials.slurry.packQty))}
            </strong>
          </div>
        </div>

        {/* Maintenance Percentage Card */}
        <div className="bg-white border border-[#e4ebe7] rounded-2xl p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-bold text-[#1a382d] tracking-tight">
              Manutenção da máquina
            </h2>
            <p className="text-[11.5px] text-[#869c91] mt-1 mb-4 leading-relaxed">
              Percentual aplicado ao custo dos materiais e extras por batelada para depreciação e manutenção preventiva.
            </p>

            <div className="space-y-1.5 mb-5">
              <label className="text-[11.5px] font-bold text-[#4c6257] block">
                Percentual de manutenção
              </label>
              <NumericInput
                value={state.maintenancePercent}
                onChange={(val) => onUpdateMaintenance(val ?? 0)}
                suffix="%"
                min={0}
                ariaLabel="Percentual de manutenção da máquina"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#eff8f3] border border-[#d6ecde] flex items-center justify-between text-[11.5px] text-[#557867]">
            <span>Exemplo: Bloco de 14</span>
            <strong className="text-[14px] font-extrabold text-[#157a55]">
              {brl(p14Calc.maintenance)} / batelada
            </strong>
          </div>
        </div>
      </div>

      {/* Bottom disclaimer */}
      <div className="bg-[#f0f8f4] border border-[#e1efe6] rounded-2xl p-4 flex items-start gap-3 text-[12px] text-[#678275] leading-relaxed">
        <Info size={18} className="text-[#16805a] shrink-0 mt-0.5" />
        <span>
          Para editar quanto material vai em cada batelada, abra o{' '}
          <button
            onClick={() => onNavigate('inicio')}
            className="text-[#087d59] font-bold underline underline-offset-2 hover:text-[#04402e] cursor-pointer"
          >
            Simulador de venda
          </button>{' '}
          e modifique a receita do produto.
        </span>
      </div>
    </div>
  );
};
