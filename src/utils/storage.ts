// Types for our data
export interface Vaccination {
  id: string;
  animalId: string;
  age: number;
  sex: 'male' | 'female';
  isPregnant?: boolean;
  ownerPhone: string;
  vaccineTime: string;
  vaccineType: string;
  doses: {
    number: number;
    date: string;
    administered: boolean;
  }[];
  species: AnimalSpecies;
  notes?: string;
}

export interface TestProcedure {
  id: string;
  name: string;
  steps: string[];
  targetAnimals: AnimalSpecies[];
  ageRange: {
    min: number;
    max: number;
  };
}

export interface Drug {
  id: string;
  name: string;
  dosages: {
    species: AnimalSpecies;
    dosage: number; // mg/kg
  }[];
  routes: AdministrationRoute[];
}

export interface Prescription {
  id: string;
  animalId: string;
  species: AnimalSpecies;
  weight: number;
  drugs: {
    drugId: string;
    route: AdministrationRoute;
    calculatedDose: number;
  }[];
  date: string;
}

export type AnimalSpecies = 'sheep' | 'goat' | 'camel' | 'horse' | 'cat' | 'dog' | 'cow' | 'buffalo' | 'custom';
export type AdministrationRoute = 'sc' | 'im' | 'oral' | 'iv' | 'aural' | 'topical';

// LocalStorage keys
const STORAGE_KEYS = {
  VACCINATIONS: 'infectious_butterfly_vaccinations',
  TESTS: 'infectious_butterfly_tests',
  DRUGS: 'infectious_butterfly_drugs',
  PRESCRIPTIONS: 'infectious_butterfly_prescriptions',
  THEME: 'infectious_butterfly_theme',
};

// Helper functions for localStorage
export const storage = {
  getVaccinations: (): Vaccination[] => {
    const data = localStorage.getItem(STORAGE_KEYS.VACCINATIONS);
    return data ? JSON.parse(data) : [];
  },
  
  saveVaccination: (vaccination: Vaccination) => {
    const vaccinations = storage.getVaccinations();
    const existingIndex = vaccinations.findIndex(v => v.id === vaccination.id);
    
    if (existingIndex >= 0) {
      vaccinations[existingIndex] = vaccination;
    } else {
      vaccinations.push(vaccination);
    }
    
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(vaccinations));
    return vaccination;
  },
  
  deleteVaccination: (id: string) => {
    const vaccinations = storage.getVaccinations();
    const updated = vaccinations.filter(v => v.id !== id);
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(updated));
  },
  
  getTests: (): TestProcedure[] => {
    const data = localStorage.getItem(STORAGE_KEYS.TESTS);
    return data ? JSON.parse(data) : [];
  },
  
  saveTest: (test: TestProcedure) => {
    const tests = storage.getTests();
    const existingIndex = tests.findIndex(t => t.id === test.id);
    
    if (existingIndex >= 0) {
      tests[existingIndex] = test;
    } else {
      tests.push(test);
    }
    
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(tests));
    return test;
  },
  
  deleteTest: (id: string) => {
    const tests = storage.getTests();
    const updated = tests.filter(t => t.id !== id);
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(updated));
  },
  
  getDrugs: (): Drug[] => {
    const data = localStorage.getItem(STORAGE_KEYS.DRUGS);
    return data ? JSON.parse(data) : [];
  },
  
  saveDrug: (drug: Drug) => {
    const drugs = storage.getDrugs();
    if (!drug.routes || !Array.isArray(drug.routes)) {
      drug.routes = []; // Initialize as empty array if undefined
    }
    
    const existingIndex = drugs.findIndex(d => d.id === drug.id);
    
    if (existingIndex >= 0) {
      drugs[existingIndex] = drug;
    } else {
      drugs.push(drug);
    }
    
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(drugs));
    return drug;
  },
  
  deleteDrug: (id: string) => {
    const drugs = storage.getDrugs();
    const updated = drugs.filter(d => d.id !== id);
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(updated));
  },
  
  getPrescriptions: (): Prescription[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRESCRIPTIONS);
    return data ? JSON.parse(data) : [];
  },
  
  savePrescription: (prescription: Prescription) => {
    const prescriptions = storage.getPrescriptions();
    const existingIndex = prescriptions.findIndex(p => p.id === prescription.id);
    
    if (existingIndex >= 0) {
      prescriptions[existingIndex] = prescription;
    } else {
      prescriptions.push(prescription);
    }
    
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(prescriptions));
    return prescription;
  },
  
  deletePrescription: (id: string) => {
    const prescriptions = storage.getPrescriptions();
    const updated = prescriptions.filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(updated));
  },
  
  getTheme: (): 'light' | 'dark' => {
    const theme = localStorage.getItem(STORAGE_KEYS.THEME);
    return theme === 'dark' ? 'dark' : 'light';
  },
  
  setTheme: (theme: 'light' | 'dark') => {
    localStorage.setItem(STORAGE_KEYS.THEME, theme);
  },
  
  exportData: () => {
    const data = {
      vaccinations: storage.getVaccinations(),
      tests: storage.getTests(),
      drugs: storage.getDrugs(),
      prescriptions: storage.getPrescriptions(),
    };
    
    return JSON.stringify(data);
  },
  
  importData: (jsonString: string) => {
    try {
      const data = JSON.parse(jsonString);
      
      if (data.vaccinations) {
        localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(data.vaccinations));
      }
      
      if (data.tests) {
        localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(data.tests));
      }
      
      if (data.drugs) {
        localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(data.drugs));
      }
      
      if (data.prescriptions) {
        localStorage.setItem(STORAGE_KEYS.PRESCRIPTIONS, JSON.stringify(data.prescriptions));
      }
      
      return true;
    } catch (e) {
      console.error('Failed to import data:', e);
      return false;
    }
  },
};

