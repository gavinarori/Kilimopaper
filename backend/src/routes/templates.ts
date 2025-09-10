import { Router } from "express";

const router = Router();

const templates = [
  {
    id: "t1",
    name: "Phytosanitary Certificate",
    product: "avocado",
    fields: ["exporter", "farmer_id", "lot_number", "harvest_date"],
    content: `<h1>Phytosanitary Certificate</h1><p><strong>Exporter:</strong> {{exporter}}</p><p><strong>Farmer ID:</strong> {{farmer_id}}</p><p><strong>Lot Number:</strong> {{lot_number}}</p><p><strong>Harvest Date:</strong> {{harvest_date}}</p>`,
  },
  {
    id: "t2",
    name: "Invoice",
    product: "generic",
    fields: ["buyer", "quantity", "unit_price", "currency"],
    content: `<h1>Invoice</h1><p><strong>Buyer:</strong> {{buyer}}</p><p><strong>Quantity:</strong> {{quantity}}</p><p><strong>Unit Price:</strong> {{unit_price}} {{currency}}</p>`
  },
  {
    id: "t3",
    name: "Bill of Lading",
    product: "generic",
    fields: ["vessel", "container_no", "port_of_loading", "port_of_discharge"],
    content: `<h1>Bill of Lading</h1><p><strong>Vessel:</strong> {{vessel}}</p><p><strong>Container No:</strong> {{container_no}}</p><p><strong>Port of Loading:</strong> {{port_of_loading}}</p><p><strong>Port of Discharge:</strong> {{port_of_discharge}}</p>`
  },
];

router.get("/", (_req, res) => {
  res.json(templates.map(({ content, ...t }) => t));
});

router.get("/:id", (req, res) => {
  const t = templates.find((x) => x.id === req.params.id);
  if (!t) return res.status(404).json({ error: "Not found" });
  res.json(t);
});

export default router;


