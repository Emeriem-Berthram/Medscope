export interface Question {
  exam: string;
  faculty: string;
  sub: string;
  topic: string;
  text: string;
  options: string[];
  correct: string;
  explanation: string;
}

export const EXAMS = [
  "NPMCN",
  "WACP",
  "WACS",
  "NPMCN-Primaries",
  "WACP-Primaries",
  "WACS-Primaries",
];

export const DEPARTMENTS = [
  "Internal Medicine",
  "Surgery",
  "Pediatrics",
  "OBGYN",
  "Radiology",
  "Orthopedics",
  "Family Medicine",
  "Psychiatry",
];

export const SURGERY_SUBS = [
  "General surgery",
  "Urology",
  "Orthopedic surgery",
  "Pediatric surgery",
  "Plastic surgery",
  "Neurosurgery",
  "Cardiothoracic surgery",
  "Trauma surgery",
];

export const PEDIATRICS_SUBS = [
  "Pediatrics infectious disease",
  "Hematology and oncology",
  "General practice",
  "Pediatric endocrinology",
  "Development and behavioural pediatrics",
  "Community pediatrics",
  "Pediatrics pulmonology",
  "Adolescent medicine",
  "ENT",
  "Pediatric dermatology",
  "Neonatology and immunization",
  "Gastroenterology",
  "Genetics",
  "Neurology",
  "Nephrology",
  "Cardiology",
  "Pediatric surgery",
  "Pediatric emergency medicine",
  "Ethics",
  "Child protection",
  "Pediatric rheumatology",
  "Allergy",
  "Emergency and critical care medicine",
];

// Sub-specialty lists by department. Add more departments here
// as their lists are confirmed.
export const SUBS: Record<string, string[]> = {
  Surgery: SURGERY_SUBS,
  Pediatrics: PEDIATRICS_SUBS,
};

// Question data is intentionally empty — questions will be uploaded later.
// Each entry follows the Question interface above: exam, faculty, sub,
// topic, text, options, correct, explanation.
export const QUESTIONS: Question[] = [];
