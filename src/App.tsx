/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, EducationalApp, InteractiveGame, ScienceExperiment } from './types';
import { INITIAL_APPS, INITIAL_GAMES, INITIAL_EXPERIMENTS } from './data/initialData';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AppsView } from './components/AppsView';
import { GamesView } from './components/GamesView';
import { SimulationsView } from './components/SimulationsView';
import { AddResourceModal } from './components/AddResourceModal';

// Firebase Authentication & Firestore Service
import { auth, signInWithGoogle, logOut, onAuthUpdate } from './firebase';
import { User } from 'firebase/auth';
import {
  subscribeToApps,
  saveAppToFirestore,
  deleteAppFromFirestore,
  subscribeToGames,
  saveGameToFirestore,
  deleteGameFromFirestore,
  subscribeToSimulations,
  saveSimulationToFirestore,
  deleteSimulationFromFirestore
} from './services/firestoreService';

// Interactive Games Modals
import { WheelGame } from './components/games/WheelGame';
import { QuizRelayGame } from './components/games/QuizRelayGame';
import { CardMatchGame } from './components/games/CardMatchGame';

// Interactive Simulations Modals
import { WaterCycleSim } from './components/simulations/WaterCycleSim';
import { MagnetSim } from './components/simulations/MagnetSim';
import { ColorMixingSim } from './components/simulations/ColorMixingSim';
import { LeverBalanceSim } from './components/simulations/LeverBalanceSim';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<EducationalApp | InteractiveGame | ScienceExperiment | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Firebase User
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthUpdate(user => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      alert('Không thể hoàn tất đăng nhập Google. Vui lòng thử lại.');
    }
  };

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (err) {
      console.error('Sign Out Error:', err);
    }
  };

  // Resources state: cleared of samples, keeping only user-added items + Water Cycle simulation
  const [apps, setApps] = useState<EducationalApp[]>(() => {
    try {
      const saved = localStorage.getItem('gvsangtao_apps_v3');
      if (saved) return JSON.parse(saved);
      // Clean old samples from previous keys
      const oldSaved = localStorage.getItem('gvsangtao_apps');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        // keep only custom additions by teacher
        return parsed.filter((item: EducationalApp) => item.isCustom);
      }
      return INITIAL_APPS;
    } catch {
      return INITIAL_APPS;
    }
  });

  const [games, setGames] = useState<InteractiveGame[]>(() => {
    try {
      const saved = localStorage.getItem('gvsangtao_games_v3');
      if (saved) return JSON.parse(saved);
      const oldSaved = localStorage.getItem('gvsangtao_games');
      if (oldSaved) {
        const parsed = JSON.parse(oldSaved);
        return parsed.filter((item: InteractiveGame) => item.isCustom);
      }
      return INITIAL_GAMES;
    } catch {
      return INITIAL_GAMES;
    }
  });

  const [simulations, setSimulations] = useState<ScienceExperiment[]>(() => {
    try {
      const saved = localStorage.getItem('gvsangtao_simulations_v3');
      if (saved) return JSON.parse(saved);
      const oldSaved = localStorage.getItem('gvsangtao_simulations');
      if (oldSaved) {
        const parsed: ScienceExperiment[] = JSON.parse(oldSaved);
        const filtered = parsed.filter(item => item.id === 'exp-water-cycle' || item.isCustom);
        if (filtered.length > 0) return filtered;
      }
      return INITIAL_EXPERIMENTS;
    } catch {
      return INITIAL_EXPERIMENTS;
    }
  });

  // Real-time Firestore Subscriptions
  useEffect(() => {
    const unsubApps = subscribeToApps(remoteApps => {
      setApps(remoteApps);
    });

    const unsubGames = subscribeToGames(remoteGames => {
      setGames(remoteGames);
    });

    const unsubSims = subscribeToSimulations(remoteSims => {
      // Ensure Water cycle is always preserved
      const merged = [...remoteSims];
      INITIAL_EXPERIMENTS.forEach(init => {
        if (!merged.some(m => m.id === init.id)) {
          merged.push(init);
        }
      });
      setSimulations(merged);
    });

    return () => {
      if (unsubApps) unsubApps();
      if (unsubGames) unsubGames();
      if (unsubSims) unsubSims();
    };
  }, []);

  // Save changes to localStorage as offline fallback
  useEffect(() => {
    try {
      localStorage.setItem('gvsangtao_apps_v3', JSON.stringify(apps));
    } catch {}
  }, [apps]);

  useEffect(() => {
    try {
      localStorage.setItem('gvsangtao_games_v3', JSON.stringify(games));
    } catch {}
  }, [games]);

  useEffect(() => {
    try {
      localStorage.setItem('gvsangtao_simulations_v3', JSON.stringify(simulations));
    } catch {}
  }, [simulations]);

  // Modal player states
  const [activeGame, setActiveGame] = useState<InteractiveGame | null>(null);
  const [activeSim, setActiveSim] = useState<ScienceExperiment | null>(null);

  const handlePlayGame = (game: InteractiveGame) => {
    if (game.playMode === 'external' && game.externalUrl) {
      window.open(game.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setActiveGame(game);
  };

  const handleExploreSim = (sim: ScienceExperiment) => {
    if (sim.simMode === 'external' && sim.externalUrl) {
      window.open(sim.externalUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    setActiveSim(sim);
  };

  // --- CRUD HANDLERS FOR APPS ---
  const handleSaveApp = async (app: EducationalApp, isEdit: boolean) => {
    const updatedApp: EducationalApp = {
      ...app,
      authorId: app.authorId || currentUser?.uid || 'guest_teacher',
      authorName: app.authorName || currentUser?.displayName || 'Thầy/Cô giáo',
      authorEmail: app.authorEmail || currentUser?.email || ''
    };

    if (isEdit) {
      setApps(prev => prev.map(item => (item.id === app.id ? updatedApp : item)));
    } else {
      setApps(prev => [updatedApp, ...prev]);
    }

    try {
      await saveAppToFirestore(updatedApp);
    } catch (err) {
      console.warn('Saved to local storage, Firestore sync notice:', err);
    }

    setCurrentTab('apps');
    setEditItem(null);
  };

  const handleDeleteApp = async (appId: string) => {
    setApps(prev => prev.filter(a => a.id !== appId));
    try {
      await deleteAppFromFirestore(appId);
    } catch (err) {
      console.warn('Deleted locally, Firestore sync notice:', err);
    }
  };

  // --- CRUD HANDLERS FOR GAMES ---
  const handleSaveGame = async (game: InteractiveGame, isEdit: boolean) => {
    const updatedGame: InteractiveGame = {
      ...game,
      authorId: game.authorId || currentUser?.uid || 'guest_teacher',
      authorName: game.authorName || currentUser?.displayName || 'Thầy/Cô giáo',
      authorEmail: game.authorEmail || currentUser?.email || ''
    };

    if (isEdit) {
      setGames(prev => prev.map(item => (item.id === game.id ? updatedGame : item)));
    } else {
      setGames(prev => [updatedGame, ...prev]);
    }

    try {
      await saveGameToFirestore(updatedGame);
    } catch (err) {
      console.warn('Saved locally, Firestore sync notice:', err);
    }

    setCurrentTab('games');
    setEditItem(null);
  };

  const handleDeleteGame = async (gameId: string) => {
    setGames(prev => prev.filter(g => g.id !== gameId));
    try {
      await deleteGameFromFirestore(gameId);
    } catch (err) {
      console.warn('Deleted locally, Firestore sync notice:', err);
    }
  };

  // --- CRUD HANDLERS FOR SIMULATIONS ---
  const handleSaveExperiment = async (sim: ScienceExperiment, isEdit: boolean) => {
    const updatedSim: ScienceExperiment = {
      ...sim,
      authorId: sim.authorId || currentUser?.uid || 'guest_teacher',
      authorName: sim.authorName || currentUser?.displayName || 'Thầy/Cô giáo',
      authorEmail: sim.authorEmail || currentUser?.email || ''
    };

    if (isEdit) {
      setSimulations(prev => prev.map(item => (item.id === sim.id ? updatedSim : item)));
    } else {
      setSimulations(prev => [updatedSim, ...prev]);
    }

    try {
      await saveSimulationToFirestore(updatedSim);
    } catch (err) {
      console.warn('Saved locally, Firestore sync notice:', err);
    }

    setCurrentTab('simulations');
    setEditItem(null);
  };

  const handleDeleteSimulation = async (simId: string) => {
    setSimulations(prev => prev.filter(s => s.id !== simId));
    try {
      await deleteSimulationFromFirestore(simId);
    } catch (err) {
      console.warn('Deleted locally, Firestore sync notice:', err);
    }
  };

  const handleTabSelect = (tab: NavTab) => {
    setCurrentTab(tab);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#f0f7ff] text-slate-800">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={handleTabSelect}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
        counts={{
          apps: apps.length,
          games: games.length,
          simulations: simulations.length
        }}
      />

      {/* Main Layout Area */}
      <div
        className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${
          isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'
        }`}
      >
        {/* Sticky Top Header with Auth */}
        <Header
          currentTab={currentTab}
          currentUser={currentUser}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenAddModal={() => {
            setEditItem(null);
            setIsAddModalOpen(true);
          }}
          onSignIn={handleSignIn}
          onSignOut={handleSignOut}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Dynamic Main Content Container with pb-20 for fixed footer space */}
        <main className="flex-1 px-4 py-6 md:px-8 max-w-7xl w-full mx-auto pb-24">
          {currentTab === 'home' && (
            <HomeView
              onSelectTab={handleTabSelect}
              featuredApps={apps.slice(0, 3)}
              featuredGames={games}
              featuredSimulations={simulations}
              onPlayGame={handlePlayGame}
              onExploreSimulation={handleExploreSim}
            />
          )}

          {currentTab === 'apps' && (
            <AppsView
              apps={apps}
              onOpenAddModal={() => {
                setEditItem(null);
                setIsAddModalOpen(true);
              }}
              onEditApp={app => {
                setEditItem(app);
                setIsAddModalOpen(true);
              }}
              onDeleteApp={handleDeleteApp}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentTab === 'games' && (
            <GamesView
              games={games}
              onPlayGame={handlePlayGame}
              onOpenAddModal={() => {
                setEditItem(null);
                setIsAddModalOpen(true);
              }}
              onEditGame={game => {
                setEditItem(game);
                setIsAddModalOpen(true);
              }}
              onDeleteGame={handleDeleteGame}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}

          {currentTab === 'simulations' && (
            <SimulationsView
              simulations={simulations}
              onExploreSimulation={handleExploreSim}
              onOpenAddModal={() => {
                setEditItem(null);
                setIsAddModalOpen(true);
              }}
              onEditSimulation={sim => {
                setEditItem(sim);
                setIsAddModalOpen(true);
              }}
              onDeleteSimulation={handleDeleteSimulation}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
            />
          )}
        </main>

        {/* Fixed Footer at the bottom */}
        <Footer isSidebarCollapsed={isSidebarCollapsed} />
      </div>

      {/* Add / Edit Resource Modal */}
      {isAddModalOpen && (
        <AddResourceModal
          initialType={currentTab === 'games' ? 'game' : currentTab === 'simulations' ? 'experiment' : 'app'}
          editItem={editItem}
          onClose={() => {
            setIsAddModalOpen(false);
            setEditItem(null);
          }}
          onSaveApp={handleSaveApp}
          onSaveGame={handleSaveGame}
          onSaveExperiment={handleSaveExperiment}
        />
      )}

      {/* Active Game Players */}
      {activeGame && (
        <>
          {activeGame.gameType === 'wheel' && (
            <WheelGame onClose={() => setActiveGame(null)} />
          )}
          {activeGame.gameType === 'quiz' && (
            <QuizRelayGame onClose={() => setActiveGame(null)} />
          )}
          {activeGame.gameType === 'matching' && (
            <CardMatchGame onClose={() => setActiveGame(null)} />
          )}
        </>
      )}

      {/* Active Science Simulations */}
      {activeSim && (
        <>
          {activeSim.simMode === 'water_cycle' && (
            <WaterCycleSim onClose={() => setActiveSim(null)} />
          )}
          {activeSim.simMode === 'magnet' && (
            <MagnetSim onClose={() => setActiveSim(null)} />
          )}
          {activeSim.simMode === 'colors' && (
            <ColorMixingSim onClose={() => setActiveSim(null)} />
          )}
          {activeSim.simMode === 'balance' && (
            <LeverBalanceSim onClose={() => setActiveSim(null)} />
          )}
        </>
      )}
    </div>
  );
}
