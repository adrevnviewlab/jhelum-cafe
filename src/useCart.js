import { useEffect, useMemo, useReducer } from 'react';
import { addCartLine, cartTotals, createCartLine, updateCartLine } from './cart';

const STORAGE_KEY = 'jehlum-cafe-cart-v1';

function loadCart() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function reducer(lines, action) {
  if (action.type === 'add') return addCartLine(lines, action.line);
  if (action.type === 'quantity') return updateCartLine(lines, action.key, action.quantity);
  if (action.type === 'remove') return lines.filter(line => line.key !== action.key);
  if (action.type === 'clear') return [];
  return lines;
}

export default function useCart() {
  const [lines, dispatch] = useReducer(reducer, undefined, loadCart);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // Ordering remains available for the current page when storage is unavailable.
    }
  }, [lines]);

  const totals = useMemo(() => cartTotals(lines), [lines]);
  return {
    lines,
    ...totals,
    add(itemId, variantIndex = 0, modifierIds = [], quantity = 1) {
      dispatch({ type: 'add', line: createCartLine(itemId, variantIndex, modifierIds, quantity) });
    },
    setQuantity(key, quantity) {
      dispatch({ type: 'quantity', key, quantity });
    },
    remove(key) {
      dispatch({ type: 'remove', key });
    },
    clear() {
      dispatch({ type: 'clear' });
    },
  };
}