// Initial data for demonstration
export const initializeDemoData = () => {
  // Only initialize if we don't have any data yet
  if (storage.getVaccinations().length === 0) {
    const sampleVaccinations: Vaccination[] = [
      {
        id: '1',
        animalId: 'COW-001',
        age: 2,
        sex: 'female',
        isPregnant: false,
        ownerPhone: '555-1234',
        vaccineTime: new Date().toISOString(),
        vaccineType: 'FMD Vaccine',
        doses: [
          { number: 1, date: new Date().toISOString(), administered: true },
          { number: 2, date: new Date(Date.now() + 7 * 86400000).toISOString(), administered: false }
        ],
        species: 'cow',
        notes: 'First vaccination'
      }
    ];
    
    localStorage.setItem(STORAGE_KEYS.VACCINATIONS, JSON.stringify(sampleVaccinations));
  }
  
  if (storage.getTests().length === 0) {
    const sampleTests: TestProcedure[] = [
      {
        id: '1',
        name: 'Tuberculosis Test',
        steps: [
          'Clean the area with antiseptic',
          'Measure 2mm of tuberculin',
          'Inject intradermally',
          'Check for reaction after 72 hours'
        ],
        targetAnimals: ['cow', 'buffalo'],
        ageRange: { min: 1, max: 10 }
      }
    ];
    
    localStorage.setItem(STORAGE_KEYS.TESTS, JSON.stringify(sampleTests));
  }
  
  if (storage.getDrugs().length === 0) {
    const sampleDrugs: Drug[] = [
      {
        id: '1',
        name: 'Amoxicillin',
        dosages: [
          { species: 'cow', dosage: 7 },
          { species: 'dog', dosage: 10 },
          { species: 'cat', dosage: 8 },
        ],
        routes: ['im', 'oral']
      }
    ];
    
    localStorage.setItem(STORAGE_KEYS.DRUGS, JSON.stringify(sampleDrugs));
  }
};
