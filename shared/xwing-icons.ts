import { Bearing } from "./enums";

export const SHIP_ICONS: Record<string, string> = {
  // Aggressor Assault Fighter
  Aggressor: "i",
  // Alpha-class Star Wing
  Alpha: "&",
  // ARC-170 Starfighter
  Arc: "c",
  // B-wing
  BWing: "b",
  "B-wing": "b",
  // Attack Shuttle
  AttackShuttle: "g",
  // Auzituck Gunship
  Auzituck: "@",
  // Belbullab-22 Starfighter
  Belbullab: "[",
  // Y-wing
  YWing: "y",
  // BTL-S8 K-wing
  KWing: "k",
  "K-wing": "k",
  BTLS8: "k",
  // CR90 Corvette
  CR90: "2",
  "CR90Corvette(Fore)": "2",
  "CR90Corvette(Aft)": "2",
  // C-ROC Cruiser
  Croc: "5",
  // Customized YT-1300
  CustomizedYT1300: "W",
  // Droid Tri-fighter
  DroidTrifighter: "+",
  // Delta-7 Aethersprite
  Delta7: "\\",
  // Escape Craft
  EscapeCraft: "X",
  // Eta-2 Actis
  Eta2: "-",
  // E-wing
  EWing: "e",
  "E-wing": "e",
  // Fang Fighter / Protectorate Starfighter
  Protectorate: "M",
  // Fireball
  Fireball: "0",
  // Firespray-class Patrol Craft
  Firespray: "f",
  Firespray31: "f",
  // G-1A Starfighter
  G1A: "n",
  // Gozanti-class Cruiser
  Gozanti: "4",
  // GR-75 Medium Transport
  GR75: "1",
  "GR-75MediumTransport": "1",
  // HMP Droid Gunship
  HMP: ".",
  // HWK-290 Light Freighter
  Hawk: "h",
  "HWK-290": "h",
  HWK290: "h",
  // Hyena-class Droid Bomber
  Hyena: "=",
  // JumpMaster 5000
  Jumpmaster: "p",
  // Kihraxz Fighter
  Kihraxz: "r",
  KihraxzFighter: "r",
  // LAAT/i Gunship
  LAAT: "/",
  // Lambda-class T-4a Shuttle
  Shuttle: "l",
  "Lambda-classShuttle": "l",
  Lambda: "l",
  // Lancer-class Pursuit Craft
  ShadowCaster: "L",
  // M12-L Kimogila Fighter
  Kimogila: "K",
  // M3-A Interceptor
  Interceptor: "s",
  "M3-AInterceptor": "s",
  // MG-100 StarFortress
  ResistanceBomber: "Z",
  // Modified TIE/ln Fighter
  ModifiedTIE: "C",
  // Modified YT-1300
  Falcon: "m",
  "YT-1300": "m",
  MillenniumFalcon: "m",
  // Naboo Royal N-1 Starfighter
  Naboo: "<",
  // Nantex-class Starfighter
  Nantex: ";",
  // Nimbus-class V-wing
  Nimbus: ",",
  // Quadrijet Transfer Spacetug
  Quadjumper: "q",
  // Raider-class Corvette
  Raider: "3",
  "Raider-classCorvette(Fore)": "3",
  "Raider-classCorvette(Aft)": "3",
  // Resistance Transport
  ResistanceTransport: ">",
  // Resistance Transport Pod
  ResistanceTransportPod: "?",
  // RZ-1 A-wing
  AWing: "a",
  // RZ-2 A-wing
  RZ2AWing: "E",
  // Scavenged YT-1300
  ScavengedYT1300: "Y",
  // Scurrg H-6 Bomber
  Scurrg: "H",
  // Sheathipede-class Shuttle
  Sheathipede: "%",
  // Sith Infiltrator
  SithInfiltrator: "]",
  // StarViper-class Attack Platform
  Starviper: "v",
  StarViper: "v",
  // Syliure-class Hyperspace Ring
  Syliure: "*",
  // T-65 X-wing
  XWing: "x",
  // T-70 X-wing
  T70: "w",
  // TIE Advanced Prototype
  TieAdvancedProtoype: "R",
  // TIE Advanced x1
  TIEAdvanced: "A",
  TieAdvanced: "A",
  // TIE/ag Aggressor
  TieAggressor: "`",
  // TIE/ba Interceptor
  TieBainterceptor: "j",
  // TIE/ca Punisher
  TiePunisher: "N",
  TIEPunisher: "N",
  // TIE/D Defender
  TieDefender: "D",
  TIEDefender: "D",
  // TIE/fo Fighter
  TieFO: "O",
  // TIE Interceptor
  TIEInterceptor: "I",
  TieInterceptor: "I",
  // TIE/ln Fighter
  TIEFighter: "F",
  TieFighter: "F",
  // TIE Phantom
  TiePhantom: "P",
  TIEPhantom: "P",
  Phantom2: "P",
  // TIE/rb Heavy
  TieRBHeavy: "J",
  // TIE Reaper
  TieReaper: "V",
  // TIE Bomber
  TIEBomber: "B",
  TieBomber: "B",
  // TIE/sf Fighter
  TieSF: "S",
  // TIE/sk Striker
  TieStriker: "T",
  // TIE/vn Silencer
  TieSilencer: "$",
  // Upsilon-class Command Shuttle
  UpsilonShuttle: "U",
  // UT-60D U-wing
  UWing: "u",
  // VCX-100 Light Freighter
  Ghost: "G",
  // VT-49 Decimator
  Decimator: "d",
  "VT-49Decimator": "d",
  VT49Decimator: "d",
  // YT-2400 Light Freighter
  Y2400: "o",
  "YT-2400": "o",
  YT2400: "o",
  // YV-666 Light Freighter
  YV666: "t",
  "YV-666": "t",
  // Z-95 Headhunter
  Z95: "z",
  Z95Headhunter: "z",
  "Z-95Headhunter": "z",
  // Mist Hunter
  Misthunter: "H",
} as const;

