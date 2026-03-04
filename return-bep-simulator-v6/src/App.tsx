import { useState } from 'react';
import { useSimulatorState } from './hooks/useSimulatorState';
import Sidebar from './components/layout/Sidebar';
import MainPanel from './components/layout/MainPanel';
import HelpModal from './components/main/HelpModal';
import TornadoModal from './components/main/TornadoModal';
import { Agentation } from 'agentation';

export default function App() {
  const { inputs, dispatch, derived } = useSimulatorState();
  const [helpOpen, setHelpOpen] = useState(false);
  const [tornadoOpen, setTornadoOpen] = useState(false);

  return (
    <>
      <div className="flex h-screen max-desktop:flex-col max-desktop:h-auto">
        <Sidebar inputs={inputs} dispatch={dispatch} derived={derived} onHelpOpen={() => setHelpOpen(true)} onTornadoOpen={() => setTornadoOpen(true)} />
        <MainPanel inputs={inputs} derived={derived} />
        <HelpModal open={helpOpen} onClose={() => setHelpOpen(false)} />
        <TornadoModal open={tornadoOpen} onClose={() => setTornadoOpen(false)} inputs={inputs} dispatch={dispatch} results={derived.tornadoResults} />
      </div>
      {import.meta.env.DEV && <Agentation endpoint="http://localhost:4747" />}
    </>
  );
}
