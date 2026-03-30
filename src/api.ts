import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  where, 
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { db, auth, OperationType, handleFirestoreError } from './firebase';

export const loginWithGoogle = async () => {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user exists in Firestore, if not create as resident
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    console.log('User doc exists:', userDoc.exists());
    if (!userDoc.exists()) {
      const role = 'resident';
      console.log('Creating user doc with role:', role);
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role: role
      });
      console.log('User doc created');
      return { email: user.email, role };
    }
    const data = userDoc.data();
    console.log('User doc data:', data);
    return data;
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const logout = async () => {
  await signOut(auth);
};

const ensureAccountPlanSeeded = async () => {
  const planSnap = await getDocs(collection(db, 'account_plan'));
  if (planSnap.empty) {
    console.log('account_plan is missing or empty, running seedAccountPlan...');
    await seedAccountPlan();
  }
};

export const getDashboardData = async () => {
  try {
    await ensureAccountPlanSeeded();

    const entriesSnap = await getDocs(collection(db, 'entries'));
    const planSnap = await getDocs(collection(db, 'account_plan'));
    
    const entries = entriesSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    const accountPlan = planSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    return { entries, accountPlan };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'dashboard');
  }
};

export const getAccountPlan = async () => {
  try {
    await ensureAccountPlanSeeded();

    const snap = await getDocs(collection(db, 'account_plan'));
    console.log('Fetched account plan:', snap.docs.length, 'documents');
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (error) {
    console.error("Error fetching account plan:", error);
    return [];
  }
};

export const createEntry = async (entry: any) => {
  try {
    const currentUser = auth.currentUser;
    console.debug('createEntry currentUser:', currentUser?.uid, currentUser?.email, currentUser?.isAnonymous);

    if (!currentUser) {
      throw new Error('User not authenticated when creating entry');
    }

    const docRef = await addDoc(collection(db, 'entries'), {
      ...entry,
      createdAt: new Date().toISOString(),
      uid: currentUser.uid,
    });
    return { id: docRef.id };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'entries');
  }
};

export const updateEntry = async (id: string, entry: any) => {
  try {
    await updateDoc(doc(db, 'entries', id), entry);
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `entries/${id}`);
  }
};

export const deleteEntry = async (id: string) => {
  try {
    await deleteDoc(doc(db, 'entries', id));
    return { success: true };
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `entries/${id}`);
  }
};

// Seeding function for initial setup
export const resetAccountPlan = async () => {
  try {
    const planSnap = await getDocs(collection(db, 'account_plan'));
    const deletePromises = planSnap.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    await seedAccountPlan();
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'account_plan');
    return false;
  }
};

