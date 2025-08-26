import { Router } from "express";

const router = Router();

const templates = [
  { id: "t1", name: "Phytosanitary Certificate", product: "avocado", fields: ["exporter", "farmer_id", "lot_number", "harvest_date"] },
  { id: "t2", name: "Invoice", product: "generic", fields: ["buyer", "quantity", "unit_price", "currency"] },
  { id: "t3", name: "Bill of Lading", product: "generic", fields: ["vessel", "container_no", "port_of_loading", "port_of_discharge"] },
];

router.get("/", (_req, res) => {
  res.json(templates);
});

export default router;


