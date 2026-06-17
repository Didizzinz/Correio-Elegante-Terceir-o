import React, { useState, useEffect } from 'react';
import { Heart, Music, Gift, Upload, CreditCard, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '@supabase/supabase-js';

// ==========================================
// 🔴 SUAS CHAVES DO SUPABASE (URL CORRIGIDA):
// ==========================================
const SUPABASE_URL = "https://supabase.co";
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

    // ESCUTAR O BANCO EM TEMPO REAL QUANDO O ADMIN LOGAR
  useEffect(() => {
    if (!isAdminLogged) return;

    // Busca os pedidos que já existem no banco
    fetchOrders();

    // Cria o canal para ouvir novos pedidos (INSERT) e mudanças de status (UPDATE)
    const canalPedidos = supabase
      .channel('mudancas-pedidos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload: any) => { // ⬅️ Adicionado ": any" aqui para corrigir o erro do TS
          if (payload.eventType === 'INSERT') {
            setAllOrders((pedidosAtuais) => [payload.new as Order, ...pedidosAtuais]);
          } else if (payload.eventType === 'UPDATE') {
            setAllOrders((pedidosAtuais) =>
              pedidosAtuais.map((pedido) =>
                pedido.id === payload.new.id ? (payload.new as Order) : pedido
              )
            );
          }
        }
      )
      .subscribe();

    // Fecha a conexão com o canal ao deslogar ou fechar a página
    return () => {
      supabase.removeChannel(canalPedidos);
    };
  }, [isAdminLogged]);


    // Busca os pedidos que já existem no banco
    fetchOrders();

    // Cria o canal para ouvir novos pedidos (INSERT) e mudanças de status (UPDATE)
    const canalPedidos = supabase
      .channel('mudancas-pedidos-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'pedidos' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setAllOrders((pedidosAtuais) => [payload.new as Order, ...pedidosAtuais]);
          } else if (payload.eventType === 'UPDATE') {
            setAllOrders((pedidosAtuais) =>
              pedidosAtuais.map((pedido) =>
                pedido.id === payload.new.id ? (payload.new as Order) : pedido
              )
            );
          }
        }
      )
      .subscribe();

    // Fecha a conexão com o canal ao deslogar ou fechar a página
    return () => {
      supabase.removeChannel(canalPedidos);
    };
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

    // O fetchOrders daqui foi removido porque o próprio useEffect do Realtime tratará a atualização da lista
    if (error) {
      alert('Erro ao atualizar o status do pedido.');
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

      {/* Resto do layout da sua página contendo a listagem... */}
    </div>
  );
}

export default App;
