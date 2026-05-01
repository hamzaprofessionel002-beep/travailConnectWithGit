export interface CompanyService {
  name: string;
  description: string;
  problems: string[];
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  cover: string;
  category: string;
  city: string;
  rating: number;
  reviewsCount: number;
  yearsExperience: number;
  teamSize: number;
  available: boolean;
  responseTime: string;
  priceRange: string;
  verified: boolean;
  phone: string;
  description: string;
  services: CompanyService[];
  portfolio: string[];
}

const companyData: Omit<Company, "logo" | "cover" | "portfolio">[] = [
  {
    id: "c-1", name: "ProPeinture Tunisie", category: "Peinture", city: "Tunis",
    rating: 4.8, reviewsCount: 89, yearsExperience: 12, teamSize: 15, available: true,
    responseTime: "< 1h", priceRange: "50-150 DT/jour", verified: true,
    phone: "+216 71 234 567",
    description: "Leader de la peinture professionnelle en Tunisie. Travaux résidentiels et commerciaux.",
    services: [
      { name: "Peinture intérieure", description: "Finition parfaite pour tous vos espaces", problems: ["Murs abîmés", "Peinture écaillée", "Changement de couleur"] },
      { name: "Peinture extérieure", description: "Protection et embellissement de façades", problems: ["Façade dégradée", "Humidité sur murs extérieurs"] },
      { name: "Finitions décoratives", description: "Stucco, tadelakt, effets spéciaux", problems: ["Décoration murale", "Rénovation salon"] },
      { name: "Réparation avant peinture", description: "Traitement fissures et enduit", problems: ["Fissures murales", "Mur endommagé avant peinture"] },
    ],
  },
  {
    id: "c-2", name: "PlomberieExpress Sfax", category: "Plomberie", city: "Sfax",
    rating: 4.6, reviewsCount: 67, yearsExperience: 8, teamSize: 10, available: true,
    responseTime: "< 30min", priceRange: "40-120 DT", verified: true,
    phone: "+216 74 567 890",
    description: "Service de plomberie rapide et fiable. Urgences 24h/24.",
    services: [
      { name: "Réparation de fuites", description: "Intervention rapide sur toute fuite", problems: ["Fuite d'eau cuisine", "Fuite robinet", "Tuyau percé"] },
      { name: "Installation tuyauterie", description: "Pose et raccordement de tuyaux", problems: ["Nouvelle installation", "Remplacement tuyaux vétustes"] },
      { name: "Rénovation salle de bain", description: "Rénovation complète sanitaire", problems: ["Salle de bain vieillissante", "Douche qui fuit"] },
      { name: "Chauffe-eau", description: "Installation et réparation", problems: ["Pas d'eau chaude", "Chauffe-eau en panne"] },
    ],
  },
  {
    id: "c-3", name: "ElectroPro Sousse", category: "Électricité", city: "Sousse",
    rating: 4.7, reviewsCount: 54, yearsExperience: 15, teamSize: 12, available: true,
    responseTime: "< 1h", priceRange: "60-200 DT", verified: true,
    phone: "+216 73 456 789",
    description: "Experts en installations électriques résidentielles et industrielles.",
    services: [
      { name: "Installation câblage", description: "Câblage neuf et rénovation", problems: ["Maison neuve", "Rénovation électrique complète"] },
      { name: "Dépannage électrique", description: "Diagnostic et réparation rapide", problems: ["Coupures fréquentes", "Court-circuit", "Prise qui ne marche pas"] },
      { name: "Éclairage", description: "Installation et design lumineux", problems: ["Éclairage insuffisant", "Installation spots"] },
      { name: "Tableau électrique", description: "Mise aux normes et remplacement", problems: ["Disjoncteur qui saute", "Tableau vétuste"] },
    ],
  },
  {
    id: "c-4", name: "FroidClim Tunisie", category: "Climatisation", city: "Tunis",
    rating: 4.5, reviewsCount: 43, yearsExperience: 10, teamSize: 8, available: true,
    responseTime: "< 2h", priceRange: "80-300 DT", verified: true,
    phone: "+216 71 345 678",
    description: "Spécialistes en climatisation et chauffage. Installation et maintenance.",
    services: [
      { name: "Installation climatiseur", description: "Pose split et gainable", problems: ["Chaleur insupportable", "Besoin climatisation chambre"] },
      { name: "Maintenance annuelle", description: "Entretien préventif", problems: ["Clim qui refroidit mal", "Mauvaises odeurs clim"] },
      { name: "Recharge gaz", description: "Recharge et vérification circuit", problems: ["Clim ne refroidit plus", "Bruit anormal"] },
      { name: "Ventilation", description: "Systèmes VMC et extraction", problems: ["Humidité intérieure", "Mauvaise aération"] },
    ],
  },
  {
    id: "c-5", name: "BâtiPlus Construction", category: "Construction", city: "Bizerte",
    rating: 4.9, reviewsCount: 112, yearsExperience: 20, teamSize: 25, available: true,
    responseTime: "< 4h", priceRange: "Devis sur mesure", verified: true,
    phone: "+216 72 678 901",
    description: "Construction et rénovation haut de gamme depuis 2004.",
    services: [
      { name: "Construction neuve", description: "Maisons et immeubles", problems: ["Projet construction maison", "Extension maison"] },
      { name: "Rénovation complète", description: "Réhabilitation et modernisation", problems: ["Maison ancienne à rénover", "Appartement vétuste"] },
      { name: "Maçonnerie", description: "Murs, cloisons, fondations", problems: ["Mur fissuré", "Cloison à abattre"] },
      { name: "Étanchéité", description: "Toiture et terrasse", problems: ["Infiltration eau toiture", "Terrasse qui fuit"] },
    ],
  },
  {
    id: "c-6", name: "PeintureArt Nabeul", category: "Peinture", city: "Nabeul",
    rating: 4.4, reviewsCount: 38, yearsExperience: 6, teamSize: 7, available: true,
    responseTime: "< 2h", priceRange: "40-100 DT/jour", verified: false,
    phone: "+216 72 234 567",
    description: "Peinture artistique et décorative. Spécialistes en finitions de luxe.",
    services: [
      { name: "Peinture décorative", description: "Effets uniques et personnalisés", problems: ["Décoration salon moderne", "Chambre enfant originale"] },
      { name: "Peinture industrielle", description: "Locaux et entrepôts", problems: ["Local commercial à peindre", "Entrepôt à rénover"] },
      { name: "Traitement humidité", description: "Peinture anti-humidité", problems: ["Taches d'humidité", "Moisissures sur murs"] },
    ],
  },
  {
    id: "c-7", name: "AquaService Gabès", category: "Plomberie", city: "Gabès",
    rating: 4.3, reviewsCount: 29, yearsExperience: 5, teamSize: 6, available: false,
    responseTime: "< 1h", priceRange: "35-90 DT", verified: false,
    phone: "+216 75 123 456",
    description: "Plomberie générale et urgences. Intervention rapide.",
    services: [
      { name: "Urgence plomberie", description: "Disponible 7j/7", problems: ["Inondation maison", "WC bouché urgent"] },
      { name: "Installation douche", description: "Cabines et colonnes", problems: ["Changer la douche", "Installer nouvelle douche"] },
      { name: "Détection de fuites", description: "Technologie sans casse", problems: ["Facture eau élevée", "Fuite invisible"] },
    ],
  },
  {
    id: "c-8", name: "VoltTech Ariana", category: "Électricité", city: "Ariana",
    rating: 4.6, reviewsCount: 51, yearsExperience: 9, teamSize: 11, available: true,
    responseTime: "< 45min", priceRange: "50-180 DT", verified: false,
    phone: "+216 71 890 123",
    description: "Solutions électriques modernes. Domotique et installation.",
    services: [
      { name: "Domotique", description: "Maison intelligente", problems: ["Automatiser la maison", "Éclairage connecté"] },
      { name: "Panneaux solaires", description: "Installation photovoltaïque", problems: ["Réduire facture STEG", "Énergie solaire maison"] },
      { name: "Mise aux normes", description: "Conformité installation", problems: ["Installation non conforme", "Vieille installation électrique"] },
    ],
  },
  {
    id: "c-9", name: "ClimaConfort Monastir", category: "Climatisation", city: "Monastir",
    rating: 4.2, reviewsCount: 22, yearsExperience: 4, teamSize: 5, available: true,
    responseTime: "< 3h", priceRange: "70-250 DT", verified: false,
    phone: "+216 73 567 890",
    description: "Installation et entretien climatisation pour particuliers.",
    services: [
      { name: "Climatisation résidentielle", description: "Split mural toutes marques", problems: ["Installer clim salon", "Clim pour chambre bébé"] },
      { name: "Chauffage central", description: "Installation et réparation", problems: ["Chauffage ne marche plus", "Installer chauffage central"] },
    ],
  },
  {
    id: "c-10", name: "MegaBat Kairouan", category: "Construction", city: "Kairouan",
    rating: 4.7, reviewsCount: 78, yearsExperience: 18, teamSize: 20, available: true,
    responseTime: "< 4h", priceRange: "Devis gratuit", verified: true,
    phone: "+216 77 234 567",
    description: "Grand constructeur de la région. Projets clé en main.",
    services: [
      { name: "Villa clé en main", description: "De la fondation aux finitions", problems: ["Construire une villa", "Projet immobilier"] },
      { name: "Gros œuvre", description: "Structure et fondations", problems: ["Fondation maison", "Dalle béton"] },
      { name: "Aménagement extérieur", description: "Jardins, piscines, terrasses", problems: ["Aménager le jardin", "Construire une piscine"] },
    ],
  },
  {
    id: "c-11", name: "ElectraStar Hammamet", category: "Électricité", city: "Hammamet",
    rating: 4.5, reviewsCount: 33, yearsExperience: 7, teamSize: 9, available: true,
    responseTime: "< 1h", priceRange: "55-160 DT", verified: false,
    phone: "+216 72 345 678",
    description: "Électricité résidentielle et hôtelière. Zone touristique couverte.",
    services: [
      { name: "Installation hôtelière", description: "Solutions pour hôtels et résidences", problems: ["Électricité hôtel", "Installation villa touristique"] },
      { name: "Éclairage extérieur", description: "Jardins et façades", problems: ["Éclairer le jardin", "Lumière façade maison"] },
    ],
  },
  {
    id: "c-12", name: "PeintureModerne Gafsa", category: "Peinture", city: "Gafsa",
    rating: 4.1, reviewsCount: 18, yearsExperience: 3, teamSize: 5, available: true,
    responseTime: "< 3h", priceRange: "30-80 DT/jour", verified: false,
    phone: "+216 76 123 456",
    description: "Peinture moderne et économique. Devis gratuit.",
    services: [
      { name: "Peinture économique", description: "Bon rapport qualité-prix", problems: ["Budget limité peinture", "Peinture appartement location"] },
      { name: "Peinture époxy", description: "Sols et garages", problems: ["Sol garage abîmé", "Sol industriel"] },
    ],
  },
  {
    id: "c-13", name: "PlombiTech Ben Arous", category: "Plomberie", city: "Ben Arous",
    rating: 4.4, reviewsCount: 41, yearsExperience: 11, teamSize: 8, available: true,
    responseTime: "< 45min", priceRange: "45-130 DT", verified: true,
    phone: "+216 71 456 789",
    description: "Plomberie technique et rénovation. Équipe certifiée.",
    services: [
      { name: "Rénovation plomberie", description: "Remplacement complet", problems: ["Plomberie vétuste", "Changer toute la tuyauterie"] },
      { name: "Assainissement", description: "Curage et vidange", problems: ["Fosse septique pleine", "Égout bouché"] },
      { name: "Robinetterie", description: "Installation et réparation", problems: ["Robinet qui fuit", "Changer mitigeur"] },
    ],
  },
  {
    id: "c-14", name: "FreshAir Médenine", category: "Climatisation", city: "Médenine",
    rating: 4.3, reviewsCount: 25, yearsExperience: 6, teamSize: 6, available: false,
    responseTime: "< 2h", priceRange: "75-220 DT", verified: false,
    phone: "+216 75 678 901",
    description: "Climatisation pour le sud tunisien. Adaptée au climat saharien.",
    services: [
      { name: "Clim haute performance", description: "Pour zones très chaudes", problems: ["Chaleur extrême", "Clim pas assez puissante"] },
      { name: "Déshumidification", description: "Contrôle humidité", problems: ["Humidité élevée", "Condensation fenêtres"] },
    ],
  },
  {
    id: "c-15", name: "BâtirEnsemble Tozeur", category: "Construction", city: "Tozeur",
    rating: 4.6, reviewsCount: 36, yearsExperience: 14, teamSize: 18, available: true,
    responseTime: "< 4h", priceRange: "Devis personnalisé", verified: true,
    phone: "+216 76 567 890",
    description: "Construction traditionnelle et moderne. Spécialistes architecture locale.",
    services: [
      { name: "Architecture traditionnelle", description: "Style local authentique", problems: ["Construire maison traditionnelle", "Rénover maison ancienne"] },
      { name: "Isolation thermique", description: "Confort toute l'année", problems: ["Maison trop chaude été", "Maison trop froide hiver"] },
    ],
  },
];

export const companies: Company[] = companyData.map((c, i) => ({
  ...c,
  logo: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(c.name)}&backgroundColor=f97316`,
  cover: `https://picsum.photos/seed/company${i}/800/300`,
  portfolio: Array.from({ length: 4 }, (_, j) => `https://picsum.photos/seed/c${i}p${j}/400/300`),
}));
