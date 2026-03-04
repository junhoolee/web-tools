interface Preset {
  key: string;
  label: string;
}

interface Props {
  presets: Preset[];
  active: string;
  onSelect: (key: string) => void;
  activeColor?: string;
}

export default function PresetButtons({ presets, active, onSelect, activeColor = '#3b82f6' }: Props) {
  return (
    <div className="flex gap-[5px] mb-3">
      {presets.map(p => (
        <button
          key={p.key}
          onClick={() => onSelect(p.key)}
          className="flex-1 py-[5px] px-[6px] border border-border rounded-md text-[11px] cursor-pointer transition-all"
          style={
            active === p.key
              ? { background: activeColor, color: '#fff', borderColor: activeColor }
              : { background: '#fff' }
          }
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
