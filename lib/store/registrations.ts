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
  students: [
    {
      id: "stu-seed-01",
      type: "STUDENT",
      application_reference: "CVA-STU-9K12-8821",
      full_name: "Sai Krishna Reddy",
      email: "saikrishna.dev@gmail.com",
      mobile: "+91 98490 12345",
      college_name: "Chaitanya Bharathi Institute of Technology (CBIT)",
      university: "Osmania University",
      branch: "Computer Science & Engineering",
      study_year: "3rd Year",
      city: "Hyderabad",
      interests: ["Full Stack Development", "AI/ML", "Open Source"],
      reason: "Passionate about building grassroots student tech communities and organizing university hackathons.",
      status: "APPROVED",
      created_at: "2026-11-20T10:30:00.000Z"
    },
    {
      id: "stu-seed-02",
      type: "STUDENT",
      application_reference: "CVA-STU-4X88-1094",
      full_name: "Pooja Sharma",
      email: "pooja.sharma.tech@gmail.com",
      mobile: "+91 98765 43210",
      college_name: "VNR Vignana Jyothi Institute of Engineering & Technology",
      university: "JNTU Hyderabad",
      branch: "Information Technology",
      study_year: "4th Year",
      city: "Hyderabad",
      interests: ["Cloud Computing", "DevOps", "Community Leadership"],
      reason: "Looking to connect with tech mentors and lead women in engineering initiatives across Telangana colleges.",
      status: "PENDING",
      created_at: "2026-11-21T14:15:00.000Z"
    },
    {
      id: "stu-seed-03",
      type: "STUDENT",
      application_reference: "CVA-STU-7A33-4921",
      full_name: "Mohammed Farhan",
      email: "farhan.m.cse@gmail.com",
      mobile: "+91 91234 56789",
      college_name: "Muffakham Jah College of Engineering and Technology",
      university: "Osmania University",
      branch: "Data Science & AI",
      study_year: "2nd Year",
      city: "Hyderabad",
      interests: ["Machine Learning", "Hackathons", "Product Design"],
      reason: "To gain hands-on industrial project exposure and collaborate with fellow Hyderabad innovators.",
      status: "APPROVED",
      created_at: "2026-11-22T09:45:00.000Z"
    }
  ],
  volunteers: [
    {
      id: "vol-seed-01",
      type: "VOLUNTEER",
      application_reference: "CVA-VOL-2L77-3310",
      full_name: "Ananya Rao",
      email: "ananya.rao.cva@gmail.com",
      mobile: "+91 99887 76655",
      college_name: "G. Narayanamma Institute of Technology & Science",
      branch: "Electronics & Communication",
      study_year: "3rd Year",
      preferred_divisions: ["Tech Team", "Event Operations"],
      skills: "React, Event Hospitality, Social Media, Public Speaking",
      availability: "Weekends and after 5 PM on weekdays",
      motivation: "Dedicated to driving social tech impact and coordinating youth forum chapters across South India.",
      status: "APPROVED",
      created_at: "2026-11-19T11:20:00.000Z"
    },
    {
      id: "vol-seed-02",
      type: "VOLUNTEER",
      application_reference: "CVA-VOL-8B41-9923",
      full_name: "Vikram Varma",
      email: "vikram.varma.vol@gmail.com",
      mobile: "+91 97654 32190",
      college_name: "Vasavi College of Engineering",
      branch: "Mechanical Engineering",
      study_year: "4th Year",
      preferred_divisions: ["Logistics", "Campus Ambassador Lead"],
      skills: "Operations Management, Vendor Coordination, Team Leadership",
      availability: "Full time during hackathon weekends",
      motivation: "Excited to support venue logistics and badge verification for large-scale innovation events.",
      status: "PENDING",
      created_at: "2026-11-22T16:00:00.000Z"
    }
  ],
  colleges: [
    {
      id: "col-seed-01",
      type: "COLLEGE",
      application_reference: "CVA-COL-5P19-7402",
      institution_name: "VNR Vignana Jyothi Institute of Engineering & Technology",
      contact_person: "Dr. K. Srinivas Rao",
      designation: "Dean of Student Affairs & Innovation",
      email: "dean.studentaffairs@vnrvjiet.in",
      mobile: "+91 94401 23456",
      city: "Hyderabad",
      state: "Telangana",
      approximate_students: 4500,
      mou_interested: true,
      message: "Inviting COMMUNITY.VA to host the 2027 regional ideathon on our campus.",
      status: "APPROVED",
      created_at: "2026-11-18T15:00:00.000Z"
    }
  ],
  partners: [
    {
      id: "par-seed-01",
      type: "PARTNER",
      application_reference: "CVA-PAR-1T90-8812",
      organization_name: "NexGen Ventures & Cloud Labs",
      industry: "Information Technology & Venture Studio",
      contact_person: "Rohan Kapoor",
      designation: "Director of Ecosystem Partnerships",
      email: "rohan@nexgenventures.io",
      mobile: "+91 99001 12233",
      website: "https://nexgenventures.io",
      sponsorship_tier: "Gold Partner (₹1,50,000)",
      interest_areas: ["Student Hackathons", "Startup Incubation", "Mentorship Programs"],
      message: "Interested in sponsoring student innovation awards and providing cloud credits for hackathon winners.",
      status: "APPROVED",
      created_at: "2026-11-17T12:00:00.000Z"
    }
  ]
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
