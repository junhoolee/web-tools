interface Props {
  on: boolean;
  onToggle: () => void;
  color?: string;
}

export default function ToggleSwitch({ on, onToggle, color = '#ea580c' }: Props) {
  return (
    <div
      className="toggle-switch"
      style={{ background: on ? color : '#cbd5e1' }}
      onClick={onToggle}
    >
      <div
        className="absolute top-[2px] w-[18px] h-[18px] bg-white rounded-full transition-[left] shadow-sm"
        style={{ left: on ? 20 : 2 }}
      />
    </div>
  );
}
