"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";

interface ChecklistItem {
  code: string;
  title: string;
  desc: string;
}

interface DiagnosisOption {
  value: string;
  label: string;
}

interface SlideCase {
  id: string;
  stain: string;
  indication: string;
  finding: string;
  status: string;
  statusClass: string;
}

interface SlideSpecimen {
  id: string;
  name: string;
  subType: string;
  department: "haematology" | "histopathology";
  specimenMeta: string;
  stainLabel: string;
  urgencyTag: string;
  icon: string;
  checklistName: string;
  checklistItems: ChecklistItem[];
  options: DiagnosisOption[];
  correctVal: string;
  correctFeedback: string;
  atlasPearl: string;
  nuclearGrade?: string;
  mitoticCount?: string;
  cases: SlideCase[];
}

const SLIDE_SPECIMENS: Record<string, SlideSpecimen> = {
  // ==================== HAEMATOLOGY RUNS ====================
  "pbf-sickle": {
    id: "pbf-sickle",
    name: "Sickle Cell Disease (HbSS)",
    subType: "Peripheral Blood Smear",
    department: "haematology",
    specimenMeta: "SPECIMEN #HEM-9021 • PATIENT: ADEBAYO, KEN (24M) • ANTICOAGULANT: EDTA K2",
    stainLabel: "WRIGHT-GIEMSA",
    urgencyTag: "STAT Vaso-occlusive Crisis",
    icon: "🩸",
    checklistName: "Peripheral Blood Systematic Review",
    checklistItems: [
      { code: "R", title: "Red Cell Morphology", desc: "Elongated crescent drepanocytes, target cells, marked anisopoikilocytosis" },
      { code: "I", title: "Inclusion Bodies", desc: "Howell-Jolly bodies (hyposplenism), nucleated red blood cells (erythroblasts)" },
      { code: "W", title: "White Cell Series", desc: "Neutrophilic leukocytosis with toxic granulation, left shift" },
      { code: "P", title: "Platelet Estimate", desc: "Adequate to elevated reactive thrombocytosis in monolayer zone" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Homozygous Sickle Cell Anemia (HbSS) in Vaso-occlusive Crisis" },
      { value: "iron", label: "Severe Microcytic Hypochromic Iron Deficiency Anemia" },
      { value: "g6pd", label: "Acute Hemolytic Anemia secondary to G6PD Deficiency with Heinz bodies" },
      { value: "normal", label: "Normal normocytic normochromic peripheral blood film" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Classic sickled erythrocytes (drepanocytes) with irreversible crescent elongation, target cells (codocytes), and basophilic Howell-Jolly nuclear remnants indicating functional asplenia.",
    atlasPearl:
      "Pathognomonic sickle cells result from polymerization of deoxygenated HbS into long insoluble tactoid crystals. Howell-Jolly bodies confirm autosplenectomy.",
    cases: [
      { id: "HEM-9021", stain: "Wright-Giemsa PBF", indication: "24M known HbSS, severe bone pain in extremities, acute drop in Hb to 6.2 g/dL.", finding: "Abundant classic drepanocytes & Howell-Jolly bodies", status: "In progress", statusClass: "bg-amber-50 text-amber-700 border border-amber-200" },
      { id: "HEM-9022", stain: "Wright-Giemsa PBF", indication: "19F sickle-beta thalassemia trait screening. Microcytosis workup.", finding: "Target cells & mild sickle forms", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "HEM-9023", stain: "Wright-Giemsa PBF", indication: "31M post-splenectomy traumatic rupture. Follow-up film.", finding: "Acanthocytes & Pappenheimer bodies", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  "marrow-aml": {
    id: "marrow-aml",
    name: "Acute Myeloid Leukemia (AML)",
    subType: "Bone Marrow Aspirate",
    department: "haematology",
    specimenMeta: "SPECIMEN #BMA-4102 • PATIENT: OKORO, CHINEDU (58M) • ILIAC CREST CORE & SMEAR",
    stainLabel: "ROMANOWSKY & MYELOPEROXIDASE",
    urgencyTag: "Critical Panic Blast Value",
    icon: "🧫",
    checklistName: "Bone Marrow Aspirate Evaluation",
    checklistItems: [
      { code: "C", title: "Marrow Cellularity", desc: "Markedly hypercellular (>90%), suppression of erythroid series" },
      { code: "B", title: "Blast Percentage", desc: "Monotonous proliferation of large myeloblasts (>20% total marrow nucleated cells)" },
      { code: "A", title: "Auer Rods & Cytoplasm", desc: "Linear crystalline azurophilic needles inside immature blast cytoplasm" },
      { code: "M", title: "Megakaryocytes", desc: "Severe megakaryocytic hypoplasia and thrombocytopenic background" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Acute Myeloid Leukemia (AML, FAB M2/M3) with Cytoplasmic Auer Rods" },
      { value: "all", label: "Acute Lymphoblastic Leukemia (B-ALL, L1 small blast subtype)" },
      { value: "cml", label: "Chronic Myeloid Leukemia (CML) in chronic neutrophilic phase" },
      { value: "myeloma", label: "Multiple Myeloma with atypical eccentric plasma cells" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Hypercellular marrow replaced by >40% large myeloblasts with high N:C ratio, open vesicular chromatin, prominent nucleoli, and pathognomonic Auer rods.",
    atlasPearl:
      "Auer rods represent fused crystalline aggregates of primary lysosomal azurophilic granules and are strictly diagnostic of myeloid lineage (AML / APL).",
    cases: [
      { id: "BMA-4102", stain: "Romanowsky Aspirate", indication: "58M fatigue, epistaxis, petechiae, WBC 68x10^9/L, platelet count 18x10^9/L.", finding: ">35% Myeloblasts with crystalline Auer rods", status: "In progress", statusClass: "bg-rose-50 text-rose-700 border border-rose-200" },
      { id: "BMA-4103", stain: "Leishman Smear", indication: "42F severe pancytopenia with gingival hyperplasia.", finding: "Monoblasts & Promonocytes with folded nuclei", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "BMA-4104", stain: "Prussian Blue Stain", indication: "66M refractory anemia, evaluate ring sideroblasts.", finding: "Perinuclear iron granules in erythroblasts", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  "malaria-thick-thin": {
    id: "malaria-thick-thin",
    name: "Plasmodium falciparum Malaria",
    subType: "Giemsa Blood Film (Thin/Thick)",
    department: "haematology",
    specimenMeta: "SPECIMEN #MAL-1184 • PATIENT: NWOSU, AMARA (28F) • THIN FILM MONOLAYER",
    stainLabel: "GIEMSA 10% (pH 7.2)",
    urgencyTag: "High Parasitemia Warning",
    icon: "🦟",
    checklistName: "Blood Parasite Microscopic Protocol",
    checklistItems: [
      { code: "R", title: "Ring Trophozoites", desc: "Delicate ring forms with red chromatin dot and blue cytoplasm ring" },
      { code: "M", title: "Multiple Infestation", desc: "Multiple ring forms per individual erythrocyte, appliqué/accole forms" },
      { code: "G", title: "Gametocytes", desc: "Crescentic or banana-shaped gametocytes with central pigment granules" },
      { code: "E", title: "RBC Sparing", desc: "Invasion of erythrocytes of all ages, no host cell enlargement" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Plasmodium falciparum Severe Malaria with Delicate Ring Forms" },
      { value: "vivax", label: "Plasmodium vivax with Schüffner's dots & enlarged amoeboid RBCs" },
      { value: "tryp", label: "African Trypanosomiasis with flagellated extracellular trypomastigotes" },
      { value: "negative", label: "Negative film: No hemoparasites seen after 100 oil immersion fields" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Delicate signet-ring intraerythrocytic trophozoites of Plasmodium falciparum with double chromatin dots and accole forms along the red cell periphery.",
    atlasPearl:
      "P. falciparum can invade RBCs of any age (unlike P. vivax which prefers reticulocytes), leading to very high parasitemia levels exceeding 5-10% and cerebral sequestration.",
    cases: [
      { id: "MAL-1184", stain: "Giemsa Thin Film", indication: "28F tertiary febrile paroxysms, rigors, headache, jaundice, Hb 7.8 g/dL.", finding: "P. falciparum ring forms with 4.8% parasitemia", status: "In progress", statusClass: "bg-amber-50 text-amber-700 border border-amber-200" },
      { id: "MAL-1185", stain: "Giemsa Thick Film", indication: "4M lethargy and high fever following travel to rural endemic zone.", finding: "High-density asexual ring forms per high power field", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "MAL-1186", stain: "Field's Stain Smear", indication: "35M routine pre-employment health screening in tropics.", finding: "No hemoparasites identified in 200 fields", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  "iron-def": {
    id: "iron-def",
    name: "Microcytic Hypochromic Anemia",
    subType: "Peripheral Blood Smear",
    department: "haematology",
    specimenMeta: "SPECIMEN #HEM-3349 • PATIENT: BELLO, FATIMA (32F) • EDTA WHOLE BLOOD",
    stainLabel: "WRIGHT-GIEMSA",
    urgencyTag: "Severe Nutritional Deficit",
    icon: "🔬",
    checklistName: "Red Cell Morphology Protocol",
    checklistItems: [
      { code: "M", title: "Microcytosis", desc: "RBC diameter distinctly smaller than the nucleus of a small mature lymphocyte" },
      { code: "H", title: "Hypochromia", desc: "Exaggerated central pallor exceeding more than one-third of the RBC diameter" },
      { code: "P", title: "Poikilocytosis", desc: "Elongated pencil/cigar-shaped red cells and occasional ovalocytes" },
      { code: "T", title: "Platelets", desc: "Reactive thrombocytosis frequently accompanying chronic iron deficiency" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Microcytic Hypochromic Anemia consistent with Iron Deficiency (IDA)" },
      { value: "thal", label: "Beta Thalassemia Major with numerous basophilic stippled cells" },
      { value: "megalo", label: "Megaloblastic Macrocytic Anemia with hypersegmented neutrophils" },
      { value: "spherocytosis", label: "Hereditary Spherocytosis with hyperdense round erythrocytes" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Striking microcytic hypochromic erythrocyte morphology with marked central pallor ('doughnut cells') and characteristic pencil/cigar cells.",
    atlasPearl:
      "Always measure RBC size against a resting mature lymphocyte nucleus (~7-8 µm). In IDA, cells are tiny with wide pallor, whereas spherocytes lack central pallor completely.",
    cases: [
      { id: "HEM-3349", stain: "Wright-Giemsa PBF", indication: "32F menorrhagia, pica for ice, angular cheilitis, MCV 61 fL, MCH 19 pg.", finding: "Marked hypochromia, microcytosis & pencil cells", status: "In progress", statusClass: "bg-amber-50 text-amber-700 border border-amber-200" },
      { id: "HEM-3350", stain: "Wright-Giemsa PBF", indication: "12M microcytic anemia unresponsive to oral iron therapy.", finding: "Prominent basophilic stippling & target cells", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "HEM-3351", stain: "Wright-Giemsa PBF", indication: "48F chronic rheumatoid arthritis with normocytic/mild microcytic indices.", finding: "Mild hypochromia without pencil poikilocytosis", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  // ==================== HISTOPATHOLOGY RUNS ====================
  "idc-breast": {
    id: "idc-breast",
    name: "Invasive Ductal Carcinoma (IDC)",
    subType: "Core Needle Breast Biopsy",
    department: "histopathology",
    specimenMeta: "BIOPSY #HST-7811 • PATIENT: DANJUMA, GRACE (54F) • FFPE H&E SECTION (4 µm)",
    stainLabel: "HEMATOXYLIN & EOSIN (H&E)",
    urgencyTag: "Malignant Neoplasm Sign-out",
    icon: "🔬",
    checklistName: "Histopathological Malignancy Checklist",
    checklistItems: [
      { code: "A", title: "Tissue Architecture", desc: "Loss of normal lobular architecture; haphazard infiltrative nests and cords" },
      { code: "N", title: "Nuclear Pleomorphism", desc: "Marked variation in nuclear size and shape, hyperchromatic clumped chromatin" },
      { code: "M", title: "Mitotic Activity", desc: "Frequent atypical and multipolar mitotic figures per 10 high-power fields" },
      { code: "S", title: "Desmoplastic Stroma", desc: "Dense sclerotic collagenous host stromal response surrounding tumor clusters" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Invasive Ductal Carcinoma (NST, Nottingham Grade 3) of Breast" },
      { value: "fibroadenoma", label: "Benign Intracanalicular & Pericanalicular Fibroadenoma" },
      { value: "dcis", label: "Ductal Carcinoma In Situ (DCIS) with intact myoepithelial layer" },
      { value: "fat-necrosis", label: "Traumatic Fat Necrosis with lipid-laden foamy histiocytes" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Malignant invasive epithelial neoplasm arranged in jagged infiltrative nests, syncytial cords, and abortive tubules invading through desmoplastic stroma. High nuclear grade with prominent atypical mitoses.",
    atlasPearl:
      "Nottingham Histological Grade combines three parameters (each scored 1-3): Tubule formation, Nuclear pleomorphism, and Mitotic rate. Absence of myoepithelial p63/calponin confirms invasion.",
    nuclearGrade: "Marked / Grade III",
    mitoticCount: "14 per 10 HPF",
    cases: [
      { id: "HST-7811", stain: "H&E Microtome 4 µm", indication: "54F firm irregular painless mass in upper outer quadrant of right breast (BI-RADS 5).", finding: "Infiltrative sheets of pleomorphic ductal carcinoma", status: "In progress", statusClass: "bg-rose-50 text-rose-700 border border-rose-200" },
      { id: "HST-7812", stain: "H&E Microtome 4 µm", indication: "22F well-circumscribed mobile non-tender left breast lump.", finding: "Biphasic stromal and epithelial proliferation (Fibroadenoma)", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "HST-7813", stain: "IHC (ER/PR/HER2)", indication: "60F post-mastectomy staging and receptor profile verification.", finding: "ER+ (80%), PR+ (65%), HER2 1+ negative", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  "scc-cervix": {
    id: "scc-cervix",
    name: "Squamous Cell Carcinoma (SCC)",
    subType: "Punch Biopsy (Skin / Cervix)",
    department: "histopathology",
    specimenMeta: "BIOPSY #HST-6290 • PATIENT: EKPENYONG, BLESSING (46F) • CERVICAL PUNCH",
    stainLabel: "HEMATOXYLIN & EOSIN (H&E)",
    urgencyTag: "Invasive Squamous Malignancy",
    icon: "🔬",
    checklistName: "Squamous Histopathology Protocol",
    checklistItems: [
      { code: "K", title: "Keratin Pearls", desc: "Concentric whorls of bright pink keratinized squames (horn pearls)" },
      { code: "I", title: "Intercellular Bridges", desc: "Prominent desmosomal spines visible between polygonal tumor cells" },
      { code: "B", title: "Basement Membrane", desc: "Frank breach and infiltration of atypical squamous nests into underlying dermis/stroma" },
      { code: "N", title: "Necrosis & Inflammation", desc: "Central comedo-like tumor necrosis with mixed chronic inflammatory infiltrate" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Moderately Differentiated Keratinizing Squamous Cell Carcinoma" },
      { value: "cin3", label: "Cervical Intraepithelial Neoplasia (CIN 3 / HSIL) without stromal invasion" },
      { value: "papilloma", label: "Benign Squamous Papilloma with hyperkeratotic fronds" },
      { value: "adenoma", label: "Endocervical Adenocarcinoma with mucinous differentiation" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Malignant nests of polygonal squamous cells infiltrating stroma with prominent eosinophilic keratin pearls and prickle intercellular desmosomal bridges.",
    atlasPearl:
      "Keratin pearls and intercellular bridges are the definitive histological hallmarks of squamous cell differentiation. Absence indicates poorly differentiated or sarcomatoid variants.",
    nuclearGrade: "Moderate / Grade II",
    mitoticCount: "9 per 10 HPF",
    cases: [
      { id: "HST-6290", stain: "H&E Punch Biopsy", indication: "46F postcoital bleeding, exophytic ulcerating cervical mass on speculum exam.", finding: "Invasive keratinizing squamous cell nests with pearls", status: "In progress", statusClass: "bg-rose-50 text-rose-700 border border-rose-200" },
      { id: "HST-6291", stain: "H&E Excision Biopsy", indication: "68M non-healing ulcer on lower lip with indurated borders.", finding: "Atypical squamous infiltration into orbicularis oris muscle", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "HST-6292", stain: "p16INK4a IHC", indication: "50F evaluate HPV-driven etiology in oropharyngeal squamous biopsy.", finding: "Diffuse block-positive nuclear and cytoplasmic staining", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  "tb-granuloma": {
    id: "tb-granuloma",
    name: "Caseating Granulomatous Lymphadenitis",
    subType: "Lymph Node Excision Biopsy",
    department: "histopathology",
    specimenMeta: "BIOPSY #HST-5510 • PATIENT: MUSA, HARUNA (29M) • CERVICAL LYMPH NODE",
    stainLabel: "H&E + ZIEHL-NEELSEN",
    urgencyTag: "Infectious Mycobacterial Workup",
    icon: "🔬",
    checklistName: "Granulomatous Pathology Protocol",
    checklistItems: [
      { code: "C", title: "Caseous Necrosis", desc: "Central eosinophilic, amorphous, granular, structureless debris ('cheesy' necrosis)" },
      { code: "E", title: "Epithelioid Histiocytes", desc: "Slipper-shaped vesicular nuclei with abundant pale pink cytoplasm forming palisades" },
      { code: "L", title: "Langhans Giant Cells", desc: "Horse-shoe / arcuate peripheral arrangement of multiple nuclei in multinucleate histiocytes" },
      { code: "R", title: "Lymphocytic Rim", desc: "Peripheral cuff of mature mantle zone lymphocytes and fibroblasts" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Tuberculous Caseating Granulomatous Lymphadenitis (Mycobacterial)" },
      { value: "sarcoid", label: "Non-caseating Sarcoidosis Granulomas with Schaumann bodies" },
      { value: "hodgkin", label: "Hodgkin Lymphoma with Reed-Sternberg owl-eye giant cells" },
      { value: "cat-scratch", label: "Cat Scratch Disease with stellate necrotizing microabscesses" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Confluent granulomas centered around amorphous eosinophilic caseous necrosis, surrounded by palisades of epithelioid histiocytes and classic Langhans-type multinucleated giant cells with peripheral horseshoe nuclei.",
    atlasPearl:
      "Caseous necrosis is the critical distinguishing feature from sarcoidosis (which is non-caseating). Ziehl-Neelsen or auramine-rhodamine fluorescence demonstrates acid-fast bacilli (AFB).",
    nuclearGrade: "Reactive / Benign",
    mitoticCount: "Rare / 0 per 10 HPF",
    cases: [
      { id: "HST-5510", stain: "H&E + ZN Stain", indication: "29M matted non-tender cervical lymphadenopathy ('scrofula'), drenching night sweats, weight loss.", finding: "Caseous necrosis & Langhans horseshoe giant cells", status: "In progress", statusClass: "bg-amber-50 text-amber-700 border border-amber-200" },
      { id: "HST-5511", stain: "H&E Core Biopsy", indication: "34F bilateral hilar lymphadenopathy on CXR, hypercalcemia.", finding: "Tightly formed non-caseating 'naked' granulomas", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "HST-5512", stain: "Periodic Acid-Schiff (PAS)", indication: "40M evaluate fungal granulomatous etiology (Histoplasma / Coccidioides).", finding: "PAS-negative, fungal elements not identified", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },

  "acute-appendicitis": {
    id: "acute-appendicitis",
    name: "Acute Phlegmonous Appendicitis",
    subType: "Appendix Resection Specimen",
    department: "histopathology",
    specimenMeta: "BIOPSY #HST-4019 • PATIENT: LAWAL, BASHIR (21M) • EMERGENCY APPENDECTOMY",
    stainLabel: "HEMATOXYLIN & EOSIN (H&E)",
    urgencyTag: "Acute Surgical Pathology",
    icon: "🔬",
    checklistName: "Appendiceal Inflammation Checklist",
    checklistItems: [
      { code: "N", title: "Neutrophilic Transmural Infiltrate", desc: "Polymorphonuclear neutrophils infiltrating directly through the muscularis propria" },
      { code: "U", title: "Mucosal Ulceration", desc: "Loss of surface columnar epithelium with mucosal sloughing and luminal purulent exudate" },
      { code: "V", title: "Vascular Congestion", desc: "Marked engorgement of subserosal capillaries with edema and fibrin deposition" },
      { code: "S", title: "Serositis / Peritonitis", desc: "Fibrinopurulent serosal exudate on outer peritoneal coat indicating acute phlegmon" },
    ],
    options: [
      { value: "", label: "-- Select pathological diagnosis --" },
      { value: "correct", label: "Acute Gangrenous / Phlegmonous Appendicitis with Transmural Neutrophils" },
      { value: "carcinoid", label: "Neuroendocrine Tumor (Well-differentiated Carcinoid) of Appendix Tip" },
      { value: "mucocele", label: "Appendiceal Mucinous Neoplasm (Low-grade LAMN / Mucocele)" },
      { value: "normal", label: "Unremarkable lymphoid hyperplasia without acute muscularis inflammation" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: The diagnostic gold standard of acute appendicitis: dense neutrophilic infiltrate extending beyond mucosa into the muscularis propria with mucosal necrosis and subserosal vascular congestion.",
    atlasPearl:
      "Neutrophils confined solely to the mucosa or lumen do NOT establish a diagnosis of acute appendicitis. Neutrophils invading the muscularis propria are mandatory.",
    nuclearGrade: "Acute Inflammatory",
    mitoticCount: "Reactive",
    cases: [
      { id: "HST-4019", stain: "H&E Full Cross-section", indication: "21M acute right lower quadrant peritonitis, McBurney's sign, leukocytosis 16.5x10^9/L.", finding: "Transmural neutrophils infiltrating muscularis propria", status: "In progress", statusClass: "bg-amber-50 text-amber-700 border border-amber-200" },
      { id: "HST-4020", stain: "H&E Appendix Tip", indication: "37F appendectomy during ovarian cystectomy. Incidental yellow nodule at tip.", finding: "Synaptophysin+ nested neuroendocrine cells (Carcinoid)", status: "Not started", statusClass: "bg-slate-100 text-slate-600 border border-slate-200" },
      { id: "HST-4021", stain: "H&E Cross-section", indication: "10M RLQ pain following viral upper respiratory infection.", finding: "Prominent follicular lymphoid hyperplasia without muscularis neutrophils", status: "Completed", statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200" },
    ],
  },
};

const DEMO_PATHOLOGISTS = {
  okonjo: {
    title: "Dr.",
    fullName: "Jane Okonjo",
    specialty: "Consultant Hematopathologist",
    hospital: "Apex Specialist Teaching Hospital",
    email: "jane.okonjo@apexmed.org",
  },
  eze: {
    title: "Dr.",
    fullName: "Chinedu Eze",
    specialty: "Surgical Pathology Resident",
    hospital: "University College Hospital",
    email: "c.eze@uch-pathology.edu",
  },
  jenkins: {
    title: "Dr.",
    fullName: "Sarah Jenkins",
    specialty: "Clinical Cytopathologist",
    hospital: "St. Jude Pathology Institute",
    email: "s.jenkins@stjude-path.org",
  },
};

export default function LabSlidesPage() {
  const { user } = useAuth();

  // Active Doctor state
  const [doctor, setDoctor] = useState({
    title: "Dr.",
    fullName: user?.name?.trim() || "Jane Okonjo",
    specialty: "Consultant Hematopathologist",
    hospital: "Apex Specialist Teaching Hospital • Central Pathology Lab",
    email: user?.email || "jane.okonjo@apexmed.org",
  });

  const [doctorMenuOpen, setDoctorMenuOpen] = useState(false);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signup" | "edit" | "switch">("signup");

  // Form fields
  const [formTitle, setFormTitle] = useState("Dr.");
  const [formName, setFormName] = useState(doctor.fullName);
  const [formSpec, setFormSpec] = useState(doctor.specialty);
  const [formHosp, setFormHosp] = useState(doctor.hospital);
  const [formEmail, setFormEmail] = useState(doctor.email);

  // Department Tab
  const [activeDepartment, setActiveDepartment] = useState<"haematology" | "histopathology">("haematology");
  const [activeSlideKey, setActiveSlideKey] = useState("pbf-sickle");

  // Virtual Microscope Controls
  const [activeObjective, setActiveObjective] = useState<4 | 10 | 40 | 100>(40);
  const [isGridVisible, setIsGridVisible] = useState(false);
  const [isMarkersVisible, setIsMarkersVisible] = useState(false);
  const [focusSliderVal, setFocusSliderVal] = useState(100);
  const [lightSliderVal, setLightSliderVal] = useState(100);
  const [stagePan, setStagePan] = useState({ x: 0, y: 0 });
  const [isDraggingStage, setIsDraggingStage] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });

  // 100-cell WBC Differential Counter
  const [diffCounts, setDiffCounts] = useState({
    neut: 0,
    lymph: 0,
    mono: 0,
    eos: 0,
    baso: 0,
    blast: 0,
  });

  // Systematic Review Checklist
  const [checkedChecklist, setCheckedChecklist] = useState<{ [key: string]: boolean }>({});
  const [selectedImpression, setSelectedImpression] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    correct: boolean;
    text: string;
    atlasPearl: string;
  } | null>(null);

  // KPI Metrics
  const [signedCasesCount, setSignedCasesCount] = useState(18);
  const totalCasesTarget = 25;

  // Toast
  const [toastMessage, setToastMessage] = useState("");
  const [toastIcon, setToastIcon] = useState("🔬");
  const [toastVisible, setToastVisible] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeSpecimen = SLIDE_SPECIMENS[activeSlideKey] || SLIDE_SPECIMENS["pbf-sickle"];

  const showToast = (msg: string, icon = "🔬") => {
    setToastIcon(icon);
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

  const getInitials = (name: string) => {
    const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "JO";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const switchDepartment = (dept: "haematology" | "histopathology") => {
    setActiveDepartment(dept);
    if (dept === "haematology") {
      setActiveSlideKey("pbf-sickle");
    } else {
      setActiveSlideKey("idc-breast");
    }
    setSelectedImpression("");
    setVerificationResult(null);
    setCheckedChecklist({});
    setStagePan({ x: 0, y: 0 });
  };

  const selectSlide = (key: string) => {
    setActiveSlideKey(key);
    setSelectedImpression("");
    setVerificationResult(null);
    setCheckedChecklist({});
    setStagePan({ x: 0, y: 0 });
    setIsMarkersVisible(false);
  };

  const resetStage = () => {
    setStagePan({ x: 0, y: 0 });
    setFocusSliderVal(100);
    setLightSliderVal(100);
    setActiveObjective(40);
    setIsMarkersVisible(false);
    setIsGridVisible(false);
    showToast("Virtual microscope stage centered & calibrated");
  };

  const panStage = (dx: number, dy: number) => {
    setStagePan((prev) => ({
      x: Math.max(-120, Math.min(120, prev.x + dx)),
      y: Math.max(-100, Math.min(100, prev.y + dy)),
    }));
  };

  // Differential count handlers
  const countCell = (type: keyof typeof diffCounts) => {
    setDiffCounts((prev) => {
      const currentTotal = Object.values(prev).reduce((a, b) => a + b, 0);
      if (currentTotal >= 100) {
        showToast("Differential complete: 100 cells counted! 🎯", "✅");
        return prev;
      }
      return { ...prev, [type]: prev[type] + 1 };
    });
  };

  const resetCellCounter = () => {
    setDiffCounts({ neut: 0, lymph: 0, mono: 0, eos: 0, baso: 0, blast: 0 });
    showToast("WBC differential counter reset to zero");
  };

  const totalDiffCells = Object.values(diffCounts).reduce((a, b) => a + b, 0);

  // Report verification
  const verifyCurrentReport = () => {
    if (!selectedImpression) {
      showToast("⚠️ Please select a primary pathological impression first");
      return;
    }

    const isMatch = selectedImpression === activeSpecimen.correctVal;
    if (isMatch) {
      setVerificationResult({
        correct: true,
        text: activeSpecimen.correctFeedback,
        atlasPearl: activeSpecimen.atlasPearl,
      });
      setSignedCasesCount((c) => Math.min(totalCasesTarget, c + 1));
      showToast(`Pathological report signed by ${doctor.title} ${doctor.fullName}! 🎯`, "✅");
    } else {
      setVerificationResult({
        correct: false,
        text: `✕ Diagnostic Discrepancy: The selected impression does not correlate with the key morphological findings on this ${activeSpecimen.name} slide. Scrutinize the cellular checklist and toggle the Diagnostic Pointer.`,
        atlasPearl: activeSpecimen.atlasPearl,
      });
      showToast("Diagnostic discrepancy noted. Re-evaluate cellular landmarks.", "⚠️");
    }
  };

  const quickSelectDemo = (key: "okonjo" | "eze" | "jenkins") => {
    const d = DEMO_PATHOLOGISTS[key];
    setDoctor(d);
    setFormTitle(d.title);
    setFormName(d.fullName);
    setFormSpec(d.specialty);
    setFormHosp(d.hospital);
    setFormEmail(d.email);
    setDoctorModalOpen(false);
    showToast(`Welcome, ${d.title} ${d.fullName}! Pathologist profile loaded.`);
  };

  const handleDoctorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Please enter your full name");
      return;
    }
    const updated = {
      title: formTitle,
      fullName: formName.trim(),
      specialty: formSpec,
      hospital: formHosp.trim() || "Apex Central Pathology LIS",
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, ".")}@medscope.org`,
    };
    setDoctor(updated);
    setDoctorModalOpen(false);
    showToast(`Pathologist profile updated: ${updated.title} ${updated.fullName}`);
  };

  const scrollToViewer = () => {
    const el = document.getElementById("microscopeSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // Canvas Mouse Pan Drag Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDraggingStage(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDraggingStage) return;
    const dx = (e.clientX - dragStartPos.x) * 0.4;
    const dy = (e.clientY - dragStartPos.y) * 0.4;
    setStagePan((prev) => ({
      x: Math.max(-140, Math.min(140, prev.x + dx)),
      y: Math.max(-120, Math.min(120, prev.y + dy)),
    }));
    setDragStartPos({ x: e.clientX, y: e.clientY });
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingStage(false);
  };

  // High-Definition Optical Microscopy Canvas Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const w = (rect.width || 640) * (window.devicePixelRatio || 1);
    const h = (rect.height || 420) * (window.devicePixelRatio || 1);
    canvas.width = w;
    canvas.height = h;

    const zoomMap = { 4: 0.6, 10: 1.0, 40: 2.2, 100: 3.8 };
    const zoom = zoomMap[activeObjective] || 2.2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Apply Focus Blur & Lighting Filter directly to canvas context
    const blurPx = Math.abs(focusSliderVal - 100) * 0.12;
    const brightnessPct = lightSliderVal / 100;
    ctx.filter = `blur(${blurPx}px) brightness(${brightnessPct})`;

    // Microscope Illuminated Background (Substage condenser warm halogen glow)
    const cx = w / 2;
    const cy = h / 2;
    const lampGlow = ctx.createRadialGradient(cx, cy, 30, cx, cy, w * 0.55);
    lampGlow.addColorStop(0, "#FEF9C3");
    lampGlow.addColorStop(0.7, "#FEF08A");
    lampGlow.addColorStop(1, "#E2E8F0");
    ctx.fillStyle = lampGlow;
    ctx.fillRect(0, 0, w, h);

    // Virtual Stage Position Translation & Objective Magnification
    ctx.translate(cx + stagePan.x * 2.5, cy + stagePan.y * 2.5);
    ctx.scale(zoom, zoom);

    // ==========================================
    // PROCEDURAL CELLULAR & TISSUE ARCHITECTURES
    // ==========================================
    if (activeDepartment === "haematology") {
      // 1. HAEMATOLOGY BLOOD / MARROW / PARASITE SLIDES
      if (activeSlideKey === "pbf-sickle") {
        // Sickle Cell Smear: Normal biconcave RBCs, elongated sickle cells, target cells
        for (let i = -8; i <= 8; i++) {
          for (let j = -6; j <= 6; j++) {
            const rx = i * 42 + ((j % 2) * 20);
            const ry = j * 38;

            if ((i + j) % 3 === 0) {
              // Sickle Cell (Drepanocyte)
              ctx.save();
              ctx.translate(rx, ry);
              ctx.rotate(((i * 37) % 180) * (Math.PI / 180));
              ctx.fillStyle = "#E11D48";
              ctx.beginPath();
              ctx.ellipse(0, 0, 24, 6, 0, 0, Math.PI * 2);
              ctx.fill();
              // Crescent ends
              ctx.fillStyle = "#BE123C";
              ctx.beginPath();
              ctx.arc(-20, 0, 3, 0, Math.PI * 2);
              ctx.arc(20, 0, 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.restore();
            } else if ((i + j) % 5 === 0) {
              // Target Cell (Codocyte: 'Bullseye')
              ctx.fillStyle = "#FB7185";
              ctx.beginPath();
              ctx.arc(rx, ry, 14, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#FEF9C3";
              ctx.beginPath();
              ctx.arc(rx, ry, 8, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#BE123C";
              ctx.beginPath();
              ctx.arc(rx, ry, 3.5, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Normal Biconcave Erythrocyte
              ctx.fillStyle = "#FDA4AF";
              ctx.beginPath();
              ctx.arc(rx, ry, 13, 0, Math.PI * 2);
              ctx.fill();
              // Central pallor
              ctx.fillStyle = "#FEF9C3";
              ctx.beginPath();
              ctx.arc(rx, ry, 5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Segmented Neutrophil in Center
        ctx.fillStyle = "#F3E8FF";
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
        // 3-Lobed Nucleus
        ctx.fillStyle = "#6B21A8";
        ctx.beginPath();
        ctx.arc(-8, -6, 8, 0, Math.PI * 2);
        ctx.arc(9, -4, 7, 0, Math.PI * 2);
        ctx.arc(0, 8, 8, 0, Math.PI * 2);
        ctx.fill();

        // Howell-Jolly Body in an adjacent RBC
        ctx.fillStyle = "#312E81";
        ctx.beginPath();
        ctx.arc(48, -28, 2.5, 0, Math.PI * 2);
        ctx.fill();

        if (isMarkersVisible) {
          drawPointer(ctx, 0, 0, "Drepanocytes & Segmented Neutrophil");
        }
      } else if (activeSlideKey === "marrow-aml") {
        // AML Bone Marrow: Sheets of large immature myeloblasts with Auer rods
        for (let i = -7; i <= 7; i++) {
          for (let j = -5; j <= 5; j++) {
            const bx = i * 48 + ((j % 2) * 22);
            const by = j * 44;

            // Myeloblast Pale Blue Cytoplasm
            ctx.fillStyle = "#C7D2FE";
            ctx.beginPath();
            ctx.arc(bx, by, 20, 0, Math.PI * 2);
            ctx.fill();

            // Large Vesicular Nucleus (High N:C ratio)
            ctx.fillStyle = "#4338CA";
            ctx.beginPath();
            ctx.arc(bx, by, 15, 0, Math.PI * 2);
            ctx.fill();

            // Prominent Pale Nucleoli
            ctx.fillStyle = "#E0E7FF";
            ctx.beginPath();
            ctx.arc(bx - 4, by - 3, 3, 0, Math.PI * 2);
            ctx.arc(bx + 4, by + 4, 2.5, 0, Math.PI * 2);
            ctx.fill();

            // Auer Rods (linear pink needle in center blast)
            if (i === 0 && j === 0) {
              ctx.strokeStyle = "#E11D48";
              ctx.lineWidth = 2.5;
              ctx.beginPath();
              ctx.moveTo(bx + 7, by - 8);
              ctx.lineTo(bx + 17, by - 2);
              ctx.stroke();
            }
          }
        }

        if (isMarkersVisible) {
          drawPointer(ctx, 12, -5, "Auer Rod in Myeloblast Cytoplasm");
        }
      } else if (activeSlideKey === "malaria-thick-thin") {
        // Malaria: Erythrocytes with signet ring forms and headphone trophozoites
        for (let i = -8; i <= 8; i++) {
          for (let j = -6; j <= 6; j++) {
            const rx = i * 40 + ((j % 2) * 18);
            const ry = j * 36;

            // RBC
            ctx.fillStyle = "#FCA5A5";
            ctx.beginPath();
            ctx.arc(rx, ry, 13, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#FEF9C3";
            ctx.beginPath();
            ctx.arc(rx, ry, 5, 0, Math.PI * 2);
            ctx.fill();

            // P. falciparum ring form inside infected red cells
            if ((i * 3 + j * 7) % 4 === 0) {
              // Delicate Blue Ring
              ctx.strokeStyle = "#3B82F6";
              ctx.lineWidth = 1.8;
              ctx.beginPath();
              ctx.arc(rx + 2, ry + 2, 4.5, 0, Math.PI * 2);
              ctx.stroke();

              // Red Chromatin Dot (Headphone dot)
              ctx.fillStyle = "#DC2626";
              ctx.beginPath();
              ctx.arc(rx + 2, ry - 2.5, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Banana-shaped Gametocyte
        ctx.fillStyle = "#1E40AF";
        ctx.beginPath();
        ctx.ellipse(35, 20, 18, 5, Math.PI / 4, 0, Math.PI * 2);
        ctx.fill();

        if (isMarkersVisible) {
          drawPointer(ctx, 2, 2, "P. falciparum Ring Form (Trophozoite)");
        }
      } else if (activeSlideKey === "iron-def") {
        // Iron Deficiency: Microcytic hypochromic 'doughnut' cells & pencil cells
        for (let i = -8; i <= 8; i++) {
          for (let j = -6; j <= 6; j++) {
            const rx = i * 40 + ((j % 2) * 20);
            const ry = j * 38;

            if ((i + j) % 4 === 0) {
              // Pencil / Cigar Cell
              ctx.fillStyle = "#FB7185";
              ctx.beginPath();
              ctx.ellipse(rx, ry, 15, 4, Math.PI / 3, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#FEF9C3";
              ctx.beginPath();
              ctx.ellipse(rx, ry, 11, 2, Math.PI / 3, 0, Math.PI * 2);
              ctx.fill();
            } else {
              // Markedly Hypochromic Microcyte (thin rim of hemoglobin)
              ctx.fillStyle = "#FDA4AF";
              ctx.beginPath();
              ctx.arc(rx, ry, 9, 0, Math.PI * 2);
              ctx.fill();
              ctx.fillStyle = "#FEF9C3";
              ctx.beginPath();
              ctx.arc(rx, ry, 6.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // Reactive Platelets (tiny purple dots)
        ctx.fillStyle = "#6366F1";
        for (let p = 0; p < 18; p++) {
          ctx.beginPath();
          ctx.arc(((p * 47) % 180) - 90, ((p * 31) % 140) - 70, 2, 0, Math.PI * 2);
          ctx.fill();
        }

        if (isMarkersVisible) {
          drawPointer(ctx, 0, 0, "Microcytic Hypochromic Erythrocyte & Pencil Cell");
        }
      }
    } else {
      // 2. HISTOPATHOLOGY TISSUE BIOPSY SLIDES (H&E STAINING)
      if (activeSlideKey === "idc-breast") {
        // Infiltrating Ductal Carcinoma: Dense pink collagenous stroma with malignant dark purple gland clusters
        ctx.fillStyle = "#FBCFE8"; // Eosinophilic stroma
        ctx.fillRect(-250, -200, 500, 400);

        // Collagen bands
        ctx.strokeStyle = "#F472B6";
        ctx.lineWidth = 4;
        for (let c = -180; c <= 180; c += 35) {
          ctx.beginPath();
          ctx.moveTo(-250, c);
          ctx.bezierCurveTo(-100, c + 20, 100, c - 20, 250, c + 15);
          ctx.stroke();
        }

        // Malignant Glandular Infiltrating Nests
        const nests = [
          { x: -70, y: -40, r: 45 },
          { x: 60, y: 30, r: 52 },
          { x: -50, y: 70, r: 38 },
          { x: 80, y: -70, r: 40 },
        ];

        nests.forEach((nest) => {
          ctx.fillStyle = "#312E81"; // Dense hyperchromatic nuclei
          ctx.beginPath();
          ctx.arc(nest.x, nest.y, nest.r, 0, Math.PI * 2);
          ctx.fill();

          // Atypical Mitotic Figures & Lumen
          ctx.fillStyle = "#E0E7FF";
          ctx.beginPath();
          ctx.arc(nest.x + 8, nest.y - 6, nest.r * 0.35, 0, Math.PI * 2);
          ctx.fill();

          // Pleomorphic Nuclei Dots
          ctx.fillStyle = "#1E1B4B";
          for (let n = 0; n < 24; n++) {
            const angle = (n / 24) * Math.PI * 2;
            const dist = nest.r * 0.65;
            ctx.beginPath();
            ctx.arc(nest.x + Math.cos(angle) * dist, nest.y + Math.sin(angle) * dist, 3.5, 0, Math.PI * 2);
            ctx.fill();
          }
        });

        if (isMarkersVisible) {
          drawPointer(ctx, 60, 30, "Invasive Ductal Carcinoma Malignant Glandular Nest");
        }
      } else if (activeSlideKey === "scc-cervix") {
        // Squamous Cell Carcinoma: Keratin Pearls & Intercellular Bridges
        ctx.fillStyle = "#FDF2F8";
        ctx.fillRect(-250, -200, 500, 400);

        // Polygonal Squamous Nest
        ctx.fillStyle = "#F472B6";
        ctx.beginPath();
        ctx.roundRect(-120, -90, 240, 180, 40);
        ctx.fill();

        // Concentric Keratin Pearl in Center
        ctx.strokeStyle = "#DB2777";
        ctx.lineWidth = 3;
        for (let r = 8; r <= 48; r += 7) {
          ctx.beginPath();
          ctx.arc(0, 0, r, 0, Math.PI * 1.8);
          ctx.stroke();
        }

        // Pleomorphic Squamous Nuclei
        ctx.fillStyle = "#312E81";
        for (let a = 0; a < 36; a++) {
          const angle = (a / 36) * Math.PI * 2;
          const dist = 65 + (a % 3) * 12;
          ctx.beginPath();
          ctx.arc(Math.cos(angle) * dist, Math.sin(angle) * dist, 5, 0, Math.PI * 2);
          ctx.fill();
        }

        if (isMarkersVisible) {
          drawPointer(ctx, 0, 0, "Eosinophilic Keratin Horn Pearl (Squamous Differentiation)");
        }
      } else if (activeSlideKey === "tb-granuloma") {
        // Tuberculosis: Central caseous necrosis, Langhans giant cells, epithelioid cuff
        // Background Lymphoid Tissue
        ctx.fillStyle = "#C7D2FE";
        ctx.fillRect(-250, -200, 500, 400);

        // Central Amorphous Caseous Necrosis (Acellular pink debris)
        ctx.fillStyle = "#FBCFE8";
        ctx.beginPath();
        ctx.ellipse(0, 0, 95, 75, Math.PI / 12, 0, Math.PI * 2);
        ctx.fill();

        // Langhans Giant Cell (Horseshoe arc of nuclei)
        const lgx = -65;
        const lgy = -45;
        ctx.fillStyle = "#F472B6";
        ctx.beginPath();
        ctx.arc(lgx, lgy, 26, 0, Math.PI * 2);
        ctx.fill();

        // Peripheral Arc / Horseshoe of Nuclei
        ctx.fillStyle = "#312E81";
        for (let k = 0; k < 12; k++) {
          const arc = Math.PI * 0.1 + (k / 12) * Math.PI * 1.2;
          ctx.beginPath();
          ctx.arc(lgx + Math.cos(arc) * 18, lgy + Math.sin(arc) * 18, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Epithelioid Histiocyte Palisade (slipper-shaped nuclei)
        ctx.fillStyle = "#4338CA";
        for (let ep = 0; ep < 28; ep++) {
          const angle = (ep / 28) * Math.PI * 2;
          const dist = 105;
          ctx.save();
          ctx.translate(Math.cos(angle) * dist, Math.sin(angle) * dist);
          ctx.rotate(angle);
          ctx.beginPath();
          ctx.ellipse(0, 0, 6, 2.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        if (isMarkersVisible) {
          drawPointer(ctx, lgx, lgy, "Langhans Multinucleated Giant Cell & Caseous Necrosis");
        }
      } else if (activeSlideKey === "acute-appendicitis") {
        // Acute Appendicitis: Mucosal necrosis, transmural neutrophils in muscularis
        ctx.fillStyle = "#FDF2F8";
        ctx.fillRect(-250, -200, 500, 400);

        // Muscularis Propria Muscle Bundles
        ctx.fillStyle = "#F472B6";
        ctx.fillRect(-250, -80, 500, 160);

        // Transmural Polymorphonuclear Neutrophilic Infiltrate
        for (let nx = -200; nx <= 200; nx += 22) {
          for (let ny = -60; ny <= 60; ny += 20) {
            // Multilobed polymorph nucleus
            ctx.fillStyle = "#312E81";
            ctx.beginPath();
            ctx.arc(nx + (ny % 7), ny, 2.5, 0, Math.PI * 2);
            ctx.arc(nx + 3 + (ny % 7), ny + 2, 2.5, 0, Math.PI * 2);
            ctx.arc(nx - 2 + (ny % 7), ny + 3, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }

        // Mucosal Ulceration Area on top
        ctx.fillStyle = "#991B1B";
        ctx.fillRect(-250, -180, 500, 40);

        if (isMarkersVisible) {
          drawPointer(ctx, 0, 0, "Dense Transmural Neutrophilic Infiltration of Muscularis Propria");
        }
      }
    }

    // Micrometer Ocular Reticle Grid Overlay
    if (isGridVisible) {
      ctx.strokeStyle = "rgba(79, 70, 229, 0.4)";
      ctx.lineWidth = 1;
      for (let gx = -220; gx <= 220; gx += 20) {
        ctx.beginPath();
        ctx.moveTo(gx, -200);
        ctx.lineTo(gx, 200);
        ctx.stroke();
      }
      for (let gy = -180; gy <= 180; gy += 20) {
        ctx.beginPath();
        ctx.moveTo(-240, gy);
        ctx.lineTo(240, gy);
        ctx.stroke();
      }
      // Center Crosshair
      ctx.strokeStyle = "#4F46E5";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-30, 0);
      ctx.lineTo(30, 0);
      ctx.moveTo(0, -30);
      ctx.lineTo(0, 30);
      ctx.stroke();
    }

    ctx.restore();
  }, [
    activeDepartment,
    activeSlideKey,
    activeObjective,
    isGridVisible,
    isMarkersVisible,
    focusSliderVal,
    lightSliderVal,
    stagePan,
  ]);

  function drawPointer(ctx: CanvasRenderingContext2D, x: number, y: number, label: string) {
    ctx.save();
    // Pointer Arrow & Circle
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fill();

    // Callout Box
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText("🔬 " + label).width;
    ctx.fillStyle = "rgba(15, 23, 42, 0.95)";
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    ctx.fillRect(x - textWidth / 2 - 10, y - 46, textWidth + 20, 26);
    ctx.strokeRect(x - textWidth / 2 - 10, y - 46, textWidth + 20, 26);

    ctx.fillStyle = "#FEF3C7";
    ctx.fillText("🔬 " + label, x - textWidth / 2, y - 29);
    ctx.restore();
  }

  const checkedChecklistCount = Object.values(checkedChecklist).filter(Boolean).length;

  const currentDepartmentSlides = Object.values(SLIDE_SPECIMENS).filter(
    (s) => s.department === activeDepartment
  );

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      {/* Toast Notification Container */}
      <div
        className={`fixed top-5 right-5 z-50 transform transition-all duration-300 flex items-center gap-3 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium border border-slate-700 ${
          toastVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <span className="text-base">{toastIcon}</span>
        <span>{toastMessage}</span>
      </div>

      {/* ==================== HERO BANNER (Battle Room Gradient) ==================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-burgundy-950 via-burgundy-900 to-burgundy-850 text-cream-50 p-6 sm:p-8 shadow-xl border border-burgundy-800/80">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-burgundy-600/20 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2.5 mb-2">
              <span className="inline-block text-[10px] tracking-widest uppercase font-extrabold text-amber-200 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
                MEDSCOPE WHOLE SLIDE IMAGING (WSI) SUITE
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/30">
                WSI Stage Ready
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-white font-serif">
              Precision cellular diagnosis.<br className="hidden sm:inline" /> From smear morphology to tissue architecture.
            </h1>
            <p className="text-xs sm:text-sm text-cream-100/90 mt-2 font-normal leading-relaxed">
              Seamlessly transition between Wright-Giemsa peripheral blood smears and Hematoxylin &amp; Eosin (H&amp;E) biopsy specimens. Adjust optical objectives up to 100x Oil Immersion, perform differential cell counts, and sign out verified diagnostic impressions.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToViewer}
                className="px-5 py-2.5 bg-burgundy-600 hover:bg-burgundy-700 text-white rounded-xl text-xs font-bold shadow-md transition flex items-center gap-2"
              >
                <span>Launch Virtual Stage</span>
                <span>↓</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setModalMode("switch");
                  setDoctorModalOpen(true);
                }}
                className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-cream-50 rounded-xl text-xs font-semibold backdrop-blur-xs transition flex items-center gap-1.5 border border-white/15"
              >
                <span>👩‍⚕️ Switch Clinician ({doctor.title} {doctor.fullName})</span>
              </button>
            </div>
          </div>

          {/* Pathologist Profile Quick Pill on the right */}
          <div className="relative shrink-0 flex flex-col items-start md:items-end gap-2">
            <button
              type="button"
              onClick={() => {
                setModalMode("edit");
                setDoctorModalOpen(true);
              }}
              className="flex items-center gap-3 p-3 rounded-2xl bg-white/10 hover:bg-white/15 backdrop-blur-md border border-white/15 transition group text-left"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold flex items-center justify-center text-xs shadow-md ring-2 ring-white/20">
                {getInitials(doctor.fullName)}
              </div>
              <div>
                <p className="text-xs font-bold text-white leading-tight">
                  {doctor.title} {doctor.fullName}
                </p>
                <p className="text-[10px] text-amber-200/90 font-medium">{doctor.specialty}</p>
                <p className="text-[9px] text-cream-200/60 font-mono truncate max-w-[180px]">{doctor.hospital}</p>
              </div>
            </button>
          </div>
        </div>

        {/* Watermark Graphic */}
        <div className="absolute -right-6 -bottom-8 opacity-10 text-white pointer-events-none select-none text-9xl">
          🔬
        </div>
      </div>

      {/* ==================== 3. KPI STAT CARDS ROW ==================== */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Streak */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-xl">
              🔥
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Microscopy Streak</p>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">8 days</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-3">High concordant readouts!</p>
        </div>

        {/* 2. Daily Slide Goal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Bench Slide Time</p>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">3.2 hours</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-4/5" />
            </div>
          </div>
        </div>

        {/* 3. Slides Verified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Slides Signed Out</p>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">
                {signedCasesCount} of {totalCasesTarget}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (signedCasesCount / totalCasesTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Diagnostic Concordance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Diagnostic Concordance</p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">94.2%</p>
            <span className="inline-block mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              CAP / CLIA Compliant
            </span>
          </div>
          <div className="relative w-12 h-12 rounded-full bg-burgundy-50 border-2 border-burgundy-600 flex items-center justify-center">
            <span className="text-xs font-extrabold text-burgundy-700">94%</span>
          </div>
        </div>
      </div>

      {/* ==================== 4. LABORATORY SLIDE RUN SELECTOR ==================== */}
      <section id="slideSelector" className="bg-white rounded-2xl border border-burgundy-100 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-burgundy-600" />
              Select Pathology Department &amp; Slide Preparation
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Toggle between Haematology blood/marrow films and Histopathology tissue microtome sections.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-burgundy-50 text-burgundy-800 rounded-full border border-burgundy-200 self-start sm:self-auto">
            Active: {activeSpecimen.name}
          </span>
        </div>

        {/* Primary Department Tabs */}
        <div className="flex p-1 bg-slate-100 rounded-2xl max-w-md mb-4 text-xs font-bold">
          <button
            type="button"
            onClick={() => switchDepartment("haematology")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 ${
              activeDepartment === "haematology"
                ? "bg-white text-burgundy-950 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🩸</span>
            <span>Haematology Slides</span>
          </button>
          <button
            type="button"
            onClick={() => switchDepartment("histopathology")}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-2 ${
              activeDepartment === "histopathology"
                ? "bg-white text-burgundy-950 shadow-xs font-bold"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <span>🔬</span>
            <span>Histopathology Slides</span>
          </button>
        </div>

        {/* Sub-Slide Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentDepartmentSlides.map((slide) => {
            const isActive = activeSlideKey === slide.id;
            return (
              <button
                key={slide.id}
                type="button"
                onClick={() => selectSlide(slide.id)}
                className={`p-3.5 rounded-2xl border transition flex flex-col items-center justify-center text-center group ${
                  isActive
                    ? "border-burgundy-600 bg-burgundy-50 text-burgundy-950 font-bold shadow-xs ring-1 ring-burgundy-500/30"
                    : "border-slate-200 bg-slate-50/70 hover:bg-burgundy-50/50 hover:border-burgundy-300 text-slate-700 font-semibold"
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition">{slide.icon}</span>
                <span className="text-xs mt-1.5 font-bold leading-tight">{slide.name}</span>
                <span className="text-[10px] text-burgundy-700 font-medium mt-0.5">{slide.subType}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== 5. INTERACTIVE VIRTUAL MICROSCOPE STAGE ==================== */}
      <section id="microscopeSection" className="bg-slate-900 rounded-3xl border border-slate-800 text-slate-100 shadow-xl overflow-hidden">
        {/* Stage Header Bar */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-burgundy-600 text-white flex items-center justify-center text-lg font-bold shadow-xs">
              {activeSpecimen.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white font-serif">{activeSpecimen.name}</h4>
                <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-700/60 px-2.5 py-0.5 rounded-full">
                  {activeSpecimen.urgencyTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{activeSpecimen.specimenMeta}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              ● Stage Illumination Active
            </span>
            <button
              type="button"
              onClick={resetStage}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
            >
              Center Slide
            </button>
          </div>
        </div>

        {/* Main Stage Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Left: Ocular Viewport (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              {/* Objectives */}
              <div className="flex items-center gap-1 text-xs font-semibold">
                <span className="text-[11px] text-slate-400 mr-1 font-mono">Objective:</span>
                {[
                  { mag: 4 as const, label: "4x" },
                  { mag: 10 as const, label: "10x" },
                  { mag: 40 as const, label: "40x High Dry" },
                  { mag: 100 as const, label: "100x Oil" },
                ].map((obj) => (
                  <button
                    key={obj.mag}
                    type="button"
                    onClick={() => setActiveObjective(obj.mag)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      activeObjective === obj.mag
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                    }`}
                  >
                    {obj.label}
                  </button>
                ))}
              </div>

              {/* Tools */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setIsGridVisible(!isGridVisible)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 border transition ${
                    isGridVisible
                      ? "bg-indigo-600 text-white border-indigo-400"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  <span>📐 Micrometer</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsMarkersVisible(!isMarkersVisible);
                    if (!isMarkersVisible) showToast("Diagnostic landmark pointer highlighted");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 border transition ${
                    isMarkersVisible
                      ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                      : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30"
                  }`}
                >
                  <span>👁️ Diagnostic Pointer</span>
                </button>
              </div>
            </div>

            {/* Canvas Viewport */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-2xl overflow-hidden my-3.5 border border-slate-800 flex items-center justify-center select-none shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                className="w-full h-full object-contain cursor-grab active:cursor-grabbing"
              />

              {/* Monospace Overlays */}
              <div className="absolute top-3 left-3 text-[11px] font-mono text-indigo-400 pointer-events-none drop-shadow leading-tight">
                STAIN: {activeSpecimen.stainLabel}
                <br />
                MAG: {activeObjective * 10}x ({activeObjective}x OBJ x 10x OC)
                <br />
                STAGE: X: {stagePan.x.toFixed(1)} µm | Y: {stagePan.y.toFixed(1)} µm
              </div>

              <div className="absolute top-3 right-3 text-[11px] font-mono text-indigo-400 pointer-events-none drop-shadow text-right leading-tight">
                APERTURE: 0.65 N.A.
                <br />
                CONDENSER: KOHLER CENTERED
                <br />
                FOCUS: {Math.abs(focusSliderVal - 100) < 5 ? "OPTIMAL" : "SLIGHT ABERRATION"}
              </div>

              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-emerald-400 pointer-events-none drop-shadow">
                FIELD: {activeDepartment === "haematology" ? "MONOLAYER COUNT ZONE" : "HISTOMORPHOLOGY FIELD"}
              </div>

              {/* Scale bar in Micron */}
              <div className="absolute bottom-3 right-3 text-[10px] font-mono bg-slate-950/80 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg flex items-center gap-2">
                <span>{activeObjective === 100 ? "5 µm" : "10 µm"}</span>
                <div className="w-12 h-1 bg-white rounded-full" />
              </div>
            </div>

            {/* Virtual Stage Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-xs">
              {/* Focus Slider */}
              <div>
                <div className="flex justify-between text-slate-400 text-[11px] font-mono mb-1">
                  <span>Fine Focus Knob</span>
                  <span>{Math.abs(focusSliderVal - 100) < 5 ? "In-Focus (98%)" : `${focusSliderVal}%`}</span>
                </div>
                <input
                  type="range"
                  min="70"
                  max="130"
                  value={focusSliderVal}
                  onChange={(e) => setFocusSliderVal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Light Intensity Slider */}
              <div>
                <div className="flex justify-between text-slate-400 text-[11px] font-mono mb-1">
                  <span>Substage Iris</span>
                  <span>{lightSliderVal}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="160"
                  value={lightSliderVal}
                  onChange={(e) => setLightSliderVal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* Stage Pan Buttons */}
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] font-mono">Stage Pan:</span>
                <div className="inline-flex gap-1">
                  <button
                    type="button"
                    onClick={() => panStage(-25, 0)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                  >
                    ←
                  </button>
                  <div className="flex flex-col gap-0.5">
                    <button
                      type="button"
                      onClick={() => panStage(0, -20)}
                      className="w-7 h-3 rounded-t-md bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-200 flex items-center justify-center"
                    >
                      ▲
                    </button>
                    <button
                      type="button"
                      onClick={() => panStage(0, 20)}
                      className="w-7 h-3 rounded-b-md bg-slate-800 hover:bg-slate-700 text-[9px] text-slate-200 flex items-center justify-center"
                    >
                      ▼
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => panStage(25, 0)}
                    className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center font-bold"
                  >
                    →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Review, Differential & Reporting (5 Cols) */}
          <div className="lg:col-span-5 p-5 bg-slate-900 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white font-serif">{activeSpecimen.checklistName}</h4>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    {checkedChecklistCount} / {activeSpecimen.checklistItems.length} Inspected
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeDepartment === "haematology"
                    ? "Scrutinize red cell series, white cell series, platelets, and background."
                    : "Scrutinize architectural arrangement, cellular pleomorphism, and surgical margins."}
                </p>
              </div>

              {/* Dynamic Checklist */}
              <div className="space-y-2 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800">
                {activeSpecimen.checklistItems.map((item) => (
                  <label
                    key={item.code}
                    className="flex items-start gap-2.5 cursor-pointer text-slate-300 hover:text-white transition"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedChecklist[item.code])}
                      onChange={(e) =>
                        setCheckedChecklist((prev) => ({
                          ...prev,
                          [item.code]: e.target.checked,
                        }))
                      }
                      className="mt-0.5 rounded border-slate-700 text-indigo-600 focus:ring-0 accent-indigo-600 cursor-pointer"
                    />
                    <span>
                      <strong>{item.code}</strong> - {item.title}{" "}
                      <span className="text-[10px] text-slate-400 block">{item.desc}</span>
                    </span>
                  </label>
                ))}
              </div>

              {/* Differential WBC Counter (Only on Haematology) */}
              {activeDepartment === "haematology" && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-500" />
                      Differential Leukocyte Counter
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-300">
                      Total: {totalDiffCells} / 100
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-xs">
                    {(
                      [
                        { key: "neut", label: "Segmented Neut" },
                        { key: "lymph", label: "Lymphocyte" },
                        { key: "mono", label: "Monocyte" },
                        { key: "eos", label: "Eosinophil" },
                        { key: "baso", label: "Basophil" },
                        { key: "blast", label: "Blasts / Atypical" },
                      ] as const
                    ).map((cell) => {
                      const count = diffCounts[cell.key];
                      const pct = totalDiffCells > 0 ? Math.round((count / totalDiffCells) * 100) : 0;
                      return (
                        <button
                          key={cell.key}
                          type="button"
                          onClick={() => countCell(cell.key)}
                          className={`p-1.5 rounded-lg text-left border transition ${
                            cell.key === "blast"
                              ? "bg-rose-950/60 hover:bg-rose-900/60 border-rose-800/80 text-rose-200"
                              : "bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100"
                          }`}
                        >
                          <p className="text-[10px] text-slate-400 leading-tight">{cell.label}</p>
                          <p className="font-bold text-xs mt-0.5">
                            {count} ({pct}%)
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <button type="button" onClick={resetCellCounter} className="text-indigo-400 hover:underline">
                      Reset Counter
                    </button>
                    <span>Click boxes to tally 100 cells</span>
                  </div>
                </div>
              )}

              {/* Histopathology Metrics (Only on Histopathology) */}
              {activeDepartment === "histopathology" && (
                <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-slate-200 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-pink-500" />
                    Histomorphological Grading
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-slate-300">
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Nuclear Pleomorphism:</span>
                      <span className="font-bold text-pink-300">{activeSpecimen.nuclearGrade || "Moderate / Grade II"}</span>
                    </div>
                    <div className="p-2 bg-slate-900 rounded-lg border border-slate-800">
                      <span className="text-[10px] text-slate-400 block">Mitotic Figures / 10 HPF:</span>
                      <span className="font-bold text-pink-300">{activeSpecimen.mitoticCount || "8 per 10 HPF"}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Provisional Impression Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-serif">
                  Primary Pathological Impression
                </label>
                <select
                  value={selectedImpression}
                  onChange={(e) => setSelectedImpression(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
                >
                  {activeSpecimen.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Verification Feedback Box */}
              {verificationResult && (
                <div
                  className={`p-3.5 rounded-xl text-xs space-y-1.5 ${
                    verificationResult.correct
                      ? "bg-emerald-950/80 border border-emerald-700 text-emerald-200"
                      : "bg-rose-950/80 border border-rose-700 text-rose-200"
                  }`}
                >
                  <p className="font-bold">{verificationResult.text}</p>
                  {verificationResult.correct && (
                    <>
                      <p className="leading-relaxed text-[11px] text-emerald-300/90 font-medium">
                        {verificationResult.atlasPearl}
                      </p>
                      <div className="mt-2 pt-2 border-t border-emerald-800/60 flex items-center justify-between text-[10px] text-emerald-400 font-mono">
                        <span>
                          Signed by: {doctor.title} {doctor.fullName} ({doctor.specialty})
                        </span>
                        <span>{doctor.hospital}</span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Submissions */}
            <div className="pt-5 border-t border-slate-800 space-y-2 mt-4">
              <button
                type="button"
                onClick={verifyCurrentReport}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Sign & Verify Pathological Report</span>
                <span>✓</span>
              </button>
              <button
                type="button"
                onClick={() => showToast(`Atlas Pearl: ${activeSpecimen.atlasPearl}`, "💡")}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Consultant Slide Criteria & Atlas Pearls ↗
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== 6. CASE WORKLIST TABLE ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2 font-serif">
              <span className="text-indigo-600">📋</span>
              Bench Run Worklist for{" "}
              <span className="text-indigo-700 capitalize">
                {activeDepartment === "haematology" ? "Haematology Laboratory" : "Histopathology Laboratory"}
              </span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">Select any specimen below to mount directly on the digital stage.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400 self-start sm:self-auto">
            Run Date: Tue, Oct 20, 2026 • Shift 1
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-1">Accession & Staining</th>
                <th className="pb-3">Clinical Indication & Specimen</th>
                <th className="pb-3">Morphological Key Finding</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeSpecimen.cases.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pl-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      🔬
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{c.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{c.stain}</p>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium max-w-xs">{c.indication}</td>
                  <td className="py-3.5 text-slate-700 font-semibold text-[11px]">{c.finding}</td>
                  <td className="py-3.5">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${c.statusClass}`}>
                      ● {c.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right pr-1">
                    <button
                      type="button"
                      onClick={() => {
                        scrollToViewer();
                        showToast(`Mounted slide specimen ${c.id} on stage`, "🔬");
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                    >
                      Mount on Stage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ==================== 7. DIAGNOSTIC ACCURACY & VOLUME ANALYTICS ==================== */}
      <section className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-indigo-600 text-lg">📊</span>
            <h3 className="font-bold text-slate-900 text-sm sm:text-base font-serif">
              Diagnostic Accuracy & Volume Analytics
            </h3>
          </div>
          <button
            type="button"
            onClick={() => showToast("Exported Pathology Microscopy Logbook (PDF)", "📑")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Export Logbook (PDF) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-center">
          {/* Weekly Slide Review Hours */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500">Weekly Slide Review Hours</span>
              <span className="text-[11px] font-bold text-indigo-600">92% of target</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              15.8 <span className="text-xs text-slate-400 font-semibold">/ 17 hrs</span>
            </p>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[92%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Signed out 84 glass slides & WSI runs this clinical block
            </p>
          </div>

          {/* Daily Specimens Bar Chart */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">Daily Specimens Signed Out</p>
            <div className="flex items-end justify-between gap-2 h-16 pt-2">
              {[
                { day: "Mon", h: "h-8", bg: "bg-indigo-200" },
                { day: "Tue", h: "h-12", bg: "bg-indigo-300" },
                { day: "Wed", h: "h-14", bg: "bg-indigo-600" },
                { day: "Thu", h: "h-10", bg: "bg-indigo-300" },
                { day: "Fri", h: "h-13", bg: "bg-indigo-400" },
                { day: "Sat", h: "h-5", bg: "bg-slate-200" },
                { day: "Sun", h: "h-11", bg: "bg-indigo-500" },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className={`w-full ${bar.bg} rounded-t-md ${bar.h} transition`} />
                  <span className="text-[9px] font-bold text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Concordance by Sub-discipline */}
          <div className="space-y-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800 text-xs mb-1">Concordance by Sub-discipline</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500" /> Peripheral Smears (PBF)
              </span>
              <span className="font-bold text-slate-800">96.4%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Bone Marrow Aspirates
              </span>
              <span className="font-bold text-slate-800">95.0%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-pink-500" /> Surgical Histopathology
              </span>
              <span className="font-bold text-slate-800">93.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Parasitology (Malaria)
              </span>
              <span className="font-bold text-slate-800">98.1%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DOCTOR PROFILE MODAL ==================== */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-100 font-black">
                  🔬
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight font-serif">
                    {modalMode === "edit"
                      ? "Edit Pathologist Profile & Stamp"
                      : modalMode === "switch"
                      ? "Switch Reporting Pathologist"
                      : "Pathologist Onboarding & Registration"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure your laboratory credentials to sign out slide runs.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDoctorModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Quick 1-Click Demo Profiles */}
            <div className="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">
                ⚡ 1-Click Pathologist Presets:
              </p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => quickSelectDemo("okonjo")}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition group"
                >
                  <p className="font-bold text-[11px] text-slate-800 group-hover:text-indigo-600 leading-tight">
                    Dr. Jane Okonjo
                  </p>
                  <p className="text-[9px] text-slate-400">Hematopathologist</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickSelectDemo("eze")}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition group"
                >
                  <p className="font-bold text-[11px] text-slate-800 group-hover:text-indigo-600 leading-tight">
                    Dr. Chinedu Eze
                  </p>
                  <p className="text-[9px] text-slate-400">Surg Pathology Res</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickSelectDemo("jenkins")}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition group"
                >
                  <p className="font-bold text-[11px] text-slate-800 group-hover:text-indigo-600 leading-tight">
                    Dr. S. Jenkins
                  </p>
                  <p className="text-[9px] text-slate-400">Cytopathologist</p>
                </button>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleDoctorSubmit} className="mt-4 space-y-3.5 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-1">
                  <label className="block font-bold text-slate-700 mb-1">Title</label>
                  <select
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="Dr.">Dr.</option>
                    <option value="Prof.">Prof.</option>
                    <option value="Fellow">Fellow</option>
                  </select>
                </div>
                <div className="sm:col-span-3">
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Jane Okonjo"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Laboratory Specialty</label>
                  <select
                    value={formSpec}
                    onChange={(e) => setFormSpec(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="Consultant Hematopathologist">Consultant Hematopathologist</option>
                    <option value="Surgical Pathologist">Surgical Pathologist</option>
                    <option value="Clinical Cytopathologist">Clinical Cytopathologist</option>
                    <option value="Medical Microbiologist">Medical Microbiologist</option>
                    <option value="Pathology Resident">Pathology Resident</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Laboratory Unit</label>
                  <input
                    type="text"
                    required
                    value={formHosp}
                    onChange={(e) => setFormHosp(e.target.value)}
                    placeholder="e.g. Central Pathology Laboratory"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Institutional Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="pathologist@hospital.org"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="pt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setDoctorModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <span>Apply & Load LIS</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
