import { useState } from 'react';
import { useSimulatorState } from './hooks/useSimulatorState';
import Sidebar from './components/layout/Sidebar';
import MainPanel from './components/layout/MainPanel';
import HelpModal from './components/main/HelpModal';
import TornadoModal from './components/main/TornadoModal';
import UncertaintyModal from './components/main/UncertaintyModal';
import WeibullModal from './components/main/WeibullModal';
import VolumeModal from './components/main/VolumeModal';
import { Agentation } from 'agentation';

export default function App() {
  const { inputs, dispatch, derived } = useSimulatorState();
  const [helpOpen, setHelpOpen] = useState(false);
  const [tornadoOpen, setTornadoOpen] = useState(false);
  const [weibullOpen, setWeibullOpen] = useState(false);
  const [volumeOpen, setVolumeOpen] = useState(false);
  const [uncertaintyOpen, setUncertaintyOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen max-desktop:flex-col max-desktop:h-auto">
        <Sidebar
          inputs={inputs} dispatch={dispatch} derived={derived}
          onHelpOpen={() => setHelpOpen(true)}
          onTornadoOpen={() => setTornadoOpen(true)}
          onWeibullOpen={() => setWeibullOpen(true)}
          onVolumeOpen={() => setVolumeOpen(true)}
        />
        <MainPanel inputs={inputs} derived={derived} onUncertaintyOpen={() => setUncertaintyOpen(true)} />
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        <TornadoModal open={tornadoOpen} onClose={() => setTornadoOpen(false)} inputs={inputs} dispatch={dispatch} results={derived.tornadoResults} />
        <WeibullModal open={weibullOpen} onClose={() => setWeibullOpen(false)} inputs={inputs} dispatch={dispatch} />
        <VolumeModal open={volumeOpen} onClose={() => setVolumeOpen(false)} inputs={inputs} dispatch={dispatch} vol={derived.scenario.vol} />
        <UncertaintyModal open={uncertaintyOpen} onClose={() => setUncertaintyOpen(false)} inputs={inputs} />
      </div>
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </>
  );
}
