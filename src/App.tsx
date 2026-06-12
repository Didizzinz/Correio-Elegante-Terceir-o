import React, { useState } from 'react';
import { Heart, Music, Gift, Upload, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  requiresMusic?: boolean;
  requiresLetter?: boolean;
  description?: string;
}

const products: Product[] = [
  { id: 1, name: "Mensagem", price: 4, image: "/images/letter.jpg", requiresLetter: true },
  { id: 2, name: "Mensagem + Rosa", price: 8, image: "/images/letter.jpg", requiresLetter: true },
  { id: 3, name: "Mensagem + Chocolate", price: 8, image: "/images/letter.jpg", requiresLetter: true },
  { id: 4, name: "Mensagem + Rosa + Chocolate", price: 12, image: "/images/letter.jpg", requiresLetter: true },
  { id: 5, name: "Serenata", price: 10, image: "/images/hero.jpg", requiresMusic: true },
  { id: 6, name: "Serenata + Rosa", price: 14, image: "/images/serenata.jpg", requiresMusic: true },
  { id: 7, name: "Serenata + Chocolate", price: 14, image: "/images/serenata.jpg", requiresMusic: true },
  { id: 8, name: "Serenata + Rosa + Chocolate", price: 18, image: "/images/serenata.jpg", requiresMusic: true },
  { id: 9, name: "Rosa", price: 5, image: "/images/serenata.jpg" },
  { id: 10, name: "Chocolate", price: 5, image: "/images/letter.jpg" },
];

