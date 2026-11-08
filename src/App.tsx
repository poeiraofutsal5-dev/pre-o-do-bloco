import React, { useState, useEffect, useCallback } from 'react';
import {
  AppState,
  MaterialId,
  ProductId,
  ProductionSim,
  SectionId,
} from './types';
import {
  clone,
  DEFAULT_SIM,
  DEFAULT_STATE,
  generateCsv,
  loadState,
  saveState,
} from './utils/calc';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Toast } from './components/Toast';
import { SalesSimulatorView } from './components/views/SalesSimulatorView';
import { CostControlView } from './components/views/CostControlView';
import { MaterialsView } from './components/views/MaterialsView';
import { ProductionSimView } from './components/views/ProductionSimView';
import { ComparisonView } from './components/views/ComparisonView';
import { Sliders, Download, FileJson } from 'lucide-react';
import { RichButton } from '@/registry/spell-ui/rich-button';

const SECTION_TITLES: Record<SectionId, string> = {
  inicio: 'Simulador de venda',
  produtos: 'Controle de custos',
  materiais: 'Materiais e custos',
  producao: 'Simular produção',
  comparativo: 'Comparativo',
};

const SECTION_PAGE_HEADINGS: Record<SectionId, string> = {
  inicio: 'Simulador de venda',
  produtos: 'Sua fábrica em números',
  materiais: 'Materiais e custos',
  producao: 'Simular produção',
  comparativo: 'Comparativo',
};

const SECTION_SUBTITLES: Record<SectionId, string> = {
  inicio: 'Escolha o tipo de bloco, paver ou pingadeira, arraste a barra de preço e acompanhe seu lucro.',
  produtos: 'Acompanhe os custos, as margens e os resultados dos blocos, pavers e pingadeiras.',
  materiais: 'Altere preços e embalagens. Todos os produtos serão atualizados.',
  producao: 'Planeje sua produção sem modificar os valores cadastrados.',
  comparativo: 'Compare todos os produtos usando os preços e custos atuais.',
};

