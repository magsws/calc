import React, { useState, useEffect } from 'react';
import { Calculator, FileDown } from 'lucide-react';
import jsPDF from 'jspdf';

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

function formatPercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}

type TabType = 'results' | 'operational';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('results');
  const [desiredWithdrawal, setDesiredWithdrawal] = useState<number>(0);
  const [fixedCosts, setFixedCosts] = useState<number>(0);
  const [storePercentage, setStorePercentage] = useState<number>(40);
  const [companyPercentage, setCompanyPercentage] = useState<number>(20);
  const [condominiumPercentage, setCondominiumPercentage] = useState<number>(20);
  const [eventsPercentage, setEventsPercentage] = useState<number>(20);
  
  const [averageTickets, setAverageTickets] = useState({
    company: 500,
    condominium: 1250,
    events: 1500
  });

  const [calculations, setCalculations] = useState({
    operatingRevenue: 0,
    productsAndRoyalties: 0,
    simplesNacional: 0,
    sales: 0,
    store: 0,
    company: 0,
    condominium: 0,
    events: 0,
    companyActions: 0,
    condominiumActions: 0,
    eventsActions: 0
  });

  useEffect(() => {
    const operatingRevenue = desiredWithdrawal + fixedCosts;
    const productsAndRoyalties = (operatingRevenue / 0.45) - operatingRevenue;
    const sales = operatingRevenue + productsAndRoyalties;
    const simplesNacional = sales * 0.06;

    const store = sales * (storePercentage / 100);
    const company = sales * (companyPercentage / 100);
    const condominium = sales * (condominiumPercentage / 100);
    const events = sales * (eventsPercentage / 100);

    const companyActions = Math.ceil(company / averageTickets.company);
    const condominiumActions = Math.ceil(condominium / averageTickets.condominium);
    const eventsActions = Math.ceil(events / averageTickets.events);

    setCalculations({
      operatingRevenue,
      productsAndRoyalties,
      simplesNacional,
      sales,
      store,
      company,
      condominium,
      events,
      companyActions,
      condominiumActions,
      eventsActions
    });
  }, [desiredWithdrawal, fixedCosts, storePercentage, companyPercentage, condominiumPercentage, eventsPercentage, averageTickets]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<number>>
  ) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;
    setter(value);
  };

  const handleTicketChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    category: 'company' | 'condominium' | 'events'
  ) => {
    const value = e.target.value ? parseFloat(e.target.value) : 0;
    setAverageTickets(prev => ({
      ...prev,
      [category]: value
    }));
  };

  const generatePDF = () => {
    const pdf = new jsPDF();
    const margin = 20;
    let y = margin;
    
    // Title
    pdf.setFontSize(20);
    pdf.setTextColor(85, 33, 181); // Purple color
    pdf.text('Relatório de Vendas - Cacau Show', margin, y);
    y += 15;

    // Input Values
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Valores de Entrada:', margin, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Retirada Desejada: ${formatCurrency(desiredWithdrawal)}`, margin, y);
    y += 7;
    pdf.text(`Custos Fixos: ${formatCurrency(fixedCosts)}`, margin, y);
    y += 15;

    // Results Section
    pdf.setFontSize(12);
    pdf.text('Resultados:', margin, y);
    y += 10;
    pdf.setFontSize(10);
    pdf.text(`Receita Operacional: ${formatCurrency(calculations.operatingRevenue)}`, margin, y);
    y += 7;
    pdf.text(`Produtos & Royalties: ${formatCurrency(calculations.productsAndRoyalties)}`, margin, y);
    y += 7;
    pdf.text(`Simples Nacional (6%): ${formatCurrency(calculations.simplesNacional)}`, margin, y);
    y += 7;
    pdf.text(`Vendas Totais: ${formatCurrency(calculations.sales)}`, margin, y);
    y += 15;

    // Operational Effort Section
    pdf.setFontSize(12);
    pdf.text('Esforço Operacional:', margin, y);
    y += 10;
    pdf.setFontSize(10);

    // Store
    pdf.text(`Loja (${formatPercentage(storePercentage)}):`, margin, y);
    y += 7;
    pdf.text(`Valor: ${formatCurrency(calculations.store)}`, margin + 10, y);
    y += 10;

    // Guild Section
    pdf.text('Guilda:', margin, y);
    y += 7;

    // Company
    pdf.text(`Empresa (${formatPercentage(companyPercentage)}):`, margin + 10, y);
    y += 7;
    pdf.text(`Valor: ${formatCurrency(calculations.company)}`, margin + 20, y);
    y += 7;
    pdf.text(`Ticket Médio: ${formatCurrency(averageTickets.company)}`, margin + 20, y);
    y += 7;
    pdf.text(`Ações Necessárias: ${calculations.companyActions}`, margin + 20, y);
    y += 10;

    // Condominium
    pdf.text(`Condomínio (${formatPercentage(condominiumPercentage)}):`, margin + 10, y);
    y += 7;
    pdf.text(`Valor: ${formatCurrency(calculations.condominium)}`, margin + 20, y);
    y += 7;
    pdf.text(`Ticket Médio: ${formatCurrency(averageTickets.condominium)}`, margin + 20, y);
    y += 7;
    pdf.text(`Ações Necessárias: ${calculations.condominiumActions}`, margin + 20, y);
    y += 10;

    // Events
    pdf.text(`Eventos (${formatPercentage(eventsPercentage)}):`, margin + 10, y);
    y += 7;
    pdf.text(`Valor: ${formatCurrency(calculations.events)}`, margin + 20, y);
    y += 7;
    pdf.text(`Ticket Médio: ${formatCurrency(averageTickets.events)}`, margin + 20, y);
    y += 7;
    pdf.text(`Ações Necessárias: ${calculations.eventsActions}`, margin + 20, y);

    // Footer with date
    pdf.setFontSize(8);
    pdf.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, margin, 287);

    pdf.save('relatorio-vendas-cacau-show.pdf');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <div className="flex items-center gap-3 mb-8">
          <Calculator className="w-8 h-8 text-purple-600" />
          <h1 className="text-2xl font-bold text-gray-800">
            Calculadora de Vendas - Cacau Show
          </h1>
        </div>

        <div className="grid gap-6 mb-8">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Retirada Desejada
              </label>
              <input
                type="number"
                value={desiredWithdrawal || ''}
                onChange={(e) => handleInputChange(e, setDesiredWithdrawal)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Custos Fixos
              </label>
              <input
                type="number"
                value={fixedCosts || ''}
                onChange={(e) => handleInputChange(e, setFixedCosts)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="0,00"
              />
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('results')}
                className={`${
                  activeTab === 'results'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Resultados
              </button>
              <button
                onClick={() => setActiveTab('operational')}
                className={`${
                  activeTab === 'operational'
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Esforço Operacional
              </button>
            </nav>
          </div>

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Resultados</h2>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Receita Operacional</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(calculations.operatingRevenue)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Produtos & Royalties</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(calculations.productsAndRoyalties)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Simples Nacional (6%)</p>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(calculations.simplesNacional)}
                  </p>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600">Vendas</p>
                  <p className="text-lg font-semibold text-purple-600">
                    {formatCurrency(calculations.sales)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Operational Effort Tab */}
          {activeTab === 'operational' && (
            <div className="bg-gray-50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Esforço Operacional</h2>
              
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-700">Loja</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={storePercentage}
                        onChange={(e) => handleInputChange(e, setStorePercentage)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                        min="0"
                      />
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-800">
                    {formatCurrency(calculations.store)}
                  </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                  <h3 className="text-sm font-medium text-purple-800 mb-4">Guilda</h3>
                  <div className="space-y-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Empresa</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={companyPercentage}
                            onChange={(e) => handleInputChange(e, setCompanyPercentage)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                            min="0"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-800">
                            {formatCurrency(calculations.company)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Ticket médio:</span>
                            <input
                              type="number"
                              value={averageTickets.company}
                              onChange={(e) => handleTicketChange(e, 'company')}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-sm text-gray-600">Ações necessárias:</span>
                          <span className="font-semibold text-purple-600">{calculations.companyActions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Condomínio</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={condominiumPercentage}
                            onChange={(e) => handleInputChange(e, setCondominiumPercentage)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                            min="0"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-800">
                            {formatCurrency(calculations.condominium)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Ticket médio:</span>
                            <input
                              type="number"
                              value={averageTickets.condominium}
                              onChange={(e) => handleTicketChange(e, 'condominium')}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-sm text-gray-600">Ações necessárias:</span>
                          <span className="font-semibold text-purple-600">{calculations.condominiumActions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-700">Eventos</p>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            value={eventsPercentage}
                            onChange={(e) => handleInputChange(e, setEventsPercentage)}
                            className="w-20 px-2 py-1 border border-gray-300 rounded-lg text-right"
                            min="0"
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold text-gray-800">
                            {formatCurrency(calculations.events)}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Ticket médio:</span>
                            <input
                              type="number"
                              value={averageTickets.events}
                              onChange={(e) => handleTicketChange(e, 'events')}
                              className="w-24 px-2 py-1 border border-gray-300 rounded-lg text-right"
                              min="0"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end items-center gap-2">
                          <span className="text-sm text-gray-600">Ações necessárias:</span>
                          <span className="font-semibold text-purple-600">{calculations.eventsActions}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end mb-6">
          <button
            onClick={generatePDF}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FileDown className="w-5 h-5" />
            Gerar PDF
          </button>
        </div>

        <div className="text-sm text-gray-500">
          <p>* Todos os valores são calculados automaticamente com base na Retirada Desejada e Custos Fixos.</p>
          <p>* O Simples Nacional é calculado como 6% do valor total das vendas.</p>
          <p>* Os percentuais do Esforço Operacional são independentes e podem ultrapassar 100%.</p>
          <p>* As ações necessárias são calculadas dividindo o valor esperado pelo ticket médio de cada categoria.</p>
          <p>* Os tickets médios podem ser ajustados para refletir diferentes realidades de mercado.</p>
        </div>
      </div>
    </div>
  );
}

export default App;