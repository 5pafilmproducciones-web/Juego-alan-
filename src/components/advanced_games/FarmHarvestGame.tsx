import React, { useState, useEffect } from 'react';
import { playSoundEffect } from '../../services/speechService';
import {
  RotateCcw,
  Trophy,
  Sparkles,
  Droplets,
  Sprout,
  CheckCircle,
  Gem,
  ShoppingBag,
  Award,
  Flame,
  ArrowRight,
} from 'lucide-react';

interface FarmHarvestGameProps {
  onWin: (gems: number) => void;
  soundEnabled: boolean;
}

type CropType = 'carrot' | 'strawberry' | 'wheat' | 'pumpkin' | 'watermelon';

interface CropInfo {
  type: CropType;
  name: string;
  emoji: string;
  growSeconds: number;
  sellGems: number;
  color: string;
  stages: string[];
}

const CROPS: Record<CropType, CropInfo> = {
  carrot: {
    type: 'carrot',
    name: 'Zanahoria Dulce',
    emoji: '🥕',
    growSeconds: 5,
    sellGems: 4,
    color: 'text-amber-500',
    stages: ['🌱', '🌿', '🥕'],
  },
  strawberry: {
    type: 'strawberry',
    name: 'Fresa Mágica',
    emoji: '🍓',
    growSeconds: 7,
    sellGems: 6,
    color: 'text-rose-500',
    stages: ['🌱', '🌸', '🍓'],
  },
  wheat: {
    type: 'wheat',
    name: 'Trigo Dorado',
    emoji: '🌾',
    growSeconds: 6,
    sellGems: 5,
    color: 'text-yellow-500',
    stages: ['🌱', '🌾', '🌾'],
  },
  pumpkin: {
    type: 'pumpkin',
    name: 'Calabaza Gigante',
    emoji: '🎃',
    growSeconds: 9,
    sellGems: 8,
    color: 'text-orange-500',
    stages: ['🌱', '🌿', '🎃'],
  },
  watermelon: {
    type: 'watermelon',
    name: 'Sandía Lunar',
    emoji: '🍉',
    growSeconds: 10,
    sellGems: 10,
    color: 'text-emerald-500',
    stages: ['🌱', '🍈', '🍉'],
  },
};

interface Plot {
  id: number;
  crop: CropType | null;
  stage: number; // 0: empty, 1: sprout, 2: growing, 3: ripe
  progress: number; // 0 to 100
  isWatered: boolean;
  waterTimeRemaining: number;
}

interface Animal {
  id: string;
  name: string;
  species: string;
  emoji: string;
  hungry: boolean;
  requiredCrop: CropType;
  requiredCount: number;
  productEmoji: string;
  productName: string;
  productSellGems: number;
  dialog: string;
}

interface Order {
  id: string;
  customerName: string;
  customerEmoji: string;
  demandType: 'crop' | 'product';
  itemKey: string;
  count: number;
  gemReward: number;
  completed: boolean;
}

