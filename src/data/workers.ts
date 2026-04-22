export interface Worker {
  id: string;
  name: string;
  profession: string;
  category: string;
  city: string;
  rating: number;
  reviewsCount: number;
  experience: number;
  hourlyRate: number;
  available: boolean;
  verified: boolean;
  phone: string;
  avatar: string;
  skills: string[];
  portfolio: string[];
  bio: string;
}

const firstNames = [
  "Mohamed", "Ahmed", "Ali", "Youssef", "Mehdi", "Karim", "Nabil", "Hichem",
  "Slim", "Riadh", "Sami", "Fathi", "Bilel", "Mourad", "Sofiane", "Khaled",
  "Amine", "Tarek", "Hamdi", "Lotfi", "Wassim", "Zied", "Oussama", "Hatem",
  "Chaker", "Mondher", "Fethi", "Ridha", "Mounir", "Jamel", "Abdelkader",
  "Samir", "Walid", "Maher", "Habib", "Hassen", "Nizar", "Faouzi", "Lassaad",
  "Taoufik", "Naceur", "Mongi", "Aziz", "Adel", "Brahim", "Chokri", "Raouf",
  "Bassem", "Aymen", "Rami"
];
const lastNames = [
  "Trabelsi", "Ben Ali", "Bouazizi", "Gharbi", "Jaziri", "Hamdi", "Chaari",
  "Mejri", "Khelifi", "Sassi", "Dridi", "Ammar", "Guesmi", "Zouari",
  "Bouzid", "Ferchichi", "Haddad", "Jebali", "Laabidi", "Maaloul",
  "Nasr", "Oueslati", "Rezgui", "Souissi", "Tlili", "Yahyaoui"
];
const cities = [
  "Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte", "Gabès", "Ariana",
  "Gafsa", "Monastir", "Ben Arous", "Nabeul", "Médenine", "La Marsa",
  "Hammamet", "Tozeur"
];

const categories = [
  { name: "Peinture", professions: ["Peintre", "Peintre décorateur", "Peintre en bâtiment"], emoji: "🎨" },
  { name: "Plomberie", professions: ["Plombier", "Plombier sanitaire", "Installateur sanitaire"], emoji: "🚰" },
  { name: "Électricité", professions: ["Électricien", "Électricien bâtiment", "Technicien électrique"], emoji: "⚡" },
  { name: "Climatisation", professions: ["Climaticien", "Technicien HVAC", "Installateur climatisation"], emoji: "❄️" },
  { name: "Construction", professions: ["Maçon", "Chef de chantier", "Ouvrier BTP"], emoji: "🏗️" },
  { name: "Menuiserie", professions: ["Menuisier", "Ébéniste", "Menuisier aluminium"], emoji: "🪚" },
  { name: "Carrelage", professions: ["Carreleur", "Poseur de carrelage", "Mosaïste"], emoji: "🧱" },
  { name: "Jardinage", professions: ["Jardinier", "Paysagiste", "Technicien espaces verts"], emoji: "🌿" },
];

const skillsByCategory: Record<string, string[]> = {
  "Peinture": ["Peinture intérieure", "Peinture extérieure", "Enduit décoratif", "Laque", "Peinture époxy"],
  "Plomberie": ["Réparation fuites", "Installation sanitaire", "Débouchage", "Chauffe-eau", "Tuyauterie"],
  "Électricité": ["Câblage", "Tableau électrique", "Éclairage", "Domotique", "Dépannage"],
  "Climatisation": ["Installation split", "Maintenance", "Recharge gaz", "Gainable", "Ventilation"],
  "Construction": ["Maçonnerie", "Coffrage", "Fondations", "Rénovation", "Extension"],
  "Menuiserie": ["Portes", "Fenêtres", "Placards", "Cuisine", "Parquet"],
  "Carrelage": ["Pose carrelage", "Faïence", "Mosaïque", "Pierre naturelle", "Jointage"],
  "Jardinage": ["Taille", "Plantation", "Arrosage automatique", "Gazon", "Élagage"],
};

// Deterministic PRNG (mulberry32) — same output server-side and client-side
// Avoids hydration mismatch caused by Math.random() at module load.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function generateWorker(i: number): Worker {
  const rand = mulberry32(i * 9973 + 31);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];
  const range = (min: number, max: number) => Math.floor(rand() * (max - min + 1)) + min;
  const float = (min: number, max: number, dec = 1) => parseFloat((rand() * (max - min) + min).toFixed(dec));

  const cat = categories[i % categories.length];
  const skills = skillsByCategory[cat.name] || [];
  const verified = i < 10;
  // Deterministic Fisher-Yates shuffle (sort with random comparator is non-deterministic across engines)
  const shuffled = [...skills];
  for (let k = shuffled.length - 1; k > 0; k--) {
    const j = Math.floor(rand() * (k + 1));
    [shuffled[k], shuffled[j]] = [shuffled[j], shuffled[k]];
  }
  return {
    id: `w-${i + 1}`,
    name: `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`,
    profession: pick(cat.professions),
    category: cat.name,
    city: cities[i % cities.length],
    rating: float(3.5, 5),
    reviewsCount: range(5, 120),
    experience: range(1, 25),
    hourlyRate: range(20, 80),
    available: rand() > 0.25,
    verified,
    phone: `+216 ${range(20, 99)} ${range(100, 999)} ${range(100, 999)}`,
    avatar: `https://api.dicebear.com/9.x/personas/svg?seed=worker${i}`,
    skills: shuffled.slice(0, range(2, 4)),
    portfolio: Array.from({ length: range(2, 5) }, (_, j) =>
      `https://picsum.photos/seed/w${i}p${j}/400/300`
    ),
    bio: `Professionnel en ${cat.name.toLowerCase()} avec ${range(2, 20)} ans d'expérience. Travail soigné et garanti. Disponible sur ${pick(cities)} et environs.`,
  };
}

export const workers: Worker[] = Array.from({ length: 50 }, (_, i) => generateWorker(i));

export const categoryList = categories;
