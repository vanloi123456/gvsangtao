import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../firebase';
import { EducationalApp, InteractiveGame, ScienceExperiment } from '../types';

export const APPS_COLLECTION = 'apps';
export const GAMES_COLLECTION = 'games';
export const SIMS_COLLECTION = 'simulations';

// --- APPS API ---

export const subscribeToApps = (
  onData: (apps: EducationalApp[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = APPS_COLLECTION;
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      snapshot => {
        const items: EducationalApp[] = [];
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<EducationalApp, 'id'>) });
        });
        onData(items);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
};

export const saveAppToFirestore = async (app: EducationalApp): Promise<void> => {
  const path = `${APPS_COLLECTION}/${app.id}`;
  try {
    const user = auth.currentUser;
    const authorId = app.authorId || user?.uid || 'anonymous_teacher';
    const authorName = app.authorName || user?.displayName || 'Thầy/Cô giáo';
    const authorEmail = app.authorEmail || user?.email || '';

    const payload = {
      title: app.title,
      developer: app.developer || 'Giáo viên sáng tạo',
      description: app.description,
      category: app.category,
      categoryLabel: app.categoryLabel,
      gradeLevel: app.gradeLevel,
      gradeLabel: app.gradeLabel,
      url: app.url,
      guideTips: app.guideTips || '',
      tags: Array.isArray(app.tags) ? app.tags.join(', ') : app.tags || '',
      authorId,
      authorName,
      authorEmail,
      imageUrl: app.imageUrl || '',
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, APPS_COLLECTION, app.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteAppFromFirestore = async (appId: string): Promise<void> => {
  const path = `${APPS_COLLECTION}/${appId}`;
  try {
    await deleteDoc(doc(db, APPS_COLLECTION, appId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- GAMES API ---

export const subscribeToGames = (
  onData: (games: InteractiveGame[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = GAMES_COLLECTION;
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      snapshot => {
        const items: InteractiveGame[] = [];
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<InteractiveGame, 'id'>) });
        });
        onData(items);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
};

export const saveGameToFirestore = async (game: InteractiveGame): Promise<void> => {
  const path = `${GAMES_COLLECTION}/${game.id}`;
  try {
    const user = auth.currentUser;
    const authorId = game.authorId || user?.uid || 'anonymous_teacher';
    const authorName = game.authorName || user?.displayName || 'Thầy/Cô giáo';
    const authorEmail = game.authorEmail || user?.email || '';

    const payload = {
      title: game.title,
      subject: game.subject,
      subjectLabel: game.subjectLabel,
      grade: game.grade,
      gradeLabel: game.gradeLabel,
      gameType: game.gameType,
      gameTypeLabel: game.gameTypeLabel,
      description: game.description,
      playMode: game.playMode,
      targetSkills: Array.isArray(game.targetSkills) ? game.targetSkills.join(', ') : game.targetSkills || '',
      externalUrl: game.externalUrl || '',
      authorId,
      authorName,
      authorEmail,
      imageUrl: game.imageUrl || '',
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, GAMES_COLLECTION, game.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteGameFromFirestore = async (gameId: string): Promise<void> => {
  const path = `${GAMES_COLLECTION}/${gameId}`;
  try {
    await deleteDoc(doc(db, GAMES_COLLECTION, gameId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

// --- SIMULATIONS API ---

export const subscribeToSimulations = (
  onData: (sims: ScienceExperiment[]) => void,
  onError?: (err: unknown) => void
) => {
  const path = SIMS_COLLECTION;
  try {
    const q = query(collection(db, path));
    return onSnapshot(
      q,
      snapshot => {
        const items: ScienceExperiment[] = [];
        snapshot.forEach(docSnap => {
          items.push({ id: docSnap.id, ...(docSnap.data() as Omit<ScienceExperiment, 'id'>) });
        });
        onData(items);
      },
      error => {
        if (onError) onError(error);
        handleFirestoreError(error, OperationType.GET, path);
      }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
};

export const saveSimulationToFirestore = async (sim: ScienceExperiment): Promise<void> => {
  const path = `${SIMS_COLLECTION}/${sim.id}`;
  try {
    const user = auth.currentUser;
    const authorId = sim.authorId || user?.uid || 'anonymous_teacher';
    const authorName = sim.authorName || user?.displayName || 'Thầy/Cô giáo';
    const authorEmail = sim.authorEmail || user?.email || '';

    const payload = {
      title: sim.title,
      subject: sim.subject,
      subjectLabel: sim.subjectLabel,
      topic: sim.topic || '',
      topicLabel: sim.topicLabel || '',
      grade: sim.grade,
      gradeLabel: sim.gradeLabel || '',
      description: sim.description,
      simMode: sim.simMode,
      learningGoals: Array.isArray(sim.learningGoals) ? sim.learningGoals.join('; ') : sim.learningGoals || '',
      externalUrl: sim.externalUrl || '',
      authorId,
      authorName,
      authorEmail,
      imageUrl: sim.imageUrl || '',
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, SIMS_COLLECTION, sim.id), payload, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteSimulationFromFirestore = async (simId: string): Promise<void> => {
  const path = `${SIMS_COLLECTION}/${simId}`;
  try {
    await deleteDoc(doc(db, SIMS_COLLECTION, simId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};
