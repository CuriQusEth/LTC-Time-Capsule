import { Routes, Route } from 'react-router-dom';
import { Web3Provider } from './lib/Web3Provider';
import { Header } from './components/Header';
import { Home } from './pages/Home';
import { CreateCapsule } from './pages/CreateCapsule';
import { ExploreCapsules } from './pages/ExploreCapsules';
import { CapsuleDetails } from './pages/CapsuleDetails';
import { MyCapsules } from './pages/MyCapsules';

export default function App() {
  return (
    <Web3Provider>
      <div className="min-h-screen bg-transparent text-[#e0e0e0] font-sans flex flex-col">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/create" element={<CreateCapsule />} />
          <Route path="/explore" element={<ExploreCapsules />} />
          <Route path="/capsule/:id" element={<CapsuleDetails />} />
          <Route path="/my-capsules" element={<MyCapsules />} />
        </Routes>
      </div>
    </Web3Provider>
  );
}

