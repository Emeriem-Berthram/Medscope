"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useTransition } from "react";
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

interface CaseStudy {
  id: string;
  proj: string;
  indication: string;
  sign: string;
  status: string;
  statusClass: string;
}

interface ModalityData {
  name: string;
  projection: string;
  clinicalTag: string;
  patientMeta: string;
  modalityLabel: string;
  kvp: string;
  mas: string;
  icon: string;
  checklistName: string;
  checklistItems: ChecklistItem[];
  options: DiagnosisOption[];
  correctVal: string;
  correctFeedback: string;
  teachingNote: string;
  cases: CaseStudy[];
}

const MODALITIES: Record<string, ModalityData> = {
  thoracic: {
    name: "Thoracic / Chest",
    projection: "Chest PA View (CXR)",
    clinicalTag: "STAT Emergency",
    patientMeta: "Patient: DOE, JOHN (52M) • ACC #98231 • ERECT PA CHEST",
    modalityLabel: "CHEST PA",
    kvp: "120",
    mas: "2.8",
    icon: "🫁",
    checklistName: "Systematic Review (A-B-C-D-E)",
    checklistItems: [
      { code: "A", title: "Airway", desc: "Trachea midline, carina patent, no deviation" },
      { code: "B", title: "Breathing", desc: "Bilateral lung expansion, no pneumothorax, clear apices" },
      { code: "C", title: "Circulation", desc: "Cardiothoracic ratio < 0.5, clear aortic knuckle" },
      { code: "D", title: "Disability", desc: "Rib contours intact, clavicles symmetrical, no fracture" },
      { code: "E", title: "Everything Else", desc: "Costophrenic angles sharp, gastric bubble beneath left dome" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "Right Lower Lobe (RLL) Lobar Consolidation (Pneumonia)" },
      { value: "pneumo", label: "Apical Tension Pneumothorax with mediastinal shift" },
      { value: "cardio", label: "Gross Cardiomegaly with Kerley B lines" },
      { value: "normal", label: "Unremarkable normal adult chest radiograph" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Right Lower Lobe (RLL) alveolar consolidation with prominent air bronchograms obscuring the right hemidiaphragmatic contour (Silhouette Sign).",
    teachingNote:
      "Silhouette sign indicates alveolar fluid effacing the adjacent soft tissue density of the right hemidiaphragm or right cardiac border.",
    cases: [
      {
        id: "CXR-101",
        proj: "Chest PA & Lateral",
        indication: "52M productive cough & high fever. Rule out pneumonia.",
        sign: "Silhouette sign at diaphragm",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "CXR-102",
        proj: "Chest Portable AP",
        indication: "28M acute pleuritic chest pain in ICU. Assess lung volume.",
        sign: "Apical pleural line",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "CXR-103",
        proj: "Chest Erect PA",
        indication: "67M chronic dyspnea and orthopnea. Evaluate heart size.",
        sign: "Cardiothoracic ratio 0.62",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },

  abdominal: {
    name: "Abdominal",
    projection: "Abdominal Plain Film (AXR Supine / Erect)",
    clinicalTag: "Acute Abdomen",
    patientMeta: "Patient: MORALES, ROSA (61F) • ACC #91823 • SUPINE + ERECT KUB",
    modalityLabel: "AXR SUPINE",
    kvp: "80",
    mas: "32.0",
    icon: "🌀",
    checklistName: "Systematic Review (B-G-S-C)",
    checklistItems: [
      { code: "B", title: "Bones", desc: "Lower ribs, lumbar spine alignment, pelvis and hip joints" },
      { code: "G", title: "Gas Pattern", desc: "Small bowel (<3cm) and colon (<6cm) gas distribution" },
      { code: "S", title: "Soft Tissue", desc: "Hepatosplenomegaly, psoas shadows clearly delineated" },
      { code: "C", title: "Calcifications", desc: "Renal/ureteric calculi, vascular calcifications, gallstones" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "Mechanical Small Bowel Obstruction with Step-ladder Loops" },
      { value: "perforation", label: "Pneumoperitoneum with subdiaphragmatic crescent air" },
      { value: "calculus", label: "Left distal ureteric obstructing calculus" },
      { value: "normal", label: "Normal non-obstructive bowel gas distribution" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Dilated small bowel loops exceeding 3.5 cm in central abdomen with plicae circulares completely traversing the lumen (Step-ladder pattern).",
    teachingNote:
      "Remember the 3-6-9 rule for maximal normal bowel caliber: Small bowel 3cm, Large bowel 6cm, Cecum 9cm.",
    cases: [
      {
        id: "AXR-201",
        proj: "AXR Supine & Erect",
        indication: "61F bilious vomiting and severe colicky pain. Prior appendectomy.",
        sign: "Step-ladder loops (>3cm)",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "AXR-202",
        proj: "Erect Chest & Abdomen",
        indication: "73M sudden onset epigastric peritonitis. Rule out perforation.",
        sign: "Rigler's sign / Free air",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "AXR-203",
        proj: "KUB Plain View",
        indication: "45M severe right flank pain radiating to groin. Microscopic hematuria.",
        sign: "Radio-opaque renal shadow",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },

  pelvic: {
    name: "Pelvic & Hip",
    projection: "Pelvis AP View & Bilateral Hips",
    clinicalTag: "Trauma Resus",
    patientMeta: "Patient: O’CONNOR, ELEANOR (78F) • ACC #73341 • AP PELVIS SUPINE",
    modalityLabel: "PELVIS AP",
    kvp: "75",
    mas: "25.0",
    icon: "🩻",
    checklistName: "Systematic Review (Pelvic Rings & Lines)",
    checklistItems: [
      { code: "R", title: "Pelvic Ring", desc: "Sacrum, iliac wings, pubic symphysis continuity intact" },
      { code: "S", title: "Shenton's Line", desc: "Smooth continuous curve from inferior pubic ramus to lesser trochanter" },
      { code: "A", title: "Acetabulum", desc: "Anterior and posterior rim integrity, no medial protrusio" },
      { code: "J", title: "Sacroiliac Joints", desc: "Symmetrical joint spaces, no diastasis or widening" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "Displaced Subcapital Femoral Neck Fracture (Broken Shenton's Line)" },
      { value: "pubic", label: "Isolated Superior & Inferior Pubic Rami Straddle Fracture" },
      { value: "diastasis", label: "Open-book Pubic Symphysis Diastasis (>2.5cm)" },
      { value: "normal", label: "Normal adult bony pelvis with symmetrical lines" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Left femoral neck cortical step-off with disruption of Shenton's curved arch and foreshortening/external rotation.",
    teachingNote:
      "A disrupted Shenton's line is one of the most reliable radiological clues for occult or displaced intracapsular femoral neck fractures in elderly fall patients.",
    cases: [
      {
        id: "PEL-301",
        proj: "Pelvis AP & Frog Lateral",
        indication: "78F ground-level fall, unable to bear weight. Left leg shortened.",
        sign: "Left Shenton's line break",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "PEL-302",
        proj: "Inlet & Outlet Pelvis",
        indication: "34M motorcycle collision. Pelvic ring instability.",
        sign: "Pubic symphysis separation",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "PEL-303",
        proj: "Right Hip Judet Views",
        indication: "50M dashboard impact. Assess acetabular column.",
        sign: "Posterior wall fracture",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },

  skull: {
    name: "Skull & Facial",
    projection: "Skull AP / Caldwell & Lateral View",
    clinicalTag: "Neurotrauma",
    patientMeta: "Patient: GOMEZ, LUIS (31M) • ACC #61198 • 3-VIEW SKULL SERIES",
    modalityLabel: "SKULL LAT",
    kvp: "70",
    mas: "18.0",
    icon: "💀",
    checklistName: "Systematic Review (Calvarium & Sutures)",
    checklistItems: [
      { code: "C", title: "Calvarium", desc: "Inner and outer table continuity, no cortical step or defect" },
      { code: "S", title: "Sutures", desc: "Coronal, sagittal, lambdoid sutures normal width (<2mm)" },
      { code: "F", title: "Facial Bones", desc: "Orbital rims, zygomatic arches, maxilla and nasal bones" },
      { code: "B", title: "Skull Base", desc: "Sella turcica, sphenoid sinus aeration, petrous ridges" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "Linear Parietotemporal Bone Fracture crossing vascular grooves" },
      { value: "depressed", label: "Stellate Depressed Skull Fracture with inner table comminution" },
      { value: "diastasis", label: "Traumatic Lambdoid Suture Diastasis" },
      { value: "normal", label: "Normal skull radiograph with normal vascular markings" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Sharp non-branching lucent fracture line across the temporoparietal bone crossing middle meningeal artery groove (High epidural risk).",
    teachingNote:
      "Linear fractures that cross the groove of the middle meningeal artery necessitate urgent non-contrast head CT due to high risk of acute epidural hematoma.",
    cases: [
      {
        id: "SKL-401",
        proj: "Skull AP & Lateral",
        indication: "31M struck with blunt object. Temporal scalp hematoma. Neurologically intact.",
        sign: "Linear lucency crossing grooves",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "SKL-402",
        proj: "Towne View",
        indication: "22M occipital impact. Assess posterior fossa and foramen magnum.",
        sign: "Occipital table step-off",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "SKL-403",
        proj: "Caldwell & Lateral",
        indication: "49M chronic headache. Evaluate pituitary fossa size.",
        sign: "Normal sella turcica",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },

  pns: {
    name: "Paranasal (PNS)",
    projection: "Paranasal Sinuses (Waters View - Occipitomental)",
    clinicalTag: "ENT Clinic",
    patientMeta: "Patient: AL-MANSOOR, TARIQ (38M) • ACC #55021 • WATERS VIEW",
    modalityLabel: "PNS WATERS",
    kvp: "75",
    mas: "20.0",
    icon: "👃",
    checklistName: "Systematic Review (Sinus Aeration & Borders)",
    checklistItems: [
      { code: "M", title: "Maxillary Sinuses", desc: "Bilateral pyramidal lucency, mucosal thickening or fluid" },
      { code: "F", title: "Frontal Sinuses", desc: "Frontal sinus expansion, superior orbital rim integrity" },
      { code: "E", title: "Ethmoid Air Cells", desc: "Trabecular pattern between medial orbital walls" },
      { code: "S", title: "Nasal Septum", desc: "Midline orientation, inferior turbinate hypertrophy" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "Acute Right Maxillary Sinusitis with Air-Fluid Level" },
      { value: "pansinusitis", label: "Bilateral Complete Maxillary & Frontal Opacification" },
      { value: "blowout", label: "Orbital Floor Blowout Fracture with Teardrop Sign" },
      { value: "normal", label: "Completely aerated symmetrical paranasal sinuses" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Right maxillary antra reveals a sharp horizontal air-fluid meniscus with mucosal thickening, diagnostic of acute maxillary sinusitis.",
    teachingNote:
      "Waters projection (chin extended ~37° to bucky) is the gold standard plain radiograph for evaluating maxillary sinus pathology and air-fluid interfaces.",
    cases: [
      {
        id: "PNS-501",
        proj: "Waters View (Occipitomental)",
        indication: "38M facial fullness, purulent rhinorrhea and right cheek tenderness x 2 weeks.",
        sign: "Right horizontal air-fluid meniscus",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "PNS-502",
        proj: "Caldwell & Waters",
        indication: "27M fist assault to left orbit. Diplopia on upward gaze.",
        sign: "Teardrop sign / Orbital floor step",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "PNS-503",
        proj: "PNS Open-mouth Waters",
        indication: "42M chronic frontal headache. Assess sphenoid & frontal sinuses.",
        sign: "Clear aeration bilaterally",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },

  spine: {
    name: "Spine (C/T/L)",
    projection: "Cervical & Lumbar Spine (Lateral Projection)",
    clinicalTag: "Spine Triage",
    patientMeta: "Patient: KOWALSKI, JAN (44M) • ACC #49012 • CERVICAL SPINE LATERAL",
    modalityLabel: "C-SPINE LAT",
    kvp: "72",
    mas: "22.0",
    icon: "🧍",
    checklistName: "Systematic Review (Contour Lines & Spaces)",
    checklistItems: [
      { code: "A", title: "Anterior Line", desc: "Smooth unbroken anterior vertebral body contour line" },
      { code: "P", title: "Posterior Line", desc: "Posterior vertebral line (anterior margin of canal)" },
      { code: "S", title: "Spinolaminar Line", desc: "Junction of laminae and spinous processes" },
      { code: "D", title: "Disc Heights", desc: "Intervertebral spaces maintained, no acute narrowing" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "C5-C6 Anterior Subluxation with Interspinous Widening" },
      { value: "compression", label: "L1 Wedge Compression Fracture (>40% height loss)" },
      { value: "spondylolysis", label: "L5 Bilateral Pars Interarticularis Defect (Scotty Dog)" },
      { value: "normal", label: "Normal spinal alignment with preserved lordosis" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Anterior displacement of C5 vertebral body on C6 (>3mm) with disruption of the posterior vertebral and spinolaminar lines.",
    teachingNote:
      "Always scrutinize the 4 parallel lines on lateral cervical films: Anterior longitudinal, Posterior longitudinal, Spinolaminar, and Posterior spinous line.",
    cases: [
      {
        id: "SPN-601",
        proj: "C-Spine Cross-table Lat",
        indication: "44M high-speed rear-end collision in cervical collar. Severe neck pain.",
        sign: "C5-C6 step-off > 3mm",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "SPN-602",
        proj: "Lumbar AP & Lateral",
        indication: "69F osteoporotic spine. Sudden mid-back pain lifting groceries.",
        sign: "Vertebral wedge collapse",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "SPN-603",
        proj: "Lumbar Oblique Views",
        indication: "19M collegiate gymnast with chronic low back extension pain.",
        sign: "Collared Scotty dog collar",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },

  extremities: {
    name: "Extremities",
    projection: "Right Forearm & Wrist (PA & Lateral)",
    clinicalTag: "Orthopedic Trauma",
    patientMeta: "Patient: PATEL, PRIYA (26F) • ACC #33891 • WRIST PA + LATERAL",
    modalityLabel: "WRIST PA/LAT",
    kvp: "55",
    mas: "4.0",
    icon: "🦴",
    checklistName: "Systematic Review (Bones & Joint Congruity)",
    checklistItems: [
      { code: "C", title: "Cortical Integrity", desc: "Trace every cortex for subtle microfractures or buckle" },
      { code: "J", title: "Joint Spaces", desc: "Radiocarpal & distal radioulnar joint alignment" },
      { code: "S", title: "Scaphoid Bone", desc: "Inspect scaphoid waist line in ulnar deviation view" },
      { code: "T", title: "Soft Tissue", desc: "Pronator quadratus fat stripe displacement" },
    ],
    options: [
      { value: "", label: "-- Select provisional diagnosis --" },
      { value: "correct", label: "Colles' Fracture of Distal Radius with Dorsal Angulation" },
      { value: "scaphoid", label: "Non-displaced Scaphoid Waist Fracture" },
      { value: "smith", label: "Smith's (Reverse Colles) Volar Displacement Fracture" },
      { value: "normal", label: "Intact bony architecture with no joint subluxation" },
    ],
    correctVal: "correct",
    correctFeedback:
      "✓ Verified Concordance: Transverse fracture through the distal radial metaphysis with dorsal displacement, dorsal comminution, and radial shortening (Dinner fork deformity).",
    teachingNote:
      "Colles' fracture is typically caused by a Fall On Outstretched Hand (FOOSH) with the wrist in extension, leading to dorsal tilt of the distal fragment.",
    cases: [
      {
        id: "EXT-701",
        proj: "Wrist PA & Lateral",
        indication: "26F slipped on ice, FOOSH injury. Dinner-fork wrist deformity.",
        sign: "Distal radius dorsal tilt",
        status: "In progress",
        statusClass: "bg-amber-50 text-amber-700 border border-amber-200",
      },
      {
        id: "EXT-702",
        proj: "Scaphoid 4-Views",
        indication: "33M skateboarding fall, tenderness in anatomical snuffbox.",
        sign: "Hairline scaphoid waist lucency",
        status: "Not started",
        statusClass: "bg-slate-100 text-slate-600 border border-slate-200",
      },
      {
        id: "EXT-703",
        proj: "Ankle Mortise & Lat",
        indication: "21M twisted ankle during soccer. Tenderness over lateral malleolus.",
        sign: "Weber B distal fibula line",
        status: "Completed",
        statusClass: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      },
    ],
  },
};

const DEMO_CLINICIANS = {
  okonjo: {
    title: "Dr.",
    fullName: "Jane Okonjo",
    specialty: "Consultant Radiologist",
    hospital: "Apex Specialist Teaching Hospital",
    email: "jane.okonjo@apexmed.org",
  },
  eze: {
    title: "Dr.",
    fullName: "Chinedu Eze",
    specialty: "Radiology Resident",
    hospital: "University College Hospital",
    email: "c.eze@uch-radiology.edu",
  },
  jenkins: {
    title: "Dr.",
    fullName: "Sarah Jenkins",
    specialty: "Emergency Medicine Physician",
    hospital: "St. Jude Trauma Center",
    email: "s.jenkins@stjude-er.org",
  },
};

export default function RadiographsPage() {
  const { user } = useAuth();

  // Active Doctor state
  const [doctor, setDoctor] = useState({
    title: "Dr.",
    fullName: user?.name?.trim() || "Jane Okonjo",
    specialty: user?.faculty || "Consultant Radiologist",
    hospital: "Apex Specialist Teaching Hospital",
    email: user?.email || "jane.okonjo@apexmed.org",
  });

  const [doctorMenuOpen, setDoctorMenuOpen] = useState(false);
  const [doctorModalOpen, setDoctorModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"signup" | "edit" | "switch">("signup");

  // Form fields for modal
  const [formTitle, setFormTitle] = useState("Dr.");
  const [formName, setFormName] = useState(doctor.fullName);
  const [formSpec, setFormSpec] = useState(doctor.specialty);
  const [formHosp, setFormHosp] = useState(doctor.hospital);
  const [formEmail, setFormEmail] = useState(doctor.email);

  // PACS Workstation State
  const [activeModalityKey, setActiveModalityKey] = useState("thoracic");
  const [isPathologyVisible, setIsPathologyVisible] = useState(false);
  const [isCaliperActive, setIsCaliperActive] = useState(false);
  const [isInverted, setIsInverted] = useState(false);
  const [activePreset, setActivePreset] = useState<"default" | "bone" | "soft" | "lung">("default");
  const [zoomLevelIndex, setZoomLevelIndex] = useState(0);
  const zoomLevels = [1.0, 1.3, 1.6];

  const [contrastVal, setContrastVal] = useState(100);
  const [brightnessVal, setBrightnessVal] = useState(100);
  const [windowWidth, setWindowWidth] = useState("400");
  const [windowLevel, setWindowLevel] = useState("40");

  const [selectedImpression, setSelectedImpression] = useState("");
  const [verificationResult, setVerificationResult] = useState<{
    correct: boolean;
    text: string;
    teachingNote: string;
  } | null>(null);

  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});
  const [completedCasesCount, setCompletedCasesCount] = useState(14);
  const totalCasesTarget = 30;

  // Caliper line state
  const [caliperStart, setCaliperStart] = useState<{ x: number; y: number } | null>(null);
  const [caliperEnd, setCaliperEnd] = useState<{ x: number; y: number } | null>(null);
  const [measuredDistanceCm, setMeasuredDistanceCm] = useState("0.0");
  const [isDraggingCaliper, setIsDraggingCaliper] = useState(false);

  // Toast notification
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const activeModality = MODALITIES[activeModalityKey] || MODALITIES.thoracic;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setToastVisible(true);
    setTimeout(() => {
      setToastVisible(false);
    }, 3200);
  };

  // Helper for Initials
  const getInitials = (name: string) => {
    const cleaned = name.replace(/^(Dr\.|Prof\.|Mr\.|Mrs\.|Ms\.)\s+/i, "").trim();
    const parts = cleaned.split(/\s+/).filter(Boolean);
    if (parts.length === 0) return "DR";
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Switch Modality
  const handleSelectModality = (key: string) => {
    setActiveModalityKey(key);
    setSelectedImpression("");
    setVerificationResult(null);
    setCheckedItems({});
    setIsPathologyVisible(false);
    setIsCaliperActive(false);
    setCaliperStart(null);
    setCaliperEnd(null);
    setMeasuredDistanceCm("0.0");
  };

  // Preset Handler
  const applyPreset = (preset: "default" | "bone" | "soft" | "lung") => {
    setActivePreset(preset);
    if (preset === "default") {
      setContrastVal(100);
      setBrightnessVal(100);
      setWindowWidth("400");
      setWindowLevel("40");
    } else if (preset === "bone") {
      setContrastVal(210);
      setBrightnessVal(135);
      setWindowWidth("2000");
      setWindowLevel("350");
    } else if (preset === "soft") {
      setContrastVal(140);
      setBrightnessVal(110);
      setWindowWidth("350");
      setWindowLevel("50");
    } else if (preset === "lung") {
      setContrastVal(175);
      setBrightnessVal(75);
      setWindowWidth("1500");
      setWindowLevel("-600");
    }
  };

  const resetViewer = () => {
    applyPreset("default");
    setIsInverted(false);
    setIsPathologyVisible(false);
    setIsCaliperActive(false);
    setZoomLevelIndex(0);
    setCaliperStart(null);
    setCaliperEnd(null);
    setMeasuredDistanceCm("0.0");
    showToast("Viewport filters & zoom reset to standard");
  };

  const cycleZoom = () => {
    setZoomLevelIndex((prev) => (prev + 1) % zoomLevels.length);
  };

  // Canvas Drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to element client rect for sharp HD rendering
    const rect = canvas.getBoundingClientRect();
    const w = (rect.width || 640) * (window.devicePixelRatio || 1);
    const h = (rect.height || 420) * (window.devicePixelRatio || 1);
    canvas.width = w;
    canvas.height = h;

    const zoom = zoomLevels[zoomLevelIndex];

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // Film Background
    ctx.fillStyle = isInverted ? "#E2E8F0" : "#0B0F19";
    ctx.fillRect(0, 0, w, h);

    // Centered Zoom
    ctx.translate(w / 2, h / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-w / 2, -h / 2);

    const cx = w / 2;
    const cy = h / 2;

    // Procedural Anatomical Projections
    if (activeModalityKey === "thoracic") {
      // 1. Thoracic CXR
      const grad = ctx.createRadialGradient(cx, cy * 0.9, 40, cx, cy * 0.9, w * 0.5);
      grad.addColorStop(0, isInverted ? "#e2e8f0" : "#141a29");
      grad.addColorStop(1, isInverted ? "#cbd5e1" : "#05070c");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy * 0.95, w * 0.44, h * 0.46, 0, 0, Math.PI * 2);
      ctx.fill();

      // Lung fields
      ctx.fillStyle = isInverted ? "#ffffff" : "#070a10";
      ctx.beginPath();
      ctx.moveTo(cx - 25, cy - h * 0.35);
      ctx.bezierCurveTo(cx - w * 0.38, cy - h * 0.3, cx - w * 0.36, cy + h * 0.28, cx - w * 0.12, cy + h * 0.26);
      ctx.bezierCurveTo(cx - w * 0.08, cy + h * 0.1, cx - 20, cy, cx - 25, cy - h * 0.35);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx + 25, cy - h * 0.35);
      ctx.bezierCurveTo(cx + w * 0.38, cy - h * 0.3, cx + w * 0.36, cy + h * 0.28, cx + w * 0.12, cy + h * 0.26);
      ctx.bezierCurveTo(cx + w * 0.08, cy + h * 0.1, cx + 20, cy, cx + 25, cy - h * 0.35);
      ctx.fill();

      // Spine & Trachea
      ctx.fillStyle = isInverted ? "rgba(71, 85, 105, 0.4)" : "rgba(255, 255, 255, 0.22)";
      ctx.fillRect(cx - 16, cy - h * 0.44, 32, h * 0.88);

      // Clavicles
      ctx.strokeStyle = isInverted ? "rgba(51, 65, 85, 0.8)" : "rgba(255, 255, 255, 0.65)";
      ctx.lineWidth = Math.max(5, w * 0.014);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - h * 0.28);
      ctx.quadraticCurveTo(cx - w * 0.2, cy - h * 0.33, cx - w * 0.35, cy - h * 0.3);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - h * 0.28);
      ctx.quadraticCurveTo(cx + w * 0.2, cy - h * 0.33, cx + w * 0.35, cy - h * 0.3);
      ctx.stroke();

      // Rib arches
      ctx.strokeStyle = isInverted ? "rgba(100, 116, 139, 0.3)" : "rgba(255, 255, 255, 0.25)";
      ctx.lineWidth = Math.max(3, w * 0.007);
      for (let i = 0; i < 7; i++) {
        const off = (i - 3) * (h * 0.07);
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy - h * 0.2 + off);
        ctx.quadraticCurveTo(cx - w * 0.2, cy - h * 0.14 + off, cx - w * 0.35, cy - h * 0.04 + off);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx + 16, cy - h * 0.2 + off);
        ctx.quadraticCurveTo(cx + w * 0.2, cy - h * 0.14 + off, cx + w * 0.35, cy - h * 0.04 + off);
        ctx.stroke();
      }

      // Cardiac silhouette
      ctx.fillStyle = isInverted ? "rgba(75, 85, 99, 0.7)" : "rgba(255, 255, 255, 0.55)";
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - h * 0.1);
      ctx.bezierCurveTo(cx - 35, cy + h * 0.14, cx - 15, cy + h * 0.27, cx, cy + h * 0.27);
      ctx.bezierCurveTo(cx + w * 0.18, cy + h * 0.27, cx + w * 0.16, cy + h * 0.08, cx + 20, cy - h * 0.1);
      ctx.fill();

      // Diaphragms
      ctx.fillStyle = isInverted ? "rgba(100, 116, 139, 0.8)" : "rgba(255, 255, 255, 0.65)";
      ctx.beginPath();
      ctx.moveTo(cx - w * 0.38, cy + h * 0.36);
      ctx.quadraticCurveTo(cx - w * 0.2, cy + h * 0.23, cx, cy + h * 0.29);
      ctx.lineTo(cx, h);
      ctx.lineTo(cx - w * 0.38, h);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(cx, cy + h * 0.29);
      ctx.quadraticCurveTo(cx + w * 0.2, cy + h * 0.26, cx + w * 0.38, cy + h * 0.38);
      ctx.lineTo(cx + w * 0.38, h);
      ctx.lineTo(cx, h);
      ctx.fill();

      // Pathology: RLL Consolidation
      ctx.fillStyle = isInverted ? "rgba(79, 70, 229, 0.45)" : "rgba(255, 255, 255, 0.5)";
      ctx.beginPath();
      ctx.ellipse(cx - w * 0.18, cy + h * 0.15, w * 0.09, h * 0.08, Math.PI / 8, 0, Math.PI * 2);
      ctx.fill();

      if (isPathologyVisible) {
        drawPin(ctx, w, cx - w * 0.18, cy + h * 0.15, "RLL Alveolar Consolidation (Pneumonia)");
      }
    } else if (activeModalityKey === "abdominal") {
      // 2. Abdominal AXR
      ctx.fillStyle = isInverted ? "#cbd5e1" : "#141824";
      ctx.fillRect(cx - w * 0.4, cy - h * 0.46, w * 0.8, h * 0.92);

      ctx.fillStyle = isInverted ? "rgba(51, 65, 85, 0.45)" : "rgba(255, 255, 255, 0.35)";
      for (let i = 0; i < 5; i++) {
        const yb = cy - h * 0.3 + i * (h * 0.1);
        ctx.fillRect(cx - 24, yb, 48, h * 0.07);
      }

      // Small bowel loops
      ctx.fillStyle = isInverted ? "#ffffff" : "#05070a";
      ctx.strokeStyle = isInverted ? "rgba(51, 65, 85, 0.9)" : "rgba(255, 255, 255, 0.6)";
      ctx.lineWidth = 2.5;

      const loopTops = [cy - h * 0.18, cy - h * 0.05, cy + h * 0.08];
      loopTops.forEach((ly, idx) => {
        const lx = cx - w * 0.2 + idx * 25;
        ctx.beginPath();
        ctx.roundRect(lx, ly, w * 0.32, h * 0.09, 14);
        ctx.fill();
        ctx.stroke();

        for (let p = lx + 12; p < lx + w * 0.32 - 10; p += 12) {
          ctx.beginPath();
          ctx.moveTo(p, ly);
          ctx.lineTo(p, ly + h * 0.09);
          ctx.stroke();
        }
      });

      if (isPathologyVisible) {
        drawPin(ctx, w, cx - w * 0.05, cy - h * 0.05, "Dilated Small Bowel Loops (>3.5cm) with Plicae Circulares");
      }
    } else if (activeModalityKey === "pelvic") {
      // 3. Pelvis & Hip
      ctx.strokeStyle = isInverted ? "#334155" : "#E2E8F0";
      ctx.lineWidth = Math.max(4, w * 0.012);

      ctx.beginPath();
      ctx.moveTo(cx - 30, cy - h * 0.35);
      ctx.bezierCurveTo(cx - w * 0.42, cy - h * 0.3, cx - w * 0.42, cy + h * 0.05, cx - w * 0.2, cy + h * 0.15);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx + 30, cy - h * 0.35);
      ctx.bezierCurveTo(cx + w * 0.42, cy - h * 0.3, cx + w * 0.42, cy + h * 0.05, cx + w * 0.2, cy + h * 0.15);
      ctx.stroke();

      // Right Femur & Normal Shenton's Line
      ctx.beginPath();
      ctx.arc(cx - w * 0.25, cy + h * 0.12, 28, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#10B981";
      ctx.lineWidth = 2.5;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.arc(cx - w * 0.22, cy + h * 0.18, 36, Math.PI * 0.6, Math.PI * 1.3);
      ctx.stroke();
      ctx.setLineDash([]);

      // Left Femur & Fracture
      ctx.strokeStyle = isInverted ? "#334155" : "#E2E8F0";
      ctx.lineWidth = Math.max(4, w * 0.012);
      ctx.beginPath();
      ctx.arc(cx + w * 0.24, cy + h * 0.1, 26, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.21, cy + h * 0.13);
      ctx.lineTo(cx + w * 0.29, cy + h * 0.17);
      ctx.stroke();

      if (isPathologyVisible) {
        drawPin(ctx, w, cx + w * 0.25, cy + h * 0.15, "Broken Shenton's Line: Displaced Femoral Neck Fracture");
      }
    } else if (activeModalityKey === "skull") {
      // 4. Skull
      ctx.strokeStyle = isInverted ? "#1E293B" : "#F1F5F9";
      ctx.lineWidth = 5;

      ctx.beginPath();
      ctx.ellipse(cx, cy - 20, w * 0.28, h * 0.36, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeRect(cx - w * 0.16, cy - 10, w * 0.11, h * 0.12);
      ctx.strokeRect(cx + w * 0.05, cy - 10, w * 0.11, h * 0.12);

      // Fracture
      ctx.strokeStyle = isInverted ? "#DC2626" : "#F87171";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.12, cy - h * 0.28);
      ctx.lineTo(cx + w * 0.25, cy - h * 0.05);
      ctx.stroke();

      if (isPathologyVisible) {
        drawPin(ctx, w, cx + w * 0.18, cy - h * 0.16, "Linear Parietotemporal Fracture crossing meningeal groove");
      }
    } else if (activeModalityKey === "pns") {
      // 5. PNS Waters
      ctx.strokeStyle = isInverted ? "#334155" : "#E2E8F0";
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.arc(cx, cy - h * 0.08, w * 0.32, 0, Math.PI * 2);
      ctx.stroke();

      // Normal Left Maxillary Sinus
      ctx.fillStyle = isInverted ? "#ffffff" : "#05070a";
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.06, cy - h * 0.02);
      ctx.lineTo(cx + w * 0.22, cy - h * 0.02);
      ctx.lineTo(cx + w * 0.14, cy + h * 0.18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Maxillary Sinus with Air-Fluid Meniscus
      const rmx = cx - w * 0.22;
      const rmy = cy - h * 0.02;
      const fluidTop = rmy + h * 0.09;

      ctx.fillStyle = isInverted ? "rgba(79, 70, 229, 0.6)" : "rgba(255, 255, 255, 0.65)";
      ctx.beginPath();
      ctx.moveTo(rmx + 12, fluidTop);
      ctx.lineTo(rmx + w * 0.16 - 12, fluidTop);
      ctx.lineTo(rmx + w * 0.08, rmy + h * 0.2);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = isInverted ? "#ffffff" : "#05070a";
      ctx.beginPath();
      ctx.moveTo(rmx, rmy);
      ctx.lineTo(rmx + w * 0.16, rmy);
      ctx.lineTo(rmx + w * 0.16 - 12, fluidTop);
      ctx.lineTo(rmx + 12, fluidTop);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = "#F59E0B";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(rmx + 10, fluidTop);
      ctx.lineTo(rmx + w * 0.16 - 10, fluidTop);
      ctx.stroke();

      if (isPathologyVisible) {
        drawPin(ctx, w, rmx + w * 0.08, fluidTop, "Horizontal Air-Fluid Level in Right Maxillary Sinus");
      }
    } else if (activeModalityKey === "spine") {
      // 6. Spine Lateral
      ctx.fillStyle = isInverted ? "rgba(71, 85, 105, 0.5)" : "rgba(255, 255, 255, 0.45)";
      ctx.strokeStyle = isInverted ? "#1E293B" : "#FFFFFF";
      ctx.lineWidth = 3;

      const bodies = [
        { y: cy - h * 0.32, xOff: 0 },
        { y: cy - h * 0.2, xOff: 0 },
        { y: cy - h * 0.08, xOff: 0 },
        { y: cy + h * 0.04, xOff: 24 }, // Subluxation step
        { y: cy + h * 0.16, xOff: 24 },
        { y: cy + h * 0.28, xOff: 24 },
      ];

      bodies.forEach((b) => {
        const bx = cx - 40 + b.xOff;
        ctx.fillRect(bx, b.y, 65, h * 0.08);
        ctx.strokeRect(bx, b.y, 65, h * 0.08);
      });

      if (isPathologyVisible) {
        drawPin(ctx, w, cx - 16, cy + h * 0.04, "C5-C6 Anterior Subluxation with Line Step-off");
      }
    } else if (activeModalityKey === "extremities") {
      // 7. Extremities
      ctx.fillStyle = isInverted ? "rgba(71, 85, 105, 0.45)" : "rgba(255, 255, 255, 0.4)";
      ctx.strokeStyle = isInverted ? "#1E293B" : "#FFFFFF";
      ctx.lineWidth = 3.5;

      ctx.fillRect(cx - 60, cy - 20, 50, h * 0.45);
      ctx.strokeRect(cx - 60, cy - 20, 50, h * 0.45);

      ctx.fillRect(cx + 10, cy - 10, 32, h * 0.43);
      ctx.strokeRect(cx + 10, cy - 10, 32, h * 0.43);

      // Fracture
      ctx.strokeStyle = "#EF4444";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx - 65, cy + 25);
      ctx.lineTo(cx - 5, cy + 18);
      ctx.stroke();

      if (isPathologyVisible) {
        drawPin(ctx, w, cx - 35, cy + 22, "Colles' Distal Radius Fracture (Cortical Disruption)");
      }
    }

    // Caliper line
    if (caliperStart && caliperEnd) {
      ctx.strokeStyle = "#6366F1";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(caliperStart.x, caliperStart.y);
      ctx.lineTo(caliperEnd.x, caliperEnd.y);
      ctx.stroke();

      const angle = Math.atan2(caliperEnd.y - caliperStart.y, caliperEnd.x - caliperStart.x) + Math.PI / 2;
      const tickLen = 8;

      ctx.beginPath();
      ctx.moveTo(caliperStart.x - Math.cos(angle) * tickLen, caliperStart.y - Math.sin(angle) * tickLen);
      ctx.lineTo(caliperStart.x + Math.cos(angle) * tickLen, caliperStart.y + Math.sin(angle) * tickLen);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(caliperEnd.x - Math.cos(angle) * tickLen, caliperEnd.y - Math.sin(angle) * tickLen);
      ctx.lineTo(caliperEnd.x + Math.cos(angle) * tickLen, caliperEnd.y + Math.sin(angle) * tickLen);
      ctx.stroke();
    }

    ctx.restore();
  }, [
    activeModalityKey,
    isPathologyVisible,
    isInverted,
    zoomLevelIndex,
    caliperStart,
    caliperEnd,
    contrastVal,
    brightnessVal,
  ]);

  function drawPin(ctx: CanvasRenderingContext2D, w: number, x: number, y: number, label: string) {
    ctx.save();
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 3]);
    ctx.beginPath();
    ctx.arc(x, y, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = "#F59E0B";
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(15, 23, 42, 0.9)";
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 1.5;
    const txt = "⚠ " + label;
    ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
    const textWidth = ctx.measureText(txt).width;

    const boxX = Math.min(w - textWidth - 30, Math.max(20, x - textWidth / 2));
    const boxY = Math.max(30, y - 45);

    ctx.fillRect(boxX, boxY, textWidth + 18, 26);
    ctx.strokeRect(boxX, boxY, textWidth + 18, 26);

    ctx.fillStyle = "#FEF3C7";
    ctx.fillText(txt, boxX + 9, boxY + 17);
    ctx.restore();
  }

  // Caliper Mouse Handlers
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCaliperActive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const start = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    setCaliperStart(start);
    setCaliperEnd(start);
    setIsDraggingCaliper(true);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isCaliperActive || !isDraggingCaliper || !caliperStart || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;

    const end = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
    setCaliperEnd(end);

    const dx = end.x - caliperStart.x;
    const dy = end.y - caliperStart.y;
    const distPx = Math.sqrt(dx * dx + dy * dy);
    const distCm = (distPx * 0.038).toFixed(1);
    setMeasuredDistanceCm(distCm);
  };

  const handleCanvasMouseUp = () => {
    setIsDraggingCaliper(false);
  };

  const toggleCaliper = () => {
    setIsCaliperActive((prev) => {
      const next = !prev;
      if (next) {
        showToast("Caliper Active: Click & drag on radiograph to measure in cm");
      } else {
        setCaliperStart(null);
        setCaliperEnd(null);
        setMeasuredDistanceCm("0.0");
      }
      return next;
    });
  };

  // Report Verification
  const verifyCurrentReport = () => {
    if (!selectedImpression) {
      showToast("⚠️ Please select a provisional impression first");
      return;
    }

    const isMatch = selectedImpression === activeModality.correctVal;
    if (isMatch) {
      setVerificationResult({
        correct: true,
        text: activeModality.correctFeedback,
        teachingNote: activeModality.teachingNote,
      });
      setCompletedCasesCount((c) => Math.min(totalCasesTarget, c + 1));
      showToast(`Report signed & confirmed by ${doctor.title} ${doctor.fullName}! 🎯`);
    } else {
      setVerificationResult({
        correct: false,
        text: `✕ Diagnostic Discrepancy: The selected option does not correlate with the primary finding on this ${activeModality.name} projection. Review the systematic checklist and toggle the Pathology Pin for localization.`,
        teachingNote: activeModality.teachingNote,
      });
      showToast("Discrepancy noted. Re-examine anatomical landmarks.");
    }
  };

  // Switch demo clinicians
  const quickSelectDemo = (key: "okonjo" | "eze" | "jenkins") => {
    const d = DEMO_CLINICIANS[key];
    setDoctor(d);
    setFormTitle(d.title);
    setFormName(d.fullName);
    setFormSpec(d.specialty);
    setFormHosp(d.hospital);
    setFormEmail(d.email);
    setDoctorModalOpen(false);
    showToast(`Welcome, ${d.title} ${d.fullName}! Profile loaded.`);
  };

  // Doctor Form Submit
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
      hospital: formHosp.trim() || "Apex Specialist Hospital PACS",
      email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, ".")}@medscope.org`,
    };
    setDoctor(updated);
    setDoctorModalOpen(false);
    showToast(`Doctor profile updated: ${updated.title} ${updated.fullName}`);
  };

  const scrollToViewer = () => {
    const el = document.getElementById("pacsSection");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const checkedCount = Object.values(checkedItems).filter(Boolean).length;

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col gap-6 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-12">
      {/* ======================== TOAST NOTIFICATION CONTAINER ======================== */}
      <div
        className={`fixed top-5 right-5 z-50 transform transition-all duration-300 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs sm:text-sm font-medium border border-slate-700 ${
          toastVisible ? "translate-y-0 opacity-100" : "-translate-y-12 opacity-0 pointer-events-none"
        }`}
      >
        <span>✨</span>
        <span>{toastMessage}</span>
      </div>

      {/* ==================== 1. TOP HEADER & DOCTOR PROFILE BAR ==================== */}
      <header className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Medscope Branding & Logo */}
        <div className="flex items-center gap-3">
          <Link
            href="/app"
            className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 hover:scale-105 transition"
            title="Return to Dashboard"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-serif">Medscope</h1>
              <span className="text-[10px] uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold border border-indigo-100">
                Radiology PACS
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium tracking-wide">Image • Interpret • Succeed</p>
          </div>
        </div>

        {/* Center Greeting & Institution Info */}
        <div className="hidden md:block text-left">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5 font-serif">
            Good morning, {doctor.title} {doctor.fullName}! 👋
          </h2>
          <p className="text-xs text-slate-400 font-medium">Ready to interpret today&apos;s radiography cases?</p>
        </div>

        {/* Right Action Items */}
        <div className="flex items-center gap-3 ml-auto sm:ml-0">
          <Link
            href="/app"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 transition border border-slate-200"
          >
            <span>← Dashboard</span>
          </Link>

          {/* Quick Modality Jump */}
          <a
            href="#modalitySelector"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-indigo-600 transition border border-slate-200"
          >
            <span>7 Modalities</span>
            <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md font-bold">
              Live
            </span>
          </a>

          {/* Notification Bell */}
          <button
            type="button"
            onClick={() => showToast("3 STAT emergency plain radiographs pending sign-off")}
            className="relative w-10 h-10 rounded-xl border border-slate-200/80 bg-white flex items-center justify-center hover:bg-slate-50 transition text-slate-600 shadow-xs"
            title="Emergency Notifications"
          >
            <span className="text-lg">🔔</span>
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          </button>

          {/* Doctor Profile Badge & Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setDoctorMenuOpen(!doctorMenuOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-2xl hover:bg-slate-50 transition border border-slate-200/80 focus:outline-none"
            >
              <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs ring-2 ring-indigo-100">
                {getInitials(doctor.fullName)}
              </div>
              <div className="text-left pr-1 hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {doctor.title} {doctor.fullName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">{doctor.specialty}</p>
              </div>
              <span className="text-xs text-slate-400">▾</span>
            </button>

            {/* Dropdown Menu */}
            {doctorMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 text-xs">
                <div className="px-4 py-2.5 border-b border-slate-100">
                  <p className="font-extrabold text-slate-900 text-xs">
                    {doctor.title} {doctor.fullName}
                  </p>
                  <p className="text-[11px] text-slate-500 font-medium">{doctor.hospital}</p>
                  <span className="inline-block mt-1 text-[9px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-100">
                    {doctor.specialty}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalMode("signup");
                    setDoctorMenuOpen(false);
                    setDoctorModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold transition"
                >
                  <span>➕</span> Register New Doctor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalMode("edit");
                    setDoctorMenuOpen(false);
                    setDoctorModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold transition"
                >
                  <span>✏️</span> Edit Clinician Profile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalMode("switch");
                    setDoctorMenuOpen(false);
                    setDoctorModalOpen(true);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center gap-2 text-slate-700 font-semibold transition"
                >
                  <span>🔄</span> Switch / Demo Accounts
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile greeting view */}
      <div className="md:hidden bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-base font-bold text-slate-900 font-serif">
          Good morning, {doctor.title} {doctor.fullName}! 👋
        </h2>
        <p className="text-xs text-slate-400 font-medium mt-0.5">Ready to interpret today&apos;s radiography cases?</p>
      </div>

      {/* ==================== 2. HERO BANNER ==================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-indigo-950 to-indigo-900 text-white p-6 sm:p-8 shadow-md border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-block text-[10px] tracking-widest uppercase font-extrabold text-indigo-300 bg-white/10 px-3 py-1 rounded-full backdrop-blur-xs border border-white/10">
            MEDSCOPE PACS WORKSTATION
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-3 leading-tight tracking-tight font-serif">
            Your eye for detail.<br className="hidden sm:inline" /> Our systematic approach.
          </h3>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 font-normal leading-relaxed opacity-95">
            Review plain film projections, manipulate high-contrast window/level (WW/WL) settings, trace lesions with interactive calipers, and verify cases with systematic checklists.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={scrollToViewer}
              className="px-5 py-2.5 bg-white text-indigo-950 rounded-xl text-xs font-bold shadow hover:bg-indigo-50 transition flex items-center gap-2"
            >
              <span>Launch Active Workstation</span>
              <span>↓</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setModalMode("switch");
                setDoctorModalOpen(true);
              }}
              className="px-4 py-2.5 bg-white/15 hover:bg-white/20 text-white rounded-xl text-xs font-semibold backdrop-blur-xs transition flex items-center gap-1.5"
            >
              <span>Switch Clinician</span>
              <span>👨‍⚕️</span>
            </button>
          </div>
        </div>

        {/* Watermark Graphic */}
        <div className="absolute -right-6 -bottom-8 opacity-15 text-white pointer-events-none select-none text-9xl">
          🫁
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
              <p className="text-xs font-semibold text-slate-400">Reporting Streak</p>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">5 days</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 font-medium mt-3">Keep it going!</p>
        </div>

        {/* 2. Daily Goal */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
              ⏱️
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Daily Film Goal</p>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">2 hours</p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-3/4" />
            </div>
          </div>
        </div>

        {/* 3. Cases Verified */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
              ✅
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400">Cases Interpreted</p>
              <p className="text-xl font-extrabold text-slate-900 leading-tight">
                {completedCasesCount} of {totalCasesTarget}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, (completedCasesCount / totalCasesTarget) * 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* 4. Concordance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-400">Concordance</p>
            <p className="text-xl font-extrabold text-slate-900 leading-tight">92%</p>
            <span className="inline-block mt-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
              Verified Target Met
            </span>
          </div>
          <div className="relative w-12 h-12 rounded-full bg-indigo-50 border-2 border-indigo-600 flex items-center justify-center">
            <span className="text-xs font-extrabold text-indigo-700">92%</span>
          </div>
        </div>
      </div>

      {/* ==================== 4. X-RAY MODALITY SELECTOR (7 TYPES) ==================== */}
      <section id="modalitySelector" className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2 font-serif">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
              Select Examination Modality & Projection
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Choose from 7 clinical plain film projections to load pathology, simulated DICOM series, and systematic review checklist.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full border border-indigo-200 self-start sm:self-auto">
            Active: {activeModality.name} ({activeModality.modalityLabel})
          </span>
        </div>

        {/* 7 Modality Buttons Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {Object.entries(MODALITIES).map(([key, item]) => {
            const isActive = activeModalityKey === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectModality(key)}
                className={`p-3 rounded-2xl border transition flex flex-col items-center justify-center text-center group ${
                  isActive
                    ? "border-indigo-600 bg-indigo-50 text-indigo-950 font-bold shadow-xs ring-1 ring-indigo-500/30"
                    : "border-slate-200 bg-slate-50/70 hover:bg-indigo-50/50 hover:border-indigo-300 text-slate-700 font-semibold"
                }`}
              >
                <span className="text-2xl group-hover:scale-110 transition">{item.icon}</span>
                <span className="text-xs mt-1.5 font-bold leading-tight">{item.name}</span>
                <span className="text-[10px] text-indigo-600 font-medium mt-0.5">{item.modalityLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ==================== 5. INTERACTIVE PACS WORKSTATION CARD ==================== */}
      <section id="pacsSection" className="bg-slate-900 rounded-3xl border border-slate-800 text-slate-100 shadow-xl overflow-hidden">
        {/* Top Station Bar */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-base font-bold shadow-xs">
              {activeModality.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-extrabold text-white font-serif">{activeModality.projection}</h4>
                <span className="text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/60 px-2.5 py-0.5 rounded-full">
                  {activeModality.clinicalTag}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono">{activeModality.patientMeta}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
              ● DICOM Viewport Ready
            </span>
            <button
              type="button"
              onClick={resetViewer}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition border border-slate-700"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* Workstation Body */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Viewport & Tools (7 Cols) */}
          <div className="lg:col-span-7 p-4 sm:p-5 bg-slate-950 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-slate-800">
            {/* Viewport Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              {/* Presets */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <span className="text-[11px] text-slate-400 mr-1 font-mono">Window:</span>
                <button
                  type="button"
                  onClick={() => applyPreset("default")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    activePreset === "default" ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  Standard
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("bone")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    activePreset === "bone" ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  Bone
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("soft")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    activePreset === "soft" ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  Soft Tissue
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("lung")}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    activePreset === "lung" ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  Lung / Air
                </button>
                <button
                  type="button"
                  onClick={() => setIsInverted(!isInverted)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ${
                    isInverted ? "bg-indigo-600 text-white" : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                  }`}
                >
                  Invert Film
                </button>
              </div>

              {/* Tools */}
              <div className="flex items-center gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={toggleCaliper}
                  className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 border transition ${
                    isCaliperActive
                      ? "bg-indigo-600 text-white border-indigo-400"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700"
                  }`}
                >
                  <span>📏 Caliper</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPathologyVisible(!isPathologyVisible);
                    if (!isPathologyVisible) showToast("Pathology landmark highlighted");
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] flex items-center gap-1 border transition ${
                    isPathologyVisible
                      ? "bg-amber-500 text-slate-950 font-bold border-amber-400"
                      : "bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border-amber-500/30"
                  }`}
                >
                  <span>👁️ Pathology Pin</span>
                </button>
                <button
                  type="button"
                  onClick={cycleZoom}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px]"
                >
                  Zoom: {Math.round(zoomLevels[zoomLevelIndex] * 100)}%
                </button>
              </div>
            </div>

            {/* Simulated HTML5 Canvas Viewport */}
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/10] bg-black rounded-2xl overflow-hidden my-3.5 border border-slate-800 flex items-center justify-center select-none shadow-inner">
              <canvas
                ref={canvasRef}
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
                style={{
                  filter: `contrast(${contrastVal}%) brightness(${brightnessVal}%)`,
                }}
                className="w-full h-full object-contain cursor-crosshair"
              />

              {/* Corner Overlays */}
              <div className="absolute top-3 left-3 text-[11px] font-mono text-emerald-400 pointer-events-none drop-shadow leading-tight">
                MOD: {activeModality.modalityLabel}
                <br />
                KVp: {activeModality.kvp} | mAs: {activeModality.mas}
                <br />
                MATRIX: 2048 x 2048
              </div>
              <div className="absolute top-3 right-3 text-[11px] font-mono text-emerald-400 pointer-events-none drop-shadow text-right leading-tight">
                WW: {windowWidth} | WL: {windowLevel}
                <br />
                ROT: 0° | L: R-ERECT
                <br />
                INSTITUTION: MEDSCOPE RAD
              </div>
              <div className="absolute bottom-3 left-3 text-[11px] font-mono text-emerald-400 pointer-events-none drop-shadow">
                SERIES: 1 / 1 (UNCOMPRESSED DICOM)
              </div>

              {/* Caliper readout */}
              {isCaliperActive && caliperEnd && (
                <div className="absolute bottom-3 right-3 text-xs font-mono bg-indigo-950 text-indigo-200 border border-indigo-700 px-3 py-1.5 rounded-lg shadow-lg">
                  Measured Distance: {measuredDistanceCm} cm
                </div>
              )}
            </div>

            {/* Contrast & Brightness Sliders */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="flex justify-between text-slate-400 text-[11px] font-mono mb-1">
                  <span>Contrast (WW)</span>
                  <span>{contrastVal}%</span>
                </div>
                <input
                  type="range"
                  min="60"
                  max="240"
                  value={contrastVal}
                  onChange={(e) => setContrastVal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
              <div>
                <div className="flex justify-between text-slate-400 text-[11px] font-mono mb-1">
                  <span>Brightness (WL)</span>
                  <span>{brightnessVal}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="170"
                  value={brightnessVal}
                  onChange={(e) => setBrightnessVal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Systematic Review & Diagnostic Reporting (5 Cols) */}
          <div className="lg:col-span-5 p-5 bg-slate-900 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold text-sm text-white font-serif">{activeModality.checklistName}</h4>
                  <span className="text-[11px] text-indigo-400 font-mono">
                    {checkedCount} / {activeModality.checklistItems.length} Evaluated
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Scrutinize every anatomical compartment before formulating diagnosis.
                </p>
              </div>

              {/* Dynamic Checklist */}
              <div className="space-y-2 text-xs bg-slate-950/70 p-3.5 rounded-xl border border-slate-800">
                {activeModality.checklistItems.map((item) => (
                  <label
                    key={item.code}
                    className="flex items-start gap-2.5 cursor-pointer text-slate-300 hover:text-white transition"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(checkedItems[item.code])}
                      onChange={(e) =>
                        setCheckedItems((prev) => ({
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

              {/* Impression Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 font-serif">
                  Primary Radiological Impression
                </label>
                <select
                  value={selectedImpression}
                  onChange={(e) => setSelectedImpression(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded-xl p-3 focus:border-indigo-500 focus:outline-none"
                >
                  {activeModality.options.map((opt) => (
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
                        {verificationResult.teachingNote}
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

            {/* Submission Controls */}
            <div className="pt-5 border-t border-slate-800 space-y-2 mt-4">
              <button
                type="button"
                onClick={verifyCurrentReport}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                <span>Sign & Verify Provisional Report</span>
                <span>✓</span>
              </button>
              <button
                type="button"
                onClick={() => showToast(`Faculty Note: ${activeModality.teachingNote}`)}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
              >
                Faculty Radiologist Diagnostic Pearls ↗
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
              Active Case Worklist for <span className="text-indigo-700">{activeModality.name}</span>
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Select any patient study below to examine series directly in the workstation viewport.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-400 self-start sm:self-auto">
            Rotation Date: Tue, Oct 20, 2026
          </span>
        </div>

        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-100 font-semibold text-[11px] uppercase tracking-wider">
                <th className="pb-3 pl-1">Case ID & Series</th>
                <th className="pb-3">Clinical Indication & History</th>
                <th className="pb-3">Key Radiologic Finding</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 text-right pr-1">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeModality.cases.map((c) => (
                <tr key={c.id} className="group hover:bg-slate-50/70 transition">
                  <td className="py-3.5 pl-1 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      🩻
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 text-xs">{c.id}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{c.proj}</p>
                    </div>
                  </td>
                  <td className="py-3.5 text-slate-600 font-medium max-w-xs">{c.indication}</td>
                  <td className="py-3.5 text-slate-700 font-semibold text-[11px]">{c.sign}</td>
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
                        showToast(`Loaded study ${c.id} into viewer`);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-xs"
                    >
                      Inspect
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
            onClick={() => showToast("Exported Radiography Case Logbook (PDF)")}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700"
          >
            Export Logbook (PDF) →
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-center">
          {/* Weekly Film Hours */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs font-semibold text-slate-500">Weekly Plain Film Hours</span>
              <span className="text-[11px] font-bold text-indigo-600">89% of target</span>
            </div>
            <p className="text-2xl font-extrabold text-slate-900">
              12.5 <span className="text-xs text-slate-400 font-semibold">/ 14 hrs</span>
            </p>
            <div className="w-full bg-slate-200 h-2 rounded-full mt-3 overflow-hidden">
              <div className="bg-indigo-600 h-full rounded-full w-[89%]" />
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              Logged 68 plain radiographs this clinical block
            </p>
          </div>

          {/* Daily Activity Bar Chart */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <p className="text-xs font-semibold text-slate-500 mb-2">Daily Cases Interpreted</p>
            <div className="flex items-end justify-between gap-2 h-16 pt-2">
              {[
                { day: "Mon", h: "h-7", bg: "bg-indigo-200" },
                { day: "Tue", h: "h-11", bg: "bg-indigo-300" },
                { day: "Wed", h: "h-14", bg: "bg-indigo-600" },
                { day: "Thu", h: "h-8", bg: "bg-indigo-300" },
                { day: "Fri", h: "h-12", bg: "bg-indigo-400" },
                { day: "Sat", h: "h-4", bg: "bg-slate-200" },
                { day: "Sun", h: "h-10", bg: "bg-indigo-500" },
              ].map((bar) => (
                <div key={bar.day} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className={`w-full ${bar.bg} rounded-t-md ${bar.h} transition`} />
                  <span className="text-[9px] font-bold text-slate-400">{bar.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Modality Specific Accuracy */}
          <div className="space-y-2 text-xs bg-slate-50/70 p-4 rounded-xl border border-slate-100">
            <p className="font-bold text-slate-800 text-xs mb-1">Concordance by Projection</p>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Thoracic / CXR
              </span>
              <span className="font-bold text-slate-800">94%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500" /> Pelvic & Hip Trauma
              </span>
              <span className="font-bold text-slate-800">90%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Abdomen / Obstruction
              </span>
              <span className="font-bold text-slate-800">86%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Skull & Facial Bones
              </span>
              <span className="font-bold text-slate-800">82%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500" /> Paranasal Sinuses
              </span>
              <span className="font-bold text-slate-800">88%</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== DOCTOR SIGN-UP & PROFILE MODAL ==================== */}
      {doctorModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 my-8 animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-md shadow-indigo-100 font-black">
                  🩻
                </div>
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight font-serif">
                    {modalMode === "edit"
                      ? "Edit Clinician Profile"
                      : modalMode === "switch"
                      ? "Switch Reporting Clinician"
                      : "Doctor Onboarding & Registration"}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Create your clinical profile to sign films and track concordance.
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
                ⚡ 1-Click Clinician Presets:
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
                  <p className="text-[9px] text-slate-400">Consultant Rad</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickSelectDemo("eze")}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition group"
                >
                  <p className="font-bold text-[11px] text-slate-800 group-hover:text-indigo-600 leading-tight">
                    Dr. Chinedu Eze
                  </p>
                  <p className="text-[9px] text-slate-400">Resident</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickSelectDemo("jenkins")}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-50 hover:border-indigo-300 border border-slate-200 text-left transition group"
                >
                  <p className="font-bold text-[11px] text-slate-800 group-hover:text-indigo-600 leading-tight">
                    Dr. S. Jenkins
                  </p>
                  <p className="text-[9px] text-slate-400">ER Physician</p>
                </button>
              </div>
            </div>

            {/* Registration Form */}
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
                    <option value="Resident">Res.</option>
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
                  <label className="block font-bold text-slate-700 mb-1">Specialty / Role</label>
                  <select
                    value={formSpec}
                    onChange={(e) => setFormSpec(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="Consultant Radiologist">Consultant Radiologist</option>
                    <option value="Radiology Resident">Radiology Resident</option>
                    <option value="Emergency Medicine Physician">Emergency Medicine Physician</option>
                    <option value="Orthopedic Surgeon">Orthopedic Surgeon</option>
                    <option value="Medical Intern">Medical Intern</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Institution</label>
                  <input
                    type="text"
                    required
                    value={formHosp}
                    onChange={(e) => setFormHosp(e.target.value)}
                    placeholder="e.g. Apex Teaching Hospital"
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
                  placeholder="doctor@hospital.org"
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
                  <span>Apply & Load PACS</span>
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
