import { 
  Scissors, 
  Sparkles, 
  Hand, 
  Footprints,
  Droplet,
  Bath,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Thermometer,
  CloudLightning,
  Wind,
  ShoppingCart,
  Trash2,
  ChefHat,
  Home,
  Briefcase,
  GraduationCap,
  Users,
  Car,
  Dumbbell,
  Film,
  Trees,
  Palmtree,
  Clock,
  ListChecks,
  Target,
  Coffee,
  Heart as LucideHeart,
  Ear,
  DollarSign,
} from 'lucide-react-native';

export type ActivityIconName = keyof typeof activityIconMap;

export const activityIconMap = {
  // Beauty
  haircut: Scissors,
  wellness: Sparkles,
  massage: Hand,
  manicure: Hand,
  pedicure: Footprints,
  skincare: Droplet,
  spa: Bath,
  
  // Weather
  sunny: Sun,
  clouds: Cloud,
  rain: CloudRain,
  snow: Snowflake,
  heat: Thermometer,
  storm: CloudLightning,
  wind: Wind,
  
  // Chores
  shopping: ShoppingCart,
  cleaning: Trash2,
  cooking: ChefHat,
  laundry: Droplet, // Using Droplet as placeholder for laundry
  
  // Places
  home: Home,
  work: Briefcase,
  school: GraduationCap,
  visit: Users,
  travel: Car,
  gym: Dumbbell,
  cinema: Film,
  nature: Trees,
  vacation: Palmtree,
  
  // Productivity
  'start-early': Clock,
  'make-list': ListChecks,
  focus: Target,
  'take-break': Coffee,
  
  // Better Me
  meditation: Sparkles,
  kindness: LucideHeart,
  listen: Ear,
  donate: DollarSign,
};

export const getActivityIcon = (activityId: string) => {
  return activityIconMap[activityId as ActivityIconName] || Sparkles;
};