export default function App() {
  const [state, setState] = useState<AppState>(() => loadState());
  const [currentSection, setCurrentSection] = useState<SectionId>('inicio');
  const [selectedProductId, setSelectedProductId] = useState<ProductId>('bloco14');
  const [sim, setSim] = useState<ProductionSim>(() => clone(DEFAULT_SIM));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto-save state to localStorage whenever state changes
  useEffect(() => {
    saveState(state);
  }, [state]);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  }, []);

  const handleUpdateProduct = (
    id: ProductId,
    field: 'blocksPerBatch' | 'salePrice' | 'extraCost' | 'freightPercent',
    value: number | null
  ) => {
    setState((prev) => {
      const next = clone(prev);
      if (field === 'blocksPerBatch') {
        next.products[id].blocksPerBatch = value;
      } else if (field === 'salePrice') {
        next.products[id].salePrice = value;
      } else if (field === 'extraCost') {
        next.products[id].extraCost = value ?? 0;
      } else if (field === 'freightPercent') {
        next.products[id].freightPercent = value ?? 0;
      }
      return next;
    });
  };

  const handleUpdateRecipe = (
    productId: ProductId,
    materialId: MaterialId,
    amount: number | null
  ) => {
    setState((prev) => {
      const next = clone(prev);
      next.products[productId].recipe[materialId] = amount ?? 0;
      return next;
    });
  };

  const handleUpdateMaterial = (
    id: MaterialId,
    field: 'price' | 'packQty' | 'batchesPerPack',
    value: number | null
  ) => {
    setState((prev) => {
      const next = clone(prev);
      if (field === 'price') {
        next.materials[id].price = value ?? 0;
      } else if (field === 'packQty') {
        next.materials[id].packQty = value ?? 1;
      } else if (field === 'batchesPerPack' && id === 'cement') {
        next.materials[id].batchesPerPack = value ?? 8;
      }
      return next;
    });
  };

  const handleUpdateMaintenance = (value: number | null) => {
    setState((prev) => {
      const next = clone(prev);
      next.maintenancePercent = value ?? 0;
      return next;
    });
  };

  const handleUpdateSim = (partial: Partial<ProductionSim>) => {
    setSim((prev) => ({
      ...prev,
      ...partial,
    }));
  };

  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleExportCsv = () => {
    const csvContent = generateCsv(state, sim);
    downloadFile('custos-blocos.csv', csvContent, 'text/csv;charset=utf-8');
    showToast('CSV exportado');
  };

  const handleExportJson = () => {
    const jsonContent = JSON.stringify(state, null, 2);
    downloadFile('backup-blocos.json', jsonContent, 'application/json');
    showToast('Backup exportado');
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        'Restaurar materiais, rendimentos e preços aos valores originais? Suas alterações salvas serão apagadas.'
      )
    ) {
      const fresh = clone(DEFAULT_STATE);
      setState(fresh);
      saveState(fresh);
      setSelectedProductId('bloco14');
      setSim(clone(DEFAULT_SIM));
      setCurrentSection('inicio');
      showToast('Padrões restaurados');
    }
  };

  const handleNavigate = (section: SectionId) => {
    setCurrentSection(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f7f9f8] text-[#152b2b] flex flex-col font-['Inter',sans-serif]">
      {/* Sidebar */}
      <Sidebar
        currentSection={currentSection}
        onNavigate={handleNavigate}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onReset={handleResetDefaults}
      />

      {/* Main Content Area */}
      <div className="lg:ml-[265px] flex flex-col flex-1 min-w-0">
        {/* Topbar */}
        <Topbar
          currentSection={currentSection}
          sectionTitle={SECTION_TITLES[currentSection]}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />

        {/* Page Container */}
        <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-8">
          {/* Page Heading */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
            <div>
              <div className="text-[10.5px] font-extrabold tracking-[1.6px] text-[#14805c] uppercase mb-1.5">
                {currentSection === 'inicio'
                  ? 'SIMULADOR DE VENDAS'
                  : 'CONTROLE DE CUSTOS'}
              </div>
              <h1 className="text-2xl sm:text-[32px] font-black tracking-tight text-[#152b2b] leading-tight">
                {SECTION_PAGE_HEADINGS[currentSection]}
              </h1>
              <p className="text-[13px] sm:text-[14px] text-[#718b7f] mt-1.5">
                {SECTION_SUBTITLES[currentSection]}
              </p>
            </div>

            {currentSection !== 'materiais' && (
              <RichButton
                color="emerald"
                onClick={() => handleNavigate('materiais')}
                className="hidden sm:inline-flex text-[12.5px] rounded-[10px]"
              >
                <Sliders size={16} />
                <span>Editar custos</span>
              </RichButton>
            )}
          </div>

          {/* Current View */}
          {currentSection === 'inicio' && (
            <SalesSimulatorView
              state={state}
              selectedProductId={selectedProductId}
              onSelectProduct={setSelectedProductId}
              onUpdateProduct={handleUpdateProduct}
              onUpdateRecipe={handleUpdateRecipe}
            />
          )}

          {currentSection === 'produtos' && (
            <CostControlView
              state={state}
              onNavigate={handleNavigate}
              onSelectProduct={setSelectedProductId}
            />
          )}

          {currentSection === 'materiais' && (
            <MaterialsView
              state={state}
              onUpdateMaterial={handleUpdateMaterial}
              onUpdateMaintenance={handleUpdateMaintenance}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === 'producao' && (
            <ProductionSimView
              state={state}
              sim={sim}
              onUpdateSim={handleUpdateSim}
              onNavigate={handleNavigate}
            />
          )}

          {currentSection === 'comparativo' && (
            <ComparisonView
              state={state}
              onNavigate={handleNavigate}
              onSelectProduct={setSelectedProductId}
            />
          )}

          {/* Page Footer */}
          <footer className="mt-12 pt-6 pb-6 border-t border-[#ebf0ed] flex flex-col sm:flex-row items-center justify-between gap-4 text-[12px] text-[#93a69c]">
            <span>BlocoCerto · Gestão simples, contas precisas</span>
            <div className="flex items-center gap-2.5">
              <RichButton
                size="sm"
                color="zinc"
                onClick={handleExportJson}
                className="text-xs"
              >
                <FileJson size={14} />
                <span>Baixar backup JSON</span>
              </RichButton>
              <RichButton
                size="sm"
                color="emerald"
                onClick={handleExportCsv}
                className="text-xs"
              >
                <Download size={14} />
                <span>Exportar CSV</span>
              </RichButton>
            </div>
          </footer>
        </main>
      </div>

      {/* Floating Toast notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
