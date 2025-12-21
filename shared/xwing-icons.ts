export const SHIP_ICONS: Record<string, string> = {
  Firespray31: "f",
  TIEAdvanced: "A",
  TIEFighter: "F",
  XWing: "x",
  YWing: "y",
  AWing: "a",
  BWing: "b",
  Z95Headhunter: "z",
  TIEInterceptor: "I",
  TIEBomber: "B",
  TIEDefender: "D",
  TIEPhantom: "P",
  MillenniumFalcon: "m",
  YT2400: "o",
  HWK290: "h",
  Lambda: "l",
  VT49Decimator: "d",
  EWing: "e",
  KWing: "k",
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
  calculate: "Ê",
  charge: "Ò",
  force: "Ô",
  disarm: "Ö",
  tractor: "à",
  strain: "ö",
  deplete: "ø",
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

export function getShipIcon(shipType: string): string {
  return SHIP_ICONS[shipType] || "?";
}

export function getActionIcon(action: string): string {
  return ACTION_ICONS[action] || "?";
}

export function getUpgradeSlotIcon(slot: string): string {
  return UPGRADE_SLOT_ICONS[slot] || "?";
}
