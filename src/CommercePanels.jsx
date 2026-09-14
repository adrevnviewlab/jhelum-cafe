import { useEffect, useRef, useState } from 'react';
import Icon from './Icon';
import SheetHandle from './mobile/SheetHandle';
import useSheetGesture from './mobile/useSheetGesture';
import { SpringButton } from './Spring';
import { crepeToppings, itemPrice, money } from './menuData';
import { useMenu } from './MenuProvider';
import { menuPhotos } from './menuPhotos';

function useModalDialog(ref, onClose) {
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement;
    if (!dialog.open) dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    const previousRootOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      if (dialog.open) dialog.close();
      document.body.style.overflow = previousOverflow;
      document.documentElement.style.overflow = previousRootOverflow;
      if (previous?.isConnected) previous.focus({ preventScroll: true });
    };
  }, [ref]);

  return event => {
    if (event.target === ref.current) onClose();
  };
}

export function ItemDialog({ itemId, close, add }) {
  const ref = useRef(null);
  const sheet = useSheetGesture(close);
  const onBackdrop = useModalDialog(ref, close);
  const { items } = useMenu();
  const item = items.find(entry => entry.id === itemId);
  const [variantIndex, setVariantIndex] = useState(0);
  const [modifierIds, setModifierIds] = useState([]);
  const [quantity, setQuantity] = useState(1);
  if (!item) return null;
  const modifiers = item.modifiers || [];
  const unitCents = itemPrice({ ...item, modifiers }, variantIndex, modifierIds);
  const toggleModifier = id => setModifierIds(current => current.includes(id)
    ? current.filter(entry => entry !== id)
    : [...current, id]);

  return <dialog ref={ref} className="item-dialog native-sheet" aria-labelledby="item-dialog-title" onCancel={close} onClick={onBackdrop}>
    <form ref={sheet.sheetRef} className="item-dialog-panel" method="dialog" onSubmit={event => event.preventDefault()} style={sheet.style}>
      <SheetHandle handleProps={sheet.handleProps} />
      <SpringButton type="button" className="dialog-close item-dialog-close" onClick={close} aria-label="Close item options" hover={{ scale: 1.08 }} tap={{ scale: 0.9 }}><Icon name="close" /></SpringButton>
      <img className="item-dialog-photo" src={`/menu/${item.id}.webp`} alt={menuPhotos[item.id]} width="700" height="700" />
      <div className="item-dialog-copy">
        <p className="label">Choose how you would like it</p>
        <h2 id="item-dialog-title">{item.name}</h2>
        {item.description && <p>{item.description}</p>}
        {item.id === 'crepes' && <p className="item-dialog-note">{crepeToppings}</p>}
        {item.variants && <fieldset><legend>Choose one</legend>{item.variants.map((variant, index) => <label className="choice-row" key={variant.label}>
          <input type="radio" name="variant" checked={variantIndex === index} onChange={() => setVariantIndex(index)} />
          <span>{variant.label}</span><strong>{money(variant.cents)}</strong>
        </label>)}</fieldset>}
        {modifiers.length > 0 && <fieldset><legend>Optional extras</legend>{modifiers.map(modifier => <label className="choice-row" key={modifier.id}>
          <input type="checkbox" checked={modifierIds.includes(modifier.id)} onChange={() => toggleModifier(modifier.id)} />
          <span>{modifier.label}</span><strong>+ {money(modifier.cents)}</strong>
        </label>)}</fieldset>}
        <div className="item-dialog-actions">
          <label>Quantity<select value={quantity} onChange={event => setQuantity(Number(event.target.value))}>{[1, 2, 3, 4, 5, 6].map(value => <option key={value}>{value}</option>)}</select></label>
          <SpringButton type="button" className="add-order-button" onClick={() => { add(item.id, variantIndex, modifierIds, quantity); close(); }}>
            Add to order · {money(unitCents * quantity)}
          </SpringButton>
        </div>
      </div>
    </form>
  </dialog>;
}

export function ConfirmDialog({ title, message, confirmLabel, cancelLabel = 'Keep order', close, onConfirm }) {
  const ref = useRef(null);
  const sheet = useSheetGesture(close);
  const onBackdrop = useModalDialog(ref, close);
  return <dialog ref={node => { ref.current = node; sheet.sheetRef.current = node; }} className="cafe-dialog native-sheet" aria-labelledby="confirm-title" onCancel={close} onClick={onBackdrop} style={sheet.style}>
    <SheetHandle handleProps={sheet.handleProps} />
    <div className="dialog-header"><p className="label">Please confirm</p><SpringButton type="button" className="dialog-close" onClick={close} aria-label="Close dialog" hover={{ scale: 1.08 }} tap={{ scale: 0.9 }}><Icon name="close" /></SpringButton></div>
    <form className="dialog-shell" method="dialog" onSubmit={event => event.preventDefault()}>
      <h2 id="confirm-title">{title}</h2>
      <p>{message}</p>
      <div className="dialog-actions">
        <SpringButton type="button" className="secondary-action" onClick={close}>{cancelLabel}</SpringButton>
        <SpringButton type="button" className="primary-action" onClick={() => { onConfirm(); close(); }}>{confirmLabel}</SpringButton>
      </div>
    </form>
  </dialog>;
}
