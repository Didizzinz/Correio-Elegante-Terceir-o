import React, { useState, useEffect } from 'react';
import { Heart, Music, Gift, Upload, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 🔴 COLE SUAS CHAVES DO SUPABASE AQUI EMBAIXO:
// ==========================================
const SUPABASE_URL = "https://nsrnmbyfhkflnvfvgkye.supabase.co/rest/v1/";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5zcm5tYnlmaGtmbG52ZnZna3llIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNjkxNjIsImV4cCI6MjA5Njg0NTE2Mn0.pXiMJ1ZZa2vELxX4jJ6QTzHongRKk6RTtXPDgx36HVo";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

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
  product_name: string;
  price: number;
  music_name: string;
  letter_text: string;
  observations: string;
  status: 'pendente' | 'entregue';
  created_at?: string;
}

function App() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [musicName, setMusicName] = useState('');
  const [letterText, setLetterText] = useState('');
  const [observations, setObservations] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminLogged, setIsAdminLogged] = useState(false);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [adminTab, setAdminTab] = useState<'pendentes' | 'entregues'>('pendentes');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAdminLogged) {
      fetchOrders();
    }
  }, [isAdminLogged]);

  const fetchOrders = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('pedidos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setAllOrders(data);
    }
    setIsLoading(false);
  };

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setMusicName('');
    setLetterText('');
    setObservations('');
    setShowPayment(false);
    setIsPaid(false);
    
    setTimeout(() => {
      const formSection = document.getElementById('personalization-form');
      if (formSection) {
        formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 80);
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

  const handleConfirmOrder = async () => {
    if (!selectedProduct) return;
    setIsLoading(true);

    const { error } = await supabase
      .from('pedidos')
      .insert([
        {
          id: orderNumber,
          product_name: selectedProduct.name,
          price: selectedProduct.price,
          music_name: musicName,
          letter_text: letterText,
          observations: observations,
          status: 'pendente'
        }
      ]);

    if (error) {
      alert('Erro ao enviar o pedido para o banco.');
      setIsLoading(false);
      return;
    }

    setIsPaid(true);
    setIsLoading(false);
  };

  const handleToggleStatus = async (id: string, currentStatus: 'pendente' | 'entregue') => {
    const nextStatus = currentStatus === 'pendente' ? 'entregue' : 'pendente';
    const { error } = await supabase
      .from('pedidos')
      .update({ status: nextStatus })
      .eq('id', id);

    if (!error) {
      fetchOrders();
    }
  };

  const resetOrder = () => {
    setSelectedProduct(null);
    setMusicName('');
    setLetterText('');
    setObservations('');
    setShowPayment(false);
    setIsPaid(false);
    setOrderNumber('');
  };

  const filteredOrders = allOrders.filter(order => 
    adminTab === 'entregues' ? order.status === 'entregue' : order.status === 'pendente'
  );

  return (
    <div className="min-h-screen bg-[#F8F1E3] text-[#3F2A1D] overflow-x-hidden">
      {/* Hero */}
      <div className="relative h-[100dvh] flex items-center justify-center overflow-hidden bg-[#3F2A1D]">
        <div className="absolute inset-0">
          <img src="/images/hero.jpg" alt="Festa Junina" className="absolute inset-0 w-full h-full object-cover opacity-90" />
          <motion.div 
            className="absolute inset-0 bg-gradient-to-br from-[#F59E0B]/10 via-transparent to-[#C2410C]/10"
            animate={{ backgroundPosition: ['0% 0%', '100% 100%'] }}
            transition={{ duration: 20, repeat: Infinity, repeatType: "reverse" }}
          />
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
            <button onClick={() => setShowAdmin(true)} className="text-white/60 text-xs hover:text-white/90 tracking-[3px] transition-colors mt-1">
              ÁREA DO TERCEIRÃO
            </button>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <div className="inline-block px-4 py-1 bg-[#C2410C] text-white rounded-full text-xs tracking-[3px] mb-4">FESTA JUNINA 2026</div>
          <h2 className="font-serif text-6xl tracking-[-2.5px]">Escolha seu presente</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {products.map((product) => (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleProductSelect(product)}
              className={`p-6 bg-white rounded-2xl border-2 cursor-pointer transition-all ${selectedProduct?.id === product.id ? 'border-[#C2410C] shadow-lg' : 'border-transparent shadow-sm'}`}
            >
              <h3 className="font-bold text-lg leading-tight">{product.name}</h3>
              <p className="text-[#C2410C] font-semibold mt-2">R$ {product.price},00</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Formulário */}
      <AnimatePresence>
        {selectedProduct && !showPayment && (
          <motion.div 
            id="personalization-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto px-6 py-10 bg-white rounded-3xl shadow-sm my-10"
          >
            <h3 className="font-serif text-3xl mb-6">Personalize seu(a) {selectedProduct.name}</h3>
            
            {selectedProduct.requiresLetter && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Mensagem:</label>
                <textarea value={letterText} onChange={(e) => setLetterText(e.target.value)} className="w-full p-3 border rounded-xl" rows={4} placeholder="Sua declaração..." />
              </div>
            )}

            {selectedProduct.requiresMusic && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Música:</label>
            {selectedProduct.requiresMusic && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Música:</label>
                <input 
                  type="text" 
                  value={musicName} 
                  onChange={(e) => setMusicName(e.target.value)} 
                  className="w-full p-3 border rounded-xl" 
                  placeholder="Ex: Evidências" 
                />
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Observações Adicionais:</label>
              <input 
                type="text" 
                value={observations} 
                onChange={(e) => setObservations(e.target.value)} 
                className="w-full p-3 border rounded-xl" 
                placeholder="Como achar a pessoa..." 
              />
            </div>

            <button 
              onClick={handleGoToPayment} 
              disabled={!canProceedToPayment()} 
              className="w-full py-4 bg-[#C2410C] text-white rounded-xl font-bold disabled:opacity-50"
            >
              Avançar para o Pagamento
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Pagamento */}
      <AnimatePresence>
        {showPayment && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ scale: 0.95 }} 
              animate={{ scale: 1 }} 
              exit={{ scale: 0.95 }} 
              className="bg-white p-8 rounded-3xl max-w-md w-full text-center"
            >
              {!isPaid ? (
                <>
                  <CreditCard className="mx-auto mb-4 text-[#C2410C]" size={48} />
                  <h3 className="text-2xl font-bold mb-2">Pagamento Pix</h3>
                  <p className="text-gray-600 mb-4">Pedido: <strong>{orderNumber}</strong></p>
                  <p className="text-xl font-bold mb-6">Total: R$ {selectedProduct?.price},00</p>
                  <button 
                    onClick={handleConfirmOrder} 
                    disabled={isLoading} 
                    className="w-full py-3 bg-green-600 text-white rounded-xl font-bold"
                  >
                    {isLoading ? 'Enviando...' : 'Confirmar Pagamento Simulado'}
                  </button>
                </>
              ) : (
                <>
                  <CheckCircle className="mx-auto mb-4 text-green-500" size={48} />
                  <h3 className="text-2xl font-bold mb-2">Pedido Confirmado!</h3>
                  <button onClick={resetOrder} className="w-full py-3 bg-[#3F2A1D] text-white rounded-xl font-bold">
                    Fazer outro pedido
                  </button>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin */}
      <AnimatePresence>
        {showAdmin && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ y: 30 }} 
              animate={{ y: 0 }} 
              exit={{ y: 30 }} 
              className="bg-[#F8F1E3] p-8 rounded-3xl max-w-4xl w-full text-[#3F2A1D] shadow-2xl relative max-h-[90vh] overflow-y-auto"
            >
              <button onClick={() => setShowAdmin(false)} className="absolute top-4 right-4 font-bold text-xl">✕</button>
              
              {!isAdminLogged ? (
                <div className="max-w-sm mx-auto text-center py-6">
                  <h3 className="text-2xl font-serif mb-4">Senha do Terceirão</h3>
                  <input 
                    type="password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    className="w-full p-3 border rounded-xl mb-4 text-center text-black" 
                  />
                  <button 
                    onClick={() => { if(adminPassword === 'terceirao2026') setIsAdminLogged(true); else alert('Incorreta!'); }} 
                    className="w-full py-3 bg-[#C2410C] text-white rounded-xl font-bold"
                  >
                    Entrar
                  </button>
                </div>
              ) : (
                <div>
                  <h3 className="text-3xl font-serif mb-4 text-center">Painel de Controle</h3>
                  <div className="flex gap-2 justify-center mb-6">
                    <button 
                      onClick={() => setAdminTab('pendentes')} 
                      className={`px-4 py-2 rounded-xl font-medium ${adminTab === 'pendentes' ? 'bg-[#C2410C] text-white' : 'bg-white'}`}
                    >
                      Pendentes
                    </button>
                    <button 
                      onClick={() => setAdminTab('entregues')} 
                      className={`px-4 py-2 rounded-xl font-medium ${adminTab === 'entregues' ? 'bg-[#C2410C] text-white' : 'bg-white'}`}
                    >
                      Entregues
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {filteredOrders.map((ord) => (
                      <div key={ord.id} className="p-5 bg-white rounded-2xl border flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="font-bold text-lg">{ord.product_name}</h4>
                          {ord.letter_text && <p className="text-sm text-gray-700 italic">"{ord.letter_text}"</p>}
                          {ord.music_name && <p className="text-sm text-blue-700">🎵 {ord.music_name}</p>}
                          {ord.observations && <p className="text-xs text-amber-800">📌 Obs: {ord.observations}</p>}
                        </div>
                        <button 
                          onClick={() => handleToggleStatus(ord.id, ord.status)} 
                          className="px-4 py-2 rounded-xl text-sm font-bold text-white bg-green-600"
                        >
                          {ord.status === 'entregue' ? 'Mudar para Pendente' : 'Marcar Entregue'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
