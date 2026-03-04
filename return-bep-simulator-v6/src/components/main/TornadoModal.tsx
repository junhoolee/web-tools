import { useEffect } from 'react';
import TornadoSection from './TornadoSection';
import type { SimulatorInputs, SimulatorAction, TornadoResult } from '../../types/simulator';

interface Props {
  open: boolean;
  onClose: () => void;
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  results: TornadoResult[];
}

export default function TornadoModal({ open, onClose, inputs, dispatch, results }: Props) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !results.length) return null;

  return (
    <div className="modal-overlay open" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal" style={{ width: 860 }}>
        <button className="float-right bg-transparent border-none text-xl cursor-pointer text-text-faint hover:text-text p-0 leading-none" onClick={onClose}>&times;</button>
        <TornadoSection inputs={inputs} dispatch={dispatch} results={results} />
      </div>
    </div>
  );
}
