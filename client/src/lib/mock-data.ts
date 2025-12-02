export interface Ride {
  id: string;
  driverName: string;
  origin: string;
  destination: string;
  date: string;
  time: string;
  seats: number;
  contact: string;
  notes?: string;
}

export const INITIAL_RIDES: Ride[] = [
  {
    id: "1",
    driverName: "María García",
    origin: "Villadiego",
    destination: "Burgos",
    date: new Date().toISOString().split('T')[0], // Today
    time: "08:30",
    seats: 3,
    contact: "612 345 678",
    notes: "Voy al hospital, paso por Sasamón."
  },
  {
    id: "2",
    driverName: "Paco Ruiz",
    origin: "Sasamón",
    destination: "Burgos",
    date: new Date().toISOString().split('T')[0], // Today
    time: "09:00",
    seats: 2,
    contact: "666 777 888",
    notes: "Salgo de la plaza mayor."
  },
  {
    id: "3",
    driverName: "Lucía M.",
    origin: "Melgar de Fernamental",
    destination: "Osorno",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: "10:15",
    seats: 4,
    contact: "655 444 333",
    notes: "Coche grande, cabe silla de ruedas plegada."
  },
  {
    id: "4",
    driverName: "Antonio",
    origin: "Burgos",
    destination: "Villadiego",
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
    time: "17:00",
    seats: 3,
    contact: "699 888 777",
    notes: "Vuelvo de trabajar."
  },
  {
    id: "5",
    driverName: "Elena",
    origin: "Castrojeriz",
    destination: "Frómista",
    date: new Date(Date.now() + 172800000).toISOString().split('T')[0], // Day after tomorrow
    time: "11:00",
    seats: 2,
    contact: "611 222 333",
    notes: "Voy al mercado."
  },
  {
    id: "6",
    driverName: "Roberto",
    origin: "Sedano",
    destination: "Burgos",
    date: new Date().toISOString().split('T')[0], // Today
    time: "07:45",
    seats: 1,
    contact: "600 000 000",
    notes: "Solo llevo una maleta pequeña."
  }
];