export const seedAccountPlan = async () => {
  console.log('Starting seedAccountPlan...');
  try {
    const planSnap = await getDocs(collection(db, 'account_plan'));
    console.log(`Checking account plan... Found ${planSnap.size} categories.`);
    if (!planSnap.empty) {
      console.log("Account plan already seeded. Skipping.");
      return;
    }

    console.log("Seeding account plan with user's static list...");
    const categories = [
      { code: "1", name: "Cota condominial", type: "income", parent_id: null },
      { code: "1.1", name: "salão", type: "income", parent_code: "1" },
      { code: "1.2", name: "Aquisições de tags", type: "income", parent_code: "1" },
      { code: "1.3", name: "Multas", type: "income", parent_code: "1" },
      
      { code: "2", name: "AJUDA DE CUSTO (síndica)", type: "expense", parent_id: null },
      
      { code: "3", name: "CONCESSIONÁRIAS", type: "expense", parent_id: null },
      { code: "3.1", name: "Despesas concessionárias", type: "expense", parent_code: "3" },
      { code: "3.1.1", name: "Água", type: "expense", parent_code: "3.1" },
      { code: "3.1.2", name: "Energia (área comum e hals)", type: "expense", parent_code: "3.1" },
      { code: "3.1.3", name: "Internet", type: "expense", parent_code: "3.1" },
      { code: "3.1.4", name: "Gas", type: "expense", parent_code: "3.1" },
      { code: "3.1.5", name: "ETE", type: "expense", parent_code: "3.1" },
      
      { code: "4", name: "CONSERVAÇÃO, MANUTENÇÃO E CONTRATOS", type: "expense", parent_id: null },
      { code: "4.1", name: "Portaria ( 5 AGPs)", type: "expense", parent_code: "4" },
      { code: "4.2", name: "Serviços Gerais( 3 ASG)", type: "expense", parent_code: "4" },
      { code: "4.3", name: "Artificie (1 )", type: "expense", parent_code: "4" },
      { code: "4.4", name: "Assistente Administrativo (1)", type: "expense", parent_code: "4" },
      { code: "4.5", name: "Limpeza, higienização e laudo ( Cisterna e Torre Dgua)", type: "expense", parent_code: "4" },
      { code: "4.6", name: "Manutenção de ar split", type: "expense", parent_code: "4" },
      { code: "4.7", name: "Manutenção de bombas (8 unid)", type: "expense", parent_code: "4" },
      { code: "4.8", name: "Manutenção de controle de acesso, cerca elétrica, interfone)", type: "expense", parent_code: "4" },
      { code: "4.9", name: "Manutenções de portes e cancelas", type: "expense", parent_code: "4" },
      { code: "4.10", name: "Manutenção de câmeras", type: "expense", parent_code: "4" },
      { code: "4.11", name: "Manutenção de piscina", type: "expense", parent_code: "4" },
      { code: "4.12", name: "Manutenção de jardim e roçagem", type: "expense", parent_code: "4" },
      { code: "4.13", name: "Manutenção de AVCB", type: "expense", parent_code: "4" },
      { code: "4.14", name: "Manutenção Sistema Communy", type: "expense", parent_code: "4" },
      { code: "4.15", name: "Manutenção SDPA", type: "expense", parent_code: "4" },
      
      { code: "5", name: "SERVIÇOS AUXILIARES À ADMINISTRAÇÃO", type: "expense", parent_id: null },
      { code: "5.1", name: "Administradora Contábil", type: "expense", parent_code: "5" },
      { code: "5.2", name: "Assessoria Jurídica", type: "expense", parent_code: "5" },
      
      { code: "6", name: "REPAROS, REPOSIÇÕES,MATERIAIS DE CONSUMO", type: "expense", parent_id: null },
      { code: "6.1", name: "Materiais elétricos/ hidráulicos", type: "expense", parent_code: "6" },
      { code: "6.2", name: "Materiais de obras e reparos", type: "expense", parent_code: "6" },
      { code: "6.3", name: "Materiais de Higiene", type: "expense", parent_code: "6" },
      
      { code: "7", name: "DESPESAS FINANCEIRAS/ADMINISTRATIVAS", type: "expense", parent_id: null },
      { code: "7.1", name: "Tarifas bancárias", type: "expense", parent_code: "7" },
      { code: "7.2", name: "Reprodução de documentos", type: "expense", parent_code: "7" },
      { code: "7.3", name: "Custas Cartoriais", type: "expense", parent_code: "7" },
      { code: "7.4", name: "Certificado Digital", type: "expense", parent_code: "7" },
      
      { code: "8", name: "ENCARGOS, TRIBUTOS E RETENÇÕES", type: "expense", parent_id: null },
      { code: "8.1", name: "Receita Federal, ISS, outros", type: "expense", parent_code: "8" },
      
      { code: "9", name: "SEGUROS", type: "expense", parent_id: null },
      { code: "9.1", name: "Seguro Predial ( Tokio)", type: "expense", parent_code: "9" },
      
      { code: "10", name: "FUNDO DE RESERVA", type: "expense", parent_id: null },
    ];

    const codeToId: any = {};
    for (const cat of categories) {
      const { parent_code, ...rest } = cat;
      const parentIdFromMap = parent_code ? codeToId[parent_code] : null;
      const parent_id = parent_code ? (parentIdFromMap || null) : (cat.parent_id ?? null);

      const payload: any = {
        code: cat.code,
        name: cat.name,
        type: cat.type,
      };
      if (parent_id !== undefined && parent_id !== null) {
        payload.parent_id = parent_id;
      }

      try {
        const docRef = await addDoc(collection(db, 'account_plan'), payload);
        codeToId[cat.code] = docRef.id;
        console.log(`Added category: ${cat.code} - ${cat.name}`);
      } catch (error) {
        console.error(`Failed to add category ${cat.code}:`, error);
      }
    }
    console.log("Seeding complete.");
  } catch (error) {
    console.error("Seeding failed:", error);
  }
};
