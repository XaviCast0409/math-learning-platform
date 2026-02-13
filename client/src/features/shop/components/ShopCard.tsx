import { Gem } from 'lucide-react';
import type { Product } from '../../../types';
import { Button } from '../../../components/common/Button';
import { ProductVisual } from './ProductVisual';
import { useMemo } from 'react';

interface Props {
  product: Product;
  userGems: number;
  onBuy: (p: Product) => void;
  isProcessing?: boolean;
}

export const ShopCard = ({ product, userGems, onBuy, isProcessing = false }: Props) => {
  const canAfford = userGems >= product.cost_gems;

  // Memoizamos el render de costo para evitar parpadeos innecesarios
  const CostDisplay = useMemo(() => (
    <>
      <Gem size={14} className={canAfford ? 'text-blue-200' : 'text-gray-400'} />
      {product.cost_gems}
    </>
  ), [canAfford, product.cost_gems]);

  return (
    <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow h-full">

      <div className="mb-3">
        <ProductVisual product={product} size="md" />
      </div>

      <h3 className="font-bold text-gray-800 text-sm mb-1 leading-tight w-full truncate">
        {product.name}
      </h3>

      <p className="text-xs text-gray-500 mb-3 line-clamp-2 h-8 w-full leading-relaxed">
        {product.description}
      </p>

      <Button
        onClick={() => onBuy(product)}
        disabled={!canAfford || isProcessing}
        variant={canAfford ? 'primary' : 'secondary'}
        className="w-full h-9 text-xs flex items-center justify-center gap-1 mt-auto"
      >
        {CostDisplay}
      </Button>
    </div>
  );
};