import { useEffect } from 'react';
import type { SimulatorInputs, SimulatorAction, VolumeResult } from '../../types/simulator';
import VolumeSection from '../sidebar/VolumeSection';

interface Props {
  open: boolean;
  onClose: () => void;
  inputs: SimulatorInputs;
  dispatch: React.Dispatch<SimulatorAction>;
  vol: VolumeResult;
}

export default function VolumeModal({ open, onClose, inputs, dispatch, vol }: Props) {
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
        <VolumeSection inputs={inputs} dispatch={dispatch} vol={vol} />
      </div>
    </div>
  );
}
