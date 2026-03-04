import { useEffect } from 'react';
import type { SimulatorInputs, SimulatorAction } from '../../types/simulator';
import WeibullSection from '../sidebar/WeibullSection';

interface Props {
  open: boolean;
  onClose: () => void;
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
}

export default function WeibullModal({ open, onClose, inputs, dispatch }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 420 }}>
        <button className="float-right bg-transparent border-none text-xl cursor-pointer text-text-faint hover:text-text p-0 leading-none" onClick={onClose}>&times;</button>
        <WeibullSection inputs={inputs} dispatch={dispatch} />
      </div>
    </div>
  );
}
