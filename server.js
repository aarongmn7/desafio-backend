import express from "express";
import { v4 as uuid } from "uuid";
import fs from "fs";

const app = express();
app.use(express.json());

const DB_PATH = "./db.json";

function loadDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

/* ---------------- PROPERTIES ---------------- */
app.get("/properties", (req, res) => {
  const db = loadDB();
  res.json(db.properties);
});

app.get("/properties/:id", (req, res) => {
  const db = loadDB();
  const item = db.properties.find(p => p.id === req.params.id);
  item ? res.json(item) : res.status(404).json({ error: "Not found" });
});

app.post("/properties", (req, res) => {
  const db = loadDB();
  const newItem = {
    id: uuid(),
    createdAt: new Date(),
    ...req.body
  };
  db.properties.push(newItem);
  saveDB(db);
  res.status(201).json(newItem);
});

app.put("/properties/:id", (req, res) => {
  const db = loadDB();
  const idx = db.properties.findIndex(p => p.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });
  db.properties[idx] = { ...db.properties[idx], ...req.body };
  saveDB(db);
  res.json(db.properties[idx]);
});

app.delete("/properties/:id", (req, res) => {
  const db = loadDB();
  db.properties = db.properties.filter(p => p.id !== req.params.id);
  saveDB(db);
  res.json({ message: "Deleted" });
});

/* ---------------- BROKERS ---------------- */
function crudHandler(entity) {
  app.get(`/${entity}`, (req, res) => {
    const db = loadDB();
    res.json(db[entity]);
  });

  app.get(`/${entity}/:id`, (req, res) => {
    const db = loadDB();
    const item = db[entity].find(x => x.id === req.params.id);
    item ? res.json(item) : res.status(404).json({ error: "Not found" });
  });

  app.post(`/${entity}`, (req, res) => {
    const db = loadDB();
    const newItem = { id: uuid(), ...req.body };
    db[entity].push(newItem);
    saveDB(db);
    res.status(201).json(newItem);
  });

  app.put(`/${entity}/:id`, (req, res) => {
    const db = loadDB();
    const idx = db[entity].findIndex(x => x.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: "Not found" });
    db[entity][idx] = { ...db[entity][idx], ...req.body };
    saveDB(db);
    res.json(db[entity][idx]);
  });

  app.delete(`/${entity}/:id`, (req, res) => {
    const db = loadDB();
    db[entity] = db[entity].filter(x => x.id !== req.params.id);
    saveDB(db);
    res.json({ message: "Deleted" });
  });
}

crudHandler("brokers");
crudHandler("clients");

/* ---------------- APPOINTMENTS ---------------- */
app.post("/appointments", (req, res) => {
  const db = loadDB();
  const { propertyId, clientId, brokerId } = req.body;

  const valid =
    db.properties.some(p => p.id === propertyId) &&
    db.clients.some(c => c.id === clientId) &&
    db.brokers.some(b => b.id === brokerId);

  if (!valid) return res.status(400).json({ error: "IDs inválidos" });

  const newItem = { id: uuid(), ...req.body };
  db.appointments.push(newItem);
  saveDB(db);
  res.status(201).json(newItem);
});

crudHandler("appointments");

/* ---------------- SERVER ---------------- */
app.listen(3000, () => console.log("API rodando na porta 3000"));
