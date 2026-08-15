import { Sparkles, Wrench, Paintbrush, Truck, Pipette, Zap, Home, Hammer, Scissors, Car, Fan, Lightbulb, ShieldCheck, Settings, HeartHandshake } from "lucide-react";

const map = { Sparkles, Wrench, Paintbrush, Truck, Pipette, Zap, Home, Hammer, Scissors, Car, Fan, Lightbulb, ShieldCheck, Settings, HeartHandshake };

export default function CategoryIcon({ name, size = 25 }) {
  const Icon = map[name] || Sparkles;
  return <Icon size={size}/>;
}
