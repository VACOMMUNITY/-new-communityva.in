import fs from "fs";
import path from "path";

export interface StudentRegistrationRecord {
  id: string;
  type: "STUDENT";
  application_reference: string;
  full_name: string;
  email: string;
  mobile: string;
  college_name: string;
  university?: string;
  branch: string;
  study_year: string;
  city: string;
  interests: string[];
  reason: string;
  status: "PENDING" | "APPROVED" | "UNDER_REVIEW" | "REJECTED";
  created_at: string;
}

export interface VolunteerRegistrationRecord {
  id: string;
  type: "VOLUNTEER";
  application_reference: string;
  full_name: string;
  email: string;
  mobile: string;
  college_name: string;
  branch: string;
  study_year: string;
  preferred_divisions: string[];
  skills: string;
  availability: string;
  motivation: string;
  status: "PENDING" | "APPROVED" | "UNDER_REVIEW" | "REJECTED";
  created_at: string;
}

export interface CollegeRegistrationRecord {
  id: string;
  type: "COLLEGE";
  application_reference: string;
  institution_name: string;
  contact_person: string;
  designation: string;
  email: string;
  mobile: string;
  city: string;
  state: string;
  approximate_students?: string | number;
  mou_interested: boolean;
  message?: string;
  status: "PENDING" | "APPROVED" | "UNDER_REVIEW" | "REJECTED";
  created_at: string;
}

export interface PartnerRegistrationRecord {
  id: string;
  type: "PARTNER";
  application_reference: string;
  organization_name: string;
  industry?: string;
  contact_person: string;
  designation: string;
  email: string;
  mobile: string;
  website?: string;
  sponsorship_tier?: string;
  interest_areas?: string[];
  message?: string;
  status: "PENDING" | "APPROVED" | "UNDER_REVIEW" | "REJECTED";
  created_at: string;
}

export interface UnifiedRegistrationItem {
  id: string;
  category: "STUDENT" | "VOLUNTEER" | "COLLEGE" | "PARTNER" | "EVENT";
  reference: string;
  titleOrName: string;
  email: string;
  mobile: string;
  organizationOrCollege: string;
  status: string;
  details: string;
  created_at: string;
  raw: any;
}

export interface RegistrationStoreData {
  students: StudentRegistrationRecord[];
  volunteers: VolunteerRegistrationRecord[];
  colleges: CollegeRegistrationRecord[];
  partners: PartnerRegistrationRecord[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const STORE_FILE = path.join(DATA_DIR, "community_registrations.json");

// Initial Seed Data for immediate testing & active portal
const SEED_DATA: RegistrationStoreData = {
  students: [],
  volunteers: [],
  colleges: [],
  partners: []
};

// Singleton storage cache in memory for serverless execution
let storeCache: RegistrationStoreData | null = (globalThis as any).__cvaRegistrationStoreCache || null;

function ensureDataFile(): RegistrationStoreData {
  if (storeCache) return storeCache;

  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(STORE_FILE)) {
      const content = fs.readFileSync(STORE_FILE, "utf8");
      const parsed = JSON.parse(content);
      storeCache = {
        students: parsed.students || [],
        volunteers: parsed.volunteers || [],
        colleges: parsed.colleges || [],
        partners: parsed.partners || []
      };
    } else {
      storeCache = JSON.parse(JSON.stringify(SEED_DATA));
      fs.writeFileSync(STORE_FILE, JSON.stringify(storeCache, null, 2), "utf8");
    }
  } catch (err) {
    console.error("[RegistrationStore] Error reading storage file, falling back to seed:", err);
    storeCache = JSON.parse(JSON.stringify(SEED_DATA));
  }

  (globalThis as any).__cvaRegistrationStoreCache = storeCache;
  return storeCache!;
}

function persistStore() {
  if (!storeCache) return;
  (globalThis as any).__cvaRegistrationStoreCache = storeCache;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_FILE, JSON.stringify(storeCache, null, 2), "utf8");
  } catch (err) {
    console.error("[RegistrationStore] Error persisting to disk:", err);
  }
}

// -----------------------------------------------------------------------------
// CRUD Operations
// -----------------------------------------------------------------------------

export function saveStudentRegistration(student: Omit<StudentRegistrationRecord, "id" | "type" | "created_at">): StudentRegistrationRecord {
  const store = ensureDataFile();
  const newRecord: StudentRegistrationRecord = {
    ...student,
    id: `stu-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: "STUDENT",
    created_at: new Date().toISOString()
  };
  store.students.unshift(newRecord);
  persistStore();
  return newRecord;
}

export function saveVolunteerRegistration(volunteer: Omit<VolunteerRegistrationRecord, "id" | "type" | "created_at">): VolunteerRegistrationRecord {
  const store = ensureDataFile();
  const newRecord: VolunteerRegistrationRecord = {
    ...volunteer,
    id: `vol-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: "VOLUNTEER",
    created_at: new Date().toISOString()
  };
  store.volunteers.unshift(newRecord);
  persistStore();
  return newRecord;
}

export function saveCollegeRegistration(college: Omit<CollegeRegistrationRecord, "id" | "type" | "created_at">): CollegeRegistrationRecord {
  const store = ensureDataFile();
  const newRecord: CollegeRegistrationRecord = {
    ...college,
    id: `col-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: "COLLEGE",
    created_at: new Date().toISOString()
  };
  store.colleges.unshift(newRecord);
  persistStore();
  return newRecord;
}

export function savePartnerRegistration(partner: Omit<PartnerRegistrationRecord, "id" | "type" | "created_at">): PartnerRegistrationRecord {
  const store = ensureDataFile();
  const newRecord: PartnerRegistrationRecord = {
    ...partner,
    id: `par-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
    type: "PARTNER",
    created_at: new Date().toISOString()
  };
  store.partners.unshift(newRecord);
  persistStore();
  return newRecord;
}

export function getStudentRegistrations(): StudentRegistrationRecord[] {
  const store = ensureDataFile();
  return store.students;
}

export function getVolunteerRegistrations(): VolunteerRegistrationRecord[] {
  const store = ensureDataFile();
  return store.volunteers;
}

export function getCollegeRegistrations(): CollegeRegistrationRecord[] {
  const store = ensureDataFile();
  return store.colleges;
}

export function getPartnerRegistrations(): PartnerRegistrationRecord[] {
  const store = ensureDataFile();
  return store.partners;
}

export function getAllCommunityRegistrations(): RegistrationStoreData {
  return ensureDataFile();
}

export function updateRegistrationStatus(
  category: "STUDENT" | "VOLUNTEER" | "COLLEGE" | "PARTNER",
  id: string,
  newStatus: "PENDING" | "APPROVED" | "UNDER_REVIEW" | "REJECTED"
): boolean {
  const store = ensureDataFile();
  let found = false;

  if (category === "STUDENT") {
    const item = store.students.find(s => s.id === id || s.application_reference === id);
    if (item) { item.status = newStatus; found = true; }
  } else if (category === "VOLUNTEER") {
    const item = store.volunteers.find(v => v.id === id || v.application_reference === id);
    if (item) { item.status = newStatus; found = true; }
  } else if (category === "COLLEGE") {
    const item = store.colleges.find(c => c.id === id || c.application_reference === id);
    if (item) { item.status = newStatus; found = true; }
  } else if (category === "PARTNER") {
    const item = store.partners.find(p => p.id === id || p.application_reference === id);
    if (item) { item.status = newStatus; found = true; }
  }

  if (found) {
    persistStore();
  }
  return found;
}
