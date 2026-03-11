import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-Memory Database
const db = {
  users: [] as any[],
  patients: [] as any[],
  messages: [] as any[],
  events: [] as any[],
  nextUserId: 1,
  nextEventId: 1,
  nextMessageId: 1,
};

// Helper to get current timestamp in SQLite format (YYYY-MM-DD HH:MM:SS)
const getTimestamp = () => new Date().toISOString().replace('T', ' ').split('.')[0];

// Helper to log events
const logEvent = (type: string, message: string, status: string = 'Info') => {
  db.events.push({
    id: db.nextEventId++,
    type,
    message,
    status,
    timestamp: getTimestamp()
  });
};

// Seed Initial Data
if (db.patients.length === 0) {
  const seedPatients = [
    { 
      id: 'PAT-829102', 
      firstName: 'John', 
      lastName: 'Doe', 
      phone: '555-0101', 
      mriImage: 'https://picsum.photos/seed/mri1/400/400', 
      notes: 'Routine checkup, history of headaches.', 
      status: 'Pending',
      dateAdded: getTimestamp(),
      analysisResult: null
    },
    { 
      id: 'PAT-192837', 
      firstName: 'Jane', 
      lastName: 'Smith', 
      phone: '555-0102', 
      mriImage: 'https://picsum.photos/seed/mri2/400/400', 
      notes: 'Memory loss symptoms reported.', 
      status: 'Analyzed', 
      dateAdded: getTimestamp(),
      analysisResult: JSON.stringify([
        { label: "Normal", confidence: 10 },
        { label: "Mild Abnormality", confidence: 15 },
        { label: "Moderate Lesion", confidence: 65 },
        { label: "Severe Abnormality", confidence: 8 },
        { label: "Critical / Tumor", confidence: 2 },
      ]) 
    },
    { 
      id: 'PAT-475839', 
      firstName: 'Robert', 
      lastName: 'Brown', 
      phone: '555-0103', 
      mriImage: 'https://picsum.photos/seed/mri3/400/400', 
      notes: 'Severe disorientation.', 
      status: 'Done', 
      dateAdded: getTimestamp(),
      analysisResult: JSON.stringify([
        { label: "Normal", confidence: 5 },
        { label: "Mild Abnormality", confidence: 5 },
        { label: "Moderate Lesion", confidence: 10 },
        { label: "Severe Abnormality", confidence: 20 },
        { label: "Critical / Tumor", confidence: 60 },
      ]) 
    },
  ];

  seedPatients.forEach(p => {
    db.patients.push(p);
    logEvent('Patient Registration', `New patient registered: ${p.firstName} ${p.lastName} (${p.id})`, 'Success');
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // Auth Routes
  app.post("/api/auth/login", (req, res) => {
    const { email, password } = req.body;
    const user = db.users.find(u => u.email === email && u.password === password);
    if (user) {
      logEvent('User Login', `User ${user.email} logged in`, 'Info');
      res.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
    } else {
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  app.post("/api/auth/register", (req, res) => {
    const { firstName, lastName, email, phone, password } = req.body;
    if (db.users.some(u => u.email === email)) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }
    const newUser = {
      id: db.nextUserId++,
      firstName,
      lastName,
      email,
      phone,
      password
    };
    db.users.push(newUser);
    logEvent('User Registration', `New user registered: ${email}`, 'Success');
    res.json({ success: true, userId: newUser.id });
  });

  // Patient Routes
  app.get("/api/patients", (req, res) => {
    const patients = [...db.patients].sort((a, b) => b.dateAdded.localeCompare(a.dateAdded));
    res.json(patients);
  });

  app.post("/api/patients", (req, res) => {
    let { id, firstName, lastName, phone, mriImage, notes } = req.body;
    
    if (!id || id === 'null' || id.trim() === '') {
      const randomId = Math.floor(100000 + Math.random() * 900000);
      id = `PAT-${randomId}`;
    } else {
      id = id.trim();
    }

    const newPatient = {
      id,
      firstName,
      lastName,
      phone,
      mriImage,
      notes,
      status: 'Pending',
      dateAdded: getTimestamp(),
      analysisResult: null
    };

    db.patients.push(newPatient);
    logEvent('Patient Registration', `New patient registered: ${firstName} ${lastName} (${id})`, 'Success');
    res.json({ success: true, id });
  });

  app.post("/api/patients/:id/analyze", (req, res) => {
    const { id } = req.params;
    const patientIndex = db.patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    const mockResults = [
      { label: "Normal", confidence: Math.random() * 100 },
      { label: "Mild Abnormality", confidence: Math.random() * 100 },
      { label: "Moderate Lesion", confidence: Math.random() * 100 },
      { label: "Severe Abnormality", confidence: Math.random() * 100 },
      { label: "Critical / Tumor", confidence: Math.random() * 100 },
    ];
    
    const total = mockResults.reduce((acc, curr) => acc + curr.confidence, 0);
    const normalized = mockResults.map(r => ({ ...r, confidence: Math.round((r.confidence / total) * 100) }));
    
    db.patients[patientIndex].status = 'Analyzed';
    db.patients[patientIndex].analysisResult = JSON.stringify(normalized);
    
    logEvent('AI Analysis', `Analysis completed for patient ID: ${id}`, 'Success');
    res.json({ success: true, patient: db.patients[patientIndex] });
  });

  app.post("/api/patients/:id/confirm", (req, res) => {
    const { id } = req.params;
    const patientIndex = db.patients.findIndex(p => p.id === id);
    
    if (patientIndex === -1) {
      return res.status(404).json({ success: false, message: "Patient not found" });
    }

    db.patients[patientIndex].status = 'Done';
    logEvent('Diagnosis Confirmed', `Diagnosis confirmed for patient ID: ${id}`, 'Info');
    res.json({ success: true, patient: db.patients[patientIndex] });
  });

  app.delete("/api/patients/:id", (req, res) => {
    const id = req.params.id.trim();
    const patientIndex = db.patients.findIndex(p => p.id === id);
    
    if (patientIndex !== -1) {
      const patient = db.patients[patientIndex];
      db.patients.splice(patientIndex, 1);
      logEvent('Patient Deleted', `Patient ${patient.firstName} ${patient.lastName} (${id}) was deleted`, 'Warning');
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: `Patient with ID ${id} not found` });
    }
  });

  // Event Routes
  app.get("/api/events", (req, res) => {
    const events = [...db.events].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 50);
    res.json(events);
  });

  // Chat Routes
  app.get("/api/messages", (req, res) => {
    const messages = [...db.messages].sort((a, b) => a.timestamp.localeCompare(b.timestamp));
    res.json(messages);
  });

  app.post("/api/messages", (req, res) => {
    const { senderId, senderName, text } = req.body;
    db.messages.push({
      id: db.nextMessageId++,
      senderId,
      senderName,
      text,
      timestamp: getTimestamp()
    });
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
