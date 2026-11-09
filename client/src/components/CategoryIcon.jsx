import React from 'react';
import { ShoppingBag, Home, HeartHandshake, Package, Send, Sparkles } from 'lucide-react';

export default function CategoryIcon({ category, className = 'w-5 h-5' }) {
  switch (category) {
    case 'Grocery and Essentials':
      return <ShoppingBag className={className} />;
    case 'Household Assistance':
      return <Home className={className} />;
    case 'Elderly Assistance':
      return <HeartHandshake className={className} />;
    case 'Carrying and Moving':
      return <Package className={className} />;
    case 'Errands and Deliveries':
      return <Send className={className} />;
    case 'Other Everyday Assistance':
    default:
      return <Sparkles className={className} />;
  }
}

export const CATEGORIES = [
  'Grocery and Essentials',
  'Household Assistance',
  'Elderly Assistance',
  'Carrying and Moving',
  'Errands and Deliveries',
  'Other Everyday Assistance'
];

