export default function SheetHandle({ handleProps }) {
  return <div className="sheet-handle" role="presentation" {...handleProps}>
    <i className="sheet-handle__bar" />
    <span className="sheet-handle__hint">Swipe down to close</span>
  </div>;
}