export const STAT_ICONS = {
  attack: "%",
  agility: "^",
  hull: "&",
  shield: "*",
} as const;

export const ACTION_ICONS: Record<string, string> = {
  Focus: "f",
  Evade: "e",
  TargetLock: "l",
  BarrelRoll: "r",
  Boost: "b",
  Reinforce: "i",
  Coordinate: "o",
  Jam: "j",
  Calculate: "a",
  Cloak: "k",
  SLAM: "s",
  Reload: "=",
  Rotate: "R",
} as const;

export const FACTION_ICONS = {
  rebel: "!",
  empire: "@",
  scum: "#",
} as const;

export const TOKEN_ICONS = {
  focus: "Ä",
  evade: "Å",
  stress: "É",
  ion: "ä",
  targetLock: "ã",
  shield: "Ñ",
  crit: "Ç",
  cloak: "å",
  jam: "á",
  reinforce: "Ü",
  tractor: "à",
  weaponsDisabled: "Ö",
  condition: "°",
} as const;

export const UPGRADE_SLOT_ICONS: Record<string, string> = {
  Elite: "E",
  Talent: "E",
  Astromech: "A",
  Torpedo: "P",
  Missile: "M",
  Cannon: "C",
  Turret: "U",
  Bomb: "B",
  Device: "B",
  Crew: "W",
  Modification: "m",
  Tech: "X",
  Illicit: "I",
  Title: "t",
  System: "S",
  Sensor: "S",
  Configuration: "n",
  ForceAbility: "F",
  ForcePower: "F",
  Gunner: "Y",
  Command: "V",
} as const;

export const BEARING_ICONS: Record<string, string> = {
  "straight": "8",
  "bank-left": "7",
  "bank-right": "9",
  "turn-left": "4",
  "turn-right": "6",
  "k-turn": "K",
  "sloop-left": "1",
  "sloop-right": "3",
  "s-loop-left": "1", // Alternative format with hyphen
  "s-loop-right": "3", // Alternative format with hyphen
  "talon-roll-left": ":",
  "talon-roll-right": ";",
  "stationary": "5",
  "reverse": "S",
} as const;

export function getShipIcon(shipType: string): string {
  return SHIP_ICONS[shipType] || "?";
}

export function getActionIcon(action: string): string {
  return ACTION_ICONS[action] || "?";
}

export function getUpgradeSlotIcon(slot: string): string {
  return UPGRADE_SLOT_ICONS[slot] || "?";
}

export function getTokenIcon(tokenType: string): string {
  const tokenMapping: Record<string, keyof typeof TOKEN_ICONS> = {
    focus: "focus",
    evade: "evade",
    stress: "stress",
    ion: "ion",
    "target-lock": "targetLock",
    shield: "shield",
    cloak: "cloak",
    jam: "jam",
    reinforce: "reinforce",
    tractor: "tractor",
    "weapons-disabled": "weaponsDisabled",
    condition: "condition",
  };

  const iconKey = tokenMapping[tokenType];
  return iconKey ? TOKEN_ICONS[iconKey] : "?";
}

export const TOKEN_COLORS: Record<string, string> = {
  focus: "text-green-500",
  evade: "text-green-500",
  stress: "text-red-500",
  ion: "text-red-500",
  "target-lock": "text-yellow-500",
  shield: "text-blue-500",
  cloak: "text-blue-500",
  jam: "text-green-500",
  reinforce: "text-green-500",
  tractor: "text-red-500",
  "weapons-disabled": "text-red-500",
  condition: "text-orange-500",
} as const;

export function getTokenColor(tokenType: string): string {
  return TOKEN_COLORS[tokenType] || "text-gray-300";
}

export function getBearingIcon(bearing: string | Bearing): string {
  // Convert to string explicitly to handle enum values
  let bearingStr = String(bearing);
  
  // Remove any extra spaces or duplicates (in case of stringification issues)
  const parts = bearingStr.split(' ');
  bearingStr = (parts[0] || bearingStr).trim();
  
  // Try direct lookup first
  const directMatch = BEARING_ICONS[bearingStr];
  if (directMatch) {
    return directMatch;
  }
  
  // Try case-insensitive lookup
  const lowerBearing = bearingStr.toLowerCase();
  for (const [key, value] of Object.entries(BEARING_ICONS)) {
    if (key.toLowerCase() === lowerBearing) {
      return value || "?";
    }
  }
  
  // Fallback - return "?" which shows as missile icon in font
  console.warn(`Unknown bearing: ${bearingStr}`, bearing);
  return "?";
}