export const FarmHarvestGame: React.FC<FarmHarvestGameProps> = ({ onWin, soundEnabled }) => {
  // 6 farming plots
  const [plots, setPlots] = useState<Plot[]>([
    { id: 0, crop: 'carrot', stage: 2, progress: 60, isWatered: true, waterTimeRemaining: 4 },
    { id: 1, crop: 'wheat', stage: 3, progress: 100, isWatered: false, waterTimeRemaining: 0 },
    { id: 2, crop: 'strawberry', stage: 1, progress: 25, isWatered: true, waterTimeRemaining: 5 },
    { id: 3, crop: null, stage: 0, progress: 0, isWatered: false, waterTimeRemaining: 0 },
    { id: 4, crop: null, stage: 0, progress: 0, isWatered: false, waterTimeRemaining: 0 },
    { id: 5, crop: 'pumpkin', stage: 2, progress: 50, isWatered: false, waterTimeRemaining: 0 },
  ]);

  // Selected tool
  const [selectedTool, setSelectedTool] = useState<'plant' | 'water' | 'fertilizer' | 'harvest'>('harvest');
  const [selectedSeed, setSelectedSeed] = useState<CropType>('carrot');

  // Barn storage inventory
  const [inventory, setInventory] = useState<Record<string, number>>({
    carrot: 3,
    strawberry: 2,
    wheat: 4,
    pumpkin: 1,
    watermelon: 0,
    milk: 1,
    egg: 2,
    wool: 1,
    truffle: 0,
  });

  // Total session gems produced
  const [totalEarnedGems, setTotalEarnedGems] = useState(0);

  // Animals in corral
  const [animals, setAnimals] = useState<Animal[]>([
    {
      id: 'cow',
      name: 'Margarita',
      species: 'Vaca Lechera',
      emoji: '🐮',
      hungry: true,
      requiredCrop: 'wheat',
      requiredCount: 2,
      productEmoji: '🥛',
      productName: 'Leche Fresca',
      productSellGems: 12,
      dialog: '¡Muuu! Dame 2 de Trigo 🌾 para darte rica leche.',
    },
    {
      id: 'chicken',
      name: 'Pita',
      species: 'Gallina Ponedora',
      emoji: '🐔',
      hungry: true,
      requiredCrop: 'carrot',
      requiredCount: 2,
      productEmoji: '🥚',
      productName: 'Huevo Dorado',
      productSellGems: 10,
      dialog: '¡Kikirikí! Aliméntame con 2 Zanahorias 🥕.',
    },
    {
      id: 'sheep',
      name: 'Lana',
      species: 'Oveja Algodón',
      emoji: '🐑',
      hungry: false,
      requiredCrop: 'strawberry',
      requiredCount: 2,
      productEmoji: '🧶',
      productName: 'Ovillo de Lana',
      productSellGems: 15,
      dialog: '¡Beee! Me encanta el aroma de las fresas 🍓.',
    },
    {
      id: 'pig',
      name: 'Porky',
      species: 'Cerdito Alegre',
      emoji: '🐷',
      hungry: true,
      requiredCrop: 'pumpkin',
      requiredCount: 1,
      productEmoji: '💎',
      productName: 'Gemas de Trufa',
      productSellGems: 20,
      dialog: '¡Oink! Una calabaza 🎃 y buscaré tesoros para ti.',
    },
  ]);

  // Village orders
  const [orders, setOrders] = useState<Order[]>([
    {
      id: 'ord-1',
      customerName: 'Panadero Bruno',
      customerEmoji: '👨‍🍳',
      demandType: 'crop',
      itemKey: 'wheat',
      count: 3,
      gemReward: 25,
      completed: false,
    },
    {
      id: 'ord-2',
      customerName: 'Maestra Sofía',
      customerEmoji: '👩‍🏫',
      demandType: 'crop',
      itemKey: 'strawberry',
      count: 2,
      gemReward: 20,
      completed: false,
    },
    {
      id: 'ord-3',
      customerName: 'Alcalde Don Tomás',
      customerEmoji: '🎩',
      demandType: 'product',
      itemKey: 'milk',
      count: 1,
      gemReward: 30,
      completed: false,
    },
  ]);

  // Floating feedback animations
  const [floatingNotes, setFloatingNotes] = useState<{ id: number; text: string; x: number; y: number }[]>([]);

  const addNote = (text: string, x = 50, y = 50) => {
    const id = Date.now() + Math.random();
    setFloatingNotes((prev) => [...prev, { id, text, x, y }]);
    setTimeout(() => {
      setFloatingNotes((prev) => prev.filter((n) => n.id !== id));
    }, 1500);
  };

  // Plant growth loop (tick every 1s)
  useEffect(() => {
    const timer = setInterval(() => {
      setPlots((prevPlots) =>
        prevPlots.map((plot) => {
          if (!plot.crop || plot.stage >= 3) return plot;

          const cropDef = CROPS[plot.crop];
          // Watered plants grow twice as fast
          const growthInc = plot.isWatered ? (100 / cropDef.growSeconds) * 1.5 : 100 / cropDef.growSeconds;
          const nextProgress = Math.min(100, plot.progress + growthInc);

          let nextStage = plot.stage;
          if (nextProgress >= 100) {
            nextStage = 3;
          } else if (nextProgress >= 50) {
            nextStage = 2;
          } else if (nextProgress > 0) {
            nextStage = 1;
          }

          const nextWaterTime = Math.max(0, plot.waterTimeRemaining - 1);
          const isStillWatered = nextWaterTime > 0;

          return {
            ...plot,
            progress: nextProgress,
            stage: nextStage,
            waterTimeRemaining: nextWaterTime,
            isWatered: isStillWatered,
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handle clicking on a plot
  const handlePlotClick = (plot: Plot) => {
    if (selectedTool === 'harvest' || plot.stage === 3) {
      if (plot.crop && plot.stage === 3) {
        // Harvest crop
        const cropDef = CROPS[plot.crop];
        const harvestCount = Math.floor(Math.random() * 2) + 2; // 2 to 3 units
        setInventory((prev) => ({
          ...prev,
          [plot.crop!]: (prev[plot.crop!] || 0) + harvestCount,
        }));

        if (soundEnabled) playSoundEffect('correct');
        addNote(`+${harvestCount} ${cropDef.emoji} ${cropDef.name}!`);

        setPlots((prev) =>
          prev.map((p) =>
            p.id === plot.id
              ? { ...p, crop: null, stage: 0, progress: 0, isWatered: false, waterTimeRemaining: 0 }
              : p
          )
        );
        return;
      }
    }

    if (selectedTool === 'plant') {
      if (plot.crop !== null) {
        addNote('¡Ya hay una planta aquí!', 50, 40);
        return;
      }
      // Plant seed
      setPlots((prev) =>
        prev.map((p) =>
          p.id === plot.id
            ? { ...p, crop: selectedSeed, stage: 1, progress: 5, isWatered: true, waterTimeRemaining: 8 }
            : p
        )
      );
      if (soundEnabled) playSoundEffect('feed');
      addNote(`🌱 Sembrado ${CROPS[selectedSeed].name}`);
      return;
    }

    if (selectedTool === 'water') {
      if (!plot.crop) {
        addNote('Primero siembra una semilla 🌱', 50, 40);
        return;
      }
      setPlots((prev) =>
        prev.map((p) =>
          p.id === plot.id
            ? { ...p, isWatered: true, waterTimeRemaining: 12 }
            : p
        )
      );
      if (soundEnabled) playSoundEffect('gem');
      addNote('💧 ¡Regado y súper hidratado!');
      return;
    }

    if (selectedTool === 'fertilizer') {
      if (!plot.crop) {
        addNote('Primero siembra una semilla 🌱', 50, 40);
        return;
      }
      setPlots((prev) =>
        prev.map((p) =>
          p.id === plot.id
            ? { ...p, progress: 100, stage: 3 }
            : p
        )
      );
      if (soundEnabled) playSoundEffect('unlock');
      addNote('✨ ¡Fertilizante Estelar Instantáneo!');
      return;
    }
  };

  // Feed animal
  const handleFeedAnimal = (animal: Animal) => {
    const currentCropCount = inventory[animal.requiredCrop] || 0;
    if (currentCropCount < animal.requiredCount) {
      if (soundEnabled) playSoundEffect('wrong');
      addNote(`Necesitas ${animal.requiredCount} de ${CROPS[animal.requiredCrop].emoji} para alimentar a ${animal.name}`);
      return;
    }

    // Deduct crop, add produce
    setInventory((prev) => {
      const nextInv = { ...prev };
      nextInv[animal.requiredCrop] -= animal.requiredCount;
      const prodKey =
        animal.id === 'cow'
          ? 'milk'
          : animal.id === 'chicken'
          ? 'egg'
          : animal.id === 'sheep'
          ? 'wool'
          : 'truffle';
      nextInv[prodKey] = (nextInv[prodKey] || 0) + 1;
      return nextInv;
    });

    if (soundEnabled) playSoundEffect('gem');
    addNote(`💖 ${animal.name} produjo ${animal.productEmoji} ${animal.productName}!`);

    // Reset hunger temporarily
    setAnimals((prev) =>
      prev.map((a) => (a.id === animal.id ? { ...a, hungry: false } : a))
    );

    setTimeout(() => {
      setAnimals((prev) =>
        prev.map((a) => (a.id === animal.id ? { ...a, hungry: true } : a))
      );
    }, 12000);
  };

  // Complete Order
  const handleCompleteOrder = (order: Order) => {
    const curCount = inventory[order.itemKey] || 0;
    if (curCount < order.count) {
      if (soundEnabled) playSoundEffect('wrong');
      addNote(`Faltan artículos para completar este pedido 📦`);
      return;
    }

    // Deduct item
    setInventory((prev) => ({
      ...prev,
      [order.itemKey]: prev[order.itemKey] - order.count,
    }));

    // Award gems
    setTotalEarnedGems((prev) => prev + order.gemReward);
    onWin(order.gemReward);

    if (soundEnabled) playSoundEffect('correct');
    addNote(`🎉 ¡Pedido completado! +${order.gemReward} Gemas 💎`);

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id
          ? {
              ...o,
              completed: true,
            }
          : o
      )
    );

    // Replace order after 3s
    setTimeout(() => {
      const cropKeys: CropType[] = ['carrot', 'strawberry', 'wheat', 'pumpkin', 'watermelon'];
      const randomCrop = cropKeys[Math.floor(Math.random() * cropKeys.length)];
      setOrders((prev) =>
        prev.map((o) =>
          o.id === order.id
            ? {
                ...o,
                itemKey: randomCrop,
                count: Math.floor(Math.random() * 2) + 2,
                gemReward: Math.floor(Math.random() * 15) + 20,
                completed: false,
              }
            : o
        )
      );
    }, 3000);
  };

  // Quick sell all inventory for gems
  const handleSellDirect = (key: string, gemPrice: number) => {
    const count = inventory[key] || 0;
    if (count <= 0) return;

    const reward = count * gemPrice;
    setInventory((prev) => ({ ...prev, [key]: 0 }));
    setTotalEarnedGems((prev) => prev + reward);
    onWin(reward);

    if (soundEnabled) playSoundEffect('gem');
    addNote(`💰 ¡Vendiste todo por +${reward} Gemas 💎!`);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl space-y-6 relative overflow-hidden">
      {/* Floating Notes */}
      {floatingNotes.map((n) => (
        <div
          key={n.id}
          className="absolute z-50 pointer-events-none text-sm font-black px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 shadow-2xl animate-bounce"
          style={{ left: `${n.x}%`, top: `${n.y}%` }}
        >
          {n.text}
        </div>
      ))}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-green-400 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/30">
            🚜
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <span>Granja Feliz & Cosecha Mágica</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700">
                VIP
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Siembra, riega, cuida a los animales del establo y entrega pedidos para ganar decenas de gemas.
            </p>
          </div>
        </div>

        {/* Total Gems & Status */}
        <div className="flex items-center gap-2">
          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-amber-500/40 flex items-center gap-2 shadow-inner">
            <Gem className="w-4 h-4 text-amber-400 fill-amber-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 uppercase font-black block leading-none">
                Gemas Ganadas
              </span>
              <span className="text-base font-black text-amber-300">+{totalEarnedGems} 💎</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-slate-950 border border-slate-800">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs font-bold text-slate-400 mr-1">Herramienta:</span>

          <button
            onClick={() => setSelectedTool('harvest')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'harvest'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <span>🧺 Cosechar</span>
          </button>

          <button
            onClick={() => setSelectedTool('plant')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'plant'
                ? 'bg-emerald-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Sprout className="w-3.5 h-3.5" />
            <span>🌱 Sembrar</span>
          </button>

          <button
            onClick={() => setSelectedTool('water')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'water'
                ? 'bg-blue-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Droplets className="w-3.5 h-3.5" />
            <span>💧 Regar</span>
          </button>

          <button
            onClick={() => setSelectedTool('fertilizer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              selectedTool === 'fertilizer'
                ? 'bg-purple-600 text-white font-black shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>✨ Fertilizante</span>
          </button>
        </div>

        {/* Seed Selector if tool is 'plant' */}
        {selectedTool === 'plant' && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 font-bold mr-1">Semilla:</span>
            {(Object.keys(CROPS) as CropType[]).map((cKey) => {
              const crop = CROPS[cKey];
              const isSelected = selectedSeed === cKey;
              return (
                <button
                  key={cKey}
                  onClick={() => setSelectedSeed(cKey)}
                  className={`px-2.5 py-1 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                    isSelected
                      ? 'bg-emerald-500 text-slate-950 font-black ring-2 ring-emerald-400'
                      : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  <span>{crop.emoji}</span>
                  <span className="hidden sm:inline">{crop.name}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Main Grid: Parcels on Left (7 cols), Barn & Corral on Right (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Farm Plots (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-black text-white flex items-center gap-2">
              <span>🌾 Huerto de Cultivo (Toca para interactuar)</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {plots.filter((p) => p.stage === 3).length} cultivos listos
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {plots.map((plot) => {
              const cropDef = plot.crop ? CROPS[plot.crop] : null;
              const isRipe = plot.stage === 3;

              return (
                <div
                  key={plot.id}
                  onClick={() => handlePlotClick(plot)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-between min-h-[140px] relative select-none group ${
                    isRipe
                      ? 'bg-gradient-to-b from-amber-950/70 to-emerald-950/70 border-amber-400 shadow-lg shadow-amber-500/20 hover:scale-105'
                      : plot.crop
                      ? 'bg-slate-950 border-emerald-800/80 hover:border-emerald-500'
                      : 'bg-slate-950/60 border-slate-800 border-dashed hover:border-slate-600'
                  }`}
                >
                  {/* Status badges */}
                  <div className="w-full flex items-center justify-between text-[10px]">
                    <span className="font-bold text-slate-400">Parcela {plot.id + 1}</span>
                    {plot.isWatered && (
                      <span className="text-blue-400 font-bold flex items-center gap-0.5">
                        <Droplets className="w-3 h-3" /> Húmedo
                      </span>
                    )}
                  </div>

                  {/* Crop Visual */}
                  <div className="my-2 flex flex-col items-center justify-center">
                    {plot.crop ? (
                      <div className="text-center">
                        <span
                          className={`text-5xl transition-transform duration-300 block ${
                            isRipe
                              ? 'animate-bounce drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                              : 'group-hover:scale-110'
                          }`}
                        >
                          {isRipe
                            ? cropDef?.emoji
                            : plot.stage === 2
                            ? cropDef?.stages[1]
                            : cropDef?.stages[0]}
                        </span>
                        <span className="text-[11px] font-bold text-slate-300 mt-1 block">
                          {isRipe ? `¡${cropDef?.name}! 🧺` : cropDef?.name}
                        </span>
                      </div>
                    ) : (
                      <div className="text-center py-3">
                        <span className="text-3xl text-slate-700 block">🕳️</span>
                        <span className="text-[10px] text-slate-500 font-medium mt-1 block">
                          Tierra lista
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Growth Progress Bar */}
                  {plot.crop && (
                    <div className="w-full">
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            isRipe
                              ? 'bg-amber-400'
                              : 'bg-gradient-to-r from-emerald-500 to-green-400'
                          }`}
                          style={{ width: `${plot.progress}%` }}
                        />
                      </div>
                      <span className="text-[9px] text-slate-400 text-center block mt-0.5">
                        {isRipe ? '¡Listo para cosechar!' : `${Math.round(plot.progress)}% creciendo`}
                      </span>
                    </div>
                  )}

                  {!plot.crop && (
                    <span className="text-[10px] font-bold text-emerald-400 group-hover:underline">
                      + Toca para Sembrar
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Granero / Almacén de Cosecha */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <h5 className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                <span>🏡 Granero de Provisiones</span>
              </h5>
              <span className="text-[10px] text-slate-400">Venta rápida por gemas</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🥕</span>
                  <span className="text-xs font-bold text-white">x{inventory.carrot || 0}</span>
                </div>
                <button
                  onClick={() => handleSellDirect('carrot', 4)}
                  disabled={(inventory.carrot || 0) <= 0}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold disabled:opacity-30 hover:bg-amber-500 hover:text-slate-950"
                >
                  Vender
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🍓</span>
                  <span className="text-xs font-bold text-white">x{inventory.strawberry || 0}</span>
                </div>
                <button
                  onClick={() => handleSellDirect('strawberry', 6)}
                  disabled={(inventory.strawberry || 0) <= 0}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold disabled:opacity-30 hover:bg-amber-500 hover:text-slate-950"
                >
                  Vender
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🌾</span>
                  <span className="text-xs font-bold text-white">x{inventory.wheat || 0}</span>
                </div>
                <button
                  onClick={() => handleSellDirect('wheat', 5)}
                  disabled={(inventory.wheat || 0) <= 0}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold disabled:opacity-30 hover:bg-amber-500 hover:text-slate-950"
                >
                  Vender
                </button>
              </div>

              <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg">🎃</span>
                  <span className="text-xs font-bold text-white">x{inventory.pumpkin || 0}</span>
                </div>
                <button
                  onClick={() => handleSellDirect('pumpkin', 8)}
                  disabled={(inventory.pumpkin || 0) <= 0}
                  className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold disabled:opacity-30 hover:bg-amber-500 hover:text-slate-950"
                >
                  Vender
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Animals & Orders on Right (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Establo de Animales */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-sm font-black text-white flex items-center justify-between">
              <span>🐮 Establo de Animales</span>
              <span className="text-[10px] text-emerald-400 font-bold">¡Aliméntalos!</span>
            </h4>

            <div className="space-y-2.5">
              {animals.map((animal) => {
                const canFeed = (inventory[animal.requiredCrop] || 0) >= animal.requiredCount;

                return (
                  <div
                    key={animal.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-3xl">{animal.emoji}</span>
                      <div>
                        <h6 className="text-xs font-black text-white flex items-center gap-1">
                          <span>{animal.name}</span>
                          <span className="text-[10px] text-slate-400 font-normal">({animal.species})</span>
                        </h6>
                        <p className="text-[10px] text-slate-400">
                          Pide: {animal.requiredCount}x {CROPS[animal.requiredCrop].emoji} → Da {animal.productEmoji}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleFeedAnimal(animal)}
                      disabled={!canFeed}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        canFeed
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md hover:scale-105'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Alimentar</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pedidos de la Aldea (Village Orders) */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Pedidos de la Aldea</span>
              </h4>
              <span className="text-[10px] text-amber-400/80 font-bold">¡Recompensas en Gemas!</span>
            </div>

            <div className="space-y-2">
              {orders.map((ord) => {
                const curCount = inventory[ord.itemKey] || 0;
                const canFulfill = curCount >= ord.count && !ord.completed;

                return (
                  <div
                    key={ord.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                      ord.completed
                        ? 'bg-emerald-950/40 border-emerald-800/60'
                        : canFulfill
                        ? 'bg-slate-900 border-amber-500/60 ring-1 ring-amber-500/30 shadow-md'
                        : 'bg-slate-900/60 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{ord.customerEmoji}</span>
                      <div>
                        <div className="text-xs font-bold text-white">{ord.customerName}</div>
                        <div className="text-[11px] text-slate-400">
                          Requiere: {ord.count}x{' '}
                          {ord.demandType === 'crop'
                            ? CROPS[ord.itemKey as CropType]?.emoji
                            : ord.itemKey === 'milk'
                            ? '🥛 Leche'
                            : ord.itemKey === 'egg'
                            ? '🥚 Huevo'
                            : '🧶 Lana'}{' '}
                          <span className={curCount >= ord.count ? 'text-emerald-400 font-bold' : 'text-rose-400'}>
                            ({curCount}/{ord.count})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div>
                      {ord.completed ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> ¡Listo!
                        </span>
                      ) : (
                        <button
                          onClick={() => handleCompleteOrder(ord)}
                          disabled={!canFulfill}
                          className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1 ${
                            canFulfill
                              ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg animate-pulse'
                              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          }`}
                        >
                          <Gem className="w-3 h-3 fill-current" />
                          <span>+{ord.gemReward}💎</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