interface Order {
  id: string;
  product: Product;
  musicName: string;
  letterText: string;
  observations: string;
  photoPreview: string | null;
  status: 'pendente' | 'aceito' | 'recusado' | 'entregue';
  date: string;
}

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [musicName, setMusicName] = useState('');
  const [letterText, setLetterText] = useState('');
  const [observations, setObservations] = useState('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [adminTab, setAdminTab] = useState<'pendentes' | 'entregues'>('pendentes');

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setMusicName('');
    setLetterText('');
    setObservations('');
    setPhotoPreview(null);
    setShowPayment(false);
    setIsPaid(false);
    
    // Scroll suave até o formulário
    setTimeout(() => {
      const formSection = document.getElementById('personalization-form');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const canProceedToPayment = () => {
    if (!selectedProduct) return false;
    if (selectedProduct.requiresMusic && !musicName.trim()) return false;
    if (selectedProduct.requiresLetter && !letterText.trim()) return false;
    return true;
  };

  const handleGoToPayment = () => {
    if (!canProceedToPayment() || !selectedProduct) return;
    
    const orderNum = 'SRN' + Date.now().toString().slice(-8);
    setOrderNumber(orderNum);
    setShowPayment(true);
  };

  const handleConfirmOrder = () => {
    if (!selectedProduct) return;

    const newOrder: Order = {
      id: orderNumber,
      product: selectedProduct,
      musicName,
      letterText,
      observations,
      photoPreview,
      status: 'pendente',
      date: new Date().toLocaleDateString('pt-BR'),
    };

    setAllOrders(prev => [...prev, newOrder]);
    setIsPaid(true);
  };

  const handlePayment = () => {
    // Simulate Mercado Pago payment
    setTimeout(() => {
      setIsPaid(true);
    }, 1200);
  };

  const resetOrder = () => {
    setSelectedProduct(null);
    setMusicName('');
    setLetterText('');
    setObservations('');
    setPhotoPreview(null);
    setShowPayment(false);
    setIsPaid(false);
    setOrderNumber('');
  };

  const getTotalPrice = () => {
    return selectedProduct ? selectedProduct.price : 0;
  };

  return (
    <div className="min-h-screen bg-[#F8F1E3] text-[#3F2A1D] overflow-x-hidden">
      {/* Hero - Tema Festa Junina (design salvo anteriormente) */}
      <div className="relative h-[100dvh] flex items-center justify-center overflow-hidden bg-[#3F2A1D]">
        {/* Fundo animado */}
        <div className="absolute inset-0">
          <img 
            src="/images/hero.jpg" 
            alt="Festa Junina" 
            className="absolute inset-0 w-full h-full object-cover opacity-90"
          />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-[#C2410C]/10"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          />
          {/* Partículas de luz sutis */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[3px] h-[3px] bg-[#F59E0B] rounded-full"
              style={{ left: `${12 + i * 11}%`, top: `${25 + (i % 4) * 18}%` }}
              animate={{ y: [0, -45, 0], opacity: [0.15, 0.65, 0.15] }}
              transition={{ duration: 7 + i, repeat: Infinity, ease: "easeInOut" }}
            />
          ))}
        </div>
        
        <div className="absolute inset-0 bg-[#3F2A1D]/65 z-10" />
        
        <div className="relative z-20 text-center px-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="text-[#F59E0B] text-5xl">✦</div>
          </div>
          <h1 className="font-serif text-[72px] md:text-[92px] leading-none tracking-[-4.5px] text-white mb-3">Correio Elegante</h1>
          <div className="text-[#F59E0B] text-3xl font-light tracking-[4px] mb-4">by Terceirão do João</div>
          
          <p className="text-white/90 max-w-sm mx-auto text-xl mt-4">Serenatas, Cartinhas e Surpresas Românticas para a sua Festa Junina</p>
          
          <div className="flex flex-col items-center gap-3 mt-10">
            <button 
              onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-14 py-4 bg-[#C2410C] hover:bg-[#9F1239] text-white font-medium rounded-full text-lg tracking-wider transition-all active:scale-[0.985]"
            >
              ESCOLHER SEU PRESENTE
            </button>
            <button 
              onClick={() => setShowAdmin(true)}
              className="text-white/60 text-xs hover:text-white/90 tracking-[3px] transition-colors mt-1"
            >
              ÁREA DO TERCEIRÃO
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 flex flex-col items-center z-20">
          <div className="text-xs text-white/60 tracking-[4px]">ARRASTA PARA BAIXO</div>
        </div>
      </div>

      {/* Products Section - Festa Junina */}
      <div id="products" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 bg-[#C2410C] text-white rounded-full text-xs tracking-[3px] mb-4">FESTA JUNINA 2026</div>
          <h2 className="font-serif text-6xl tracking-[-2.5px]">Escolha seu presente</h2>
          <p className="text-[#664E38] mt-3">Serenatas e Cartinhas cheias de charme caipira</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.015 }}
              onClick={() => handleProductSelect(product)}
              className={`product-card cursor-pointer bg-white rounded-3xl overflow-hidden border-2 ${selectedProduct?.id === product.id ? 'border-[#C2410C] selected' : 'border-transparent'} text-[#3F2A1D]`}
            >
              <div className="relative h-64">
                <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/40 to-black/75" />
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                  animate={{ x: ['-100%', '200%'] }}
                  transition={{ duration: 3.8, repeat: Infinity, ease: "linear", delay: product.id * 0.25 }}
                />
                <div className="absolute bottom-5 left-5 right-5">
                  <div className="font-serif text-4xl text-white tracking-tighter">{product.name}</div>
                </div>
              </div>
              <div className="p-6 pt-3">
                <p className="text-sm text-[#C2410C] font-medium">R$ {product.price.toFixed(2)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Personalization + Payment Flow */}
      <AnimatePresence>
        {selectedProduct && (
          <div id="personalization-form" className="bg-white text-[#0F0A0A]">
            <div className="max-w-4xl mx-auto px-6 py-16">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <div className="text-[#C2410C] text-sm tracking-[3px]">SEU PEDIDO JUNINO</div>
                  <h3 className="font-serif text-5xl tracking-tighter">{selectedProduct.name}</h3>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-serif tracking-tighter">R$ {selectedProduct.price}</div>
                </div>
              </div>

              {/* Personalization Section */}
              {!showPayment && (
                <div className="space-y-10">
                  {/* Music Input */}
                  {selectedProduct.requiresMusic && (
                    <div className="glass p-9 rounded-3xl border border-[#C2410C]/10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#C2410C] rounded-2xl"><Music className="w-6 h-6 text-white" /></div>
                        <div>
                          <div className="font-semibold text-xl">Música da Serenata</div>
                          <div className="text-[#666]">Qual música você quer que seja cantada?</div>
                        </div>
                      </div>
                      <input
                        type="text"
                        value={musicName}
                        onChange={(e) => setMusicName(e.target.value)}
                        placeholder="Ex: Perfect - Ed Sheeran"
                        className="input-focus w-full border-2 border-[#C2410C]/20 px-7 py-5 rounded-2xl text-xl placeholder:text-[#aaa]"
                      />
                    </div>
                  )}

                  {/* Letter Textarea */}
                  {selectedProduct.requiresLetter && (
                    <div className="glass p-9 rounded-3xl border border-[#C2410C]/10">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="p-3 bg-[#C2410C] rounded-2xl"><Gift className="w-6 h-6 text-white" /></div>
                        <div>
                          <div className="font-semibold text-xl">Texto da Cartinha</div>
                          <div className="text-[#666]">Escreva a mensagem que será manuscrita</div>
                        </div>
                      </div>
                      <textarea
                        value={letterText}
                        onChange={(e) => setLetterText(e.target.value)}
                        placeholder="Escreva aqui sua mensagem especial..."
                        rows={5}
                        className="input-focus w-full border-2 border-[#9F1239]/20 px-7 py-6 rounded-3xl text-lg resize-y placeholder:text-[#aaa]"
                      />
                    </div>
                  )}

                  {/* Photo Upload Section */}
                  <div className="glass p-9 rounded-3xl border border-[#C2410C]/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-[#C2410C] rounded-2xl"><Upload className="w-6 h-6 text-white" /></div>
                      <div>
                        <div className="font-semibold text-xl">Foto da Pessoa Especial</div>
                        <div className="text-[#666]">Anexe uma foto para personalizar o presente</div>
                      </div>
                    </div>
                    
                    <label className="block border-2 border-dashed border-[#9F1239]/30 hover:border-[#9F1239]/60 rounded-3xl p-12 cursor-pointer transition-all text-center">
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      {photoPreview ? (
                        <div className="space-y-4">
                          <img src={photoPreview} alt="Preview" className="mx-auto max-h-80 rounded-2xl object-cover shadow-xl" />
                          <div className="text-sm text-[#C2410C]">Clique para trocar a foto</div>
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-10 h-10 mx-auto mb-4 text-[#C2410C]" />
                          <div className="font-medium">Clique ou arraste para anexar uma foto</div>
                          <div className="text-sm mt-1 text-[#666]">JPG ou PNG • até 10MB</div>
                        </div>
                      )}
                    </label>
                  </div>

                  {/* Observations Section */}
                  <div className="glass p-9 rounded-3xl border border-[#C2410C]/10">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="p-3 bg-[#C2410C] rounded-2xl"><Gift className="w-6 h-6 text-white" /></div>
                      <div>
                        <div className="font-semibold text-xl">Observações do Pedido</div>
                        <div className="text-[#666]">Alguma informação adicional ou pedido especial?</div>
                      </div>
                    </div>
                    <textarea
                      value={observations}
                      onChange={(e) => setObservations(e.target.value)}
                      placeholder="Ex: Horário preferido, local de entrega..."
                      rows={3}
                      className="input-focus w-full border-2 border-[#9F1239]/20 px-7 py-6 rounded-3xl text-lg resize-y placeholder:text-[#aaa]"
                    />
                  </div>

                  <button 
                    onClick={handleGoToPayment}
                    disabled={!canProceedToPayment()}
                    className="w-full py-6 text-xl font-medium bg-[#C2410C] text-white rounded-3xl disabled:bg-zinc-200 disabled:text-zinc-400 flex items-center justify-center gap-3 hover:bg-black active:bg-[#C2410C]/90 transition-all"
                  >
                    CONTINUAR PARA ENVIAR O PEDIDO <CreditCard className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* ENVIAR PEDIDO SECTION */}
              {showPayment && (
                <div className="max-w-xl mx-auto">
                  <div className="glass p-10 rounded-3xl border border-[#C2410C]/10 mb-6">
                    <div className="font-serif text-4xl tracking-tight mb-9">Enviar Pedido</div>
                    
                    <div className="flex items-center justify-between py-6 border-y border-[#C2410C]/10 mb-8 text-xl">
                      <div>{selectedProduct.name}</div>
                      <div className="font-medium">R$ {getTotalPrice().toFixed(2)}</div>
                    </div>

                    {!isPaid ? (
                      <div>
                        <div className="mb-8 text-center">
                          <div className="text-[#664E38] mb-2">Seu pedido será enviado diretamente para o Terceirão do João</div>
                          <div className="text-sm text-[#999]">Após o envio, você receberá a confirmação por aqui</div>
                        </div>
                        
                        <button 
                          onClick={handleConfirmOrder}
                          className="w-full bg-[#C2410C] hover:bg-[#3F2A1D] py-6 rounded-3xl text-lg font-medium flex items-center justify-center gap-3 transition-all active:scale-[0.985]"
                        >
                          ENVIAR MEU PEDIDO AGORA
                        </button>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="mx-auto w-16 h-16 text-emerald-500 mb-5" />
                        <div className="text-4xl font-medium tracking-tight mb-3">Pedido Enviado!</div>
                        <div className="text-[#664E38]">Pedido #{orderNumber} foi recebido com sucesso.</div>
                        <div className="text-sm mt-3 text-[#999]">Aguarde a confirmação do Terceirão • Status: Pendente</div>
                      </div>
                    )}
                  </div>

                  <div className="text-center text-sm text-[#C2410C]">
                    {isPaid ? "Obrigado! Seu pedido está em análise ❤️" : "O pedido aparecerá como pendente na área do Terceirão"}
                  </div>

                  <button onClick={resetOrder} className="block mx-auto mt-8 text-sm underline hover:no-underline">Fazer outro pedido</button>
                </div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="bg-[#3F2A1D] py-9 text-center text-[#D4BFA3] text-xs tracking-[3px]">
        CORREIO ELEGANTE BY TERCEIRÃO DO JOÃO • FESTA JUNINA 2026
      </footer>

      {/* ADMIN MODAL */}
      <AnimatePresence>
        {showAdmin && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-6">
            <div className="bg-white text-[#0F0A0A] rounded-3xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              {!isAdminLogged ? (
                <div className="p-12 text-center">
                  <div className="font-serif text-5xl tracking-tight mb-4">Área Administrativa</div>
                  <p className="text-[#666] mb-9">Digite a senha de acesso</p>
                  <input 
                    type="password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && adminPassword === 'junina2026') {
                        setIsAdminLogged(true);
                        setAdminPassword('');
                      }
                    }}
                    className="input-focus text-center border-2 px-8 py-4 text-2xl tracking-[8px] rounded-2xl w-80" 
                    placeholder="••••••••"
                  />
                  <div className="flex gap-4 justify-center mt-6">
                    <button onClick={() => { setShowAdmin(false); setAdminPassword(''); }} className="px-8 py-3 text-sm text-[#666]">CANCELAR</button>
                    <button onClick={() => {
                      if (adminPassword === 'junina2026') {
                        setIsAdminLogged(true);
                        setAdminPassword('');
                      } else {
                        alert('Senha incorreta');
                      }
                    }} className="px-8 py-3 text-sm bg-[#C2410C] text-white rounded-full">ENTRAR</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="px-10 py-8 border-b flex justify-between items-center">
                    <div>
                      <div className="font-serif text-4xl tracking-tighter">Painel de Pedidos</div>
                      <div className="text-sm text-[#666] mt-1">{allOrders.length} pedidos recebidos</div>
                    </div>
                    <button onClick={() => { setShowAdmin(false); setIsAdminLogged(false); setAdminTab('pendentes'); }} className="text-sm px-6 py-2 rounded-full border">FECHAR</button>
                  </div>

                  {/* Tabs */}
                  <div className="flex border-b px-10">
                    <button onClick={() => setAdminTab('pendentes')} className={`px-8 py-4 text-sm tracking-widest border-b-2 transition-all ${adminTab === 'pendentes' ? 'border-[#C2410C] font-medium text-[#C2410C]' : 'border-transparent text-[#666]'}`}>
                      PENDENTES / ACEITOS
                    </button>
                    <button onClick={() => setAdminTab('entregues')} className={`px-8 py-4 text-sm tracking-widest border-b-2 transition-all ${adminTab === 'entregues' ? 'border-[#C2410C] font-medium text-[#C2410C]' : 'border-transparent text-[#666]'}`}>
                      ENTREGUES
                    </button>
                  </div>

                  <div className="overflow-auto p-10">
                    {allOrders.length === 0 ? (
                      <div className="text-center py-20 text-[#999]">Nenhum pedido ainda.</div>
                    ) : (
                      <div className="space-y-5">
                        {allOrders
                          .filter(order => adminTab === 'pendentes' ? order.status !== 'entregue' : order.status === 'entregue')
                          .map((order, idx) => {
                            const realIndex = allOrders.findIndex(o => o.id === order.id);
                            return (
                              <div key={idx} className="border rounded-3xl p-8 flex flex-col lg:flex-row lg:items-center gap-6">
                                <div className="flex-1">
                                  <div className="flex justify-between items-start">
                                    <div>
                                      <div className="font-serif text-3xl tracking-tighter">{order.product.name}</div>
                                      <div className="text-xs text-[#C2410C] mt-1">#{order.id} • {order.date}</div>
                                    </div>
                                    <div className="font-medium text-xl text-right">R$ {order.product.price}</div>
                                  </div>

                                  {order.musicName && <div className="mt-4 text-sm"><span className="font-medium">Música:</span> {order.musicName}</div>}
                                  {order.letterText && <div className="mt-1 text-sm"><span className="font-medium">Mensagem:</span> {order.letterText}</div>}
                                  {order.observations && <div className="mt-1 text-sm"><span className="font-medium">Observações:</span> {order.observations}</div>}

                                  {order.photoPreview && <img src={order.photoPreview} className="mt-5 w-24 h-24 rounded-2xl object-cover" />}
                                </div>

                                <div className="flex flex-col gap-3 lg:min-w-[240px]">
                                  <div className={`px-4 py-1 text-sm rounded-full self-start font-medium ${order.status === 'pendente' ? 'bg-amber-100 text-amber-700' : order.status === 'aceito' ? 'bg-emerald-100 text-emerald-700' : order.status === 'entregue' ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'}`}>
                                    {order.status.toUpperCase()}
                                  </div>
                                  
                                  {adminTab === 'pendentes' && (
                                    <div className="flex flex-wrap gap-2">
                                      <button onClick={() => {
                                        const updated = [...allOrders];
                                        updated[realIndex].status = 'aceito';
                                        setAllOrders(updated);
                                      }} className="flex-1 py-3 bg-emerald-600 text-white text-sm rounded-2xl active:bg-emerald-700">ACEITAR</button>
                                      <button onClick={() => {
                                        const updated = [...allOrders];
                                        updated[realIndex].status = 'recusado';
                                        setAllOrders(updated);
                                      }} className="flex-1 py-3 bg-red-600 text-white text-sm rounded-2xl active:bg-red-700">RECUSAR</button>
                                      <button onClick={() => {
                                        const updated = [...allOrders];
                                        updated[realIndex].status = 'entregue';
                                        setAllOrders(updated);
                                      }} className="w-full py-3 mt-1 bg-sky-600 text-white text-sm rounded-2xl active:bg-sky-700">MARCAR ENTREGUE</button>
                                    </div>
                                  )}

                                  {adminTab === 'entregues' && (
                                    <button onClick={() => {
                                      const updated = [...allOrders];
                                      updated[realIndex].status = 'pendente';
                                      setAllOrders(updated);
                                    }} className="w-full py-3 bg-amber-600 text-white text-sm rounded-2xl active:bg-amber-700">DESFAZER ENTREGA</button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
