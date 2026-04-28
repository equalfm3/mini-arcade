/* Cookie Clicker — Configuration */

var Config = {

  // Cookie click
  baseClickValue: 1,

  // Cost scaling: each purchase multiplies cost by this factor
  costScale: 1.15,

  // Auto-save interval (seconds)
  autoSaveInterval: 30,

  // Floating text
  floatDuration: 1.0,
  floatRise: 60,

  // Milestone multiplier (toast every N× cookies)
  milestoneBase: 10,

  // Upgrades: auto-clicker tiers
  upgrades: [
    { name: 'Cursor',       baseCost: 15,          cps: 0.1,    icon: '👆' },
    { name: 'Grandma',      baseCost: 100,         cps: 1,      icon: '👵' },
    { name: 'Farm',         baseCost: 1100,        cps: 8,      icon: '🌾' },
    { name: 'Mine',         baseCost: 12000,       cps: 47,     icon: '⛏️' },
    { name: 'Factory',      baseCost: 130000,      cps: 260,    icon: '🏭' },
    { name: 'Bank',         baseCost: 1400000,     cps: 1400,   icon: '🏦' },
    { name: 'Temple',       baseCost: 20000000,    cps: 7800,   icon: '🛕' },
    { name: 'Wizard Tower', baseCost: 330000000,   cps: 44000,  icon: '🧙' },
  ],

  // Click multiplier upgrades
  clickUpgrades: [
    { name: 'Double Click', cost: 100,       multiplier: 2,  icon: '✌️' },
    { name: 'Triple Click', cost: 10000,     multiplier: 3,  icon: '🤟' },
    { name: 'Mega Click',   cost: 1000000,   multiplier: 10, icon: '💥' },
  ],

  // Colors
  accent: '#f4a460',
  cookieColor: '#c87533',
  cookieHighlight: '#e8a050',
  shopBg: '#1a1a2e',
  shopItemBg: '#12121f',
  shopItemAffordable: '#2a2a40',
  shopItemDimmed: '#0e0e18',
  textPrimary: '#f0e0c0',
  textSecondary: '#888',
  counterColor: '#ffd700',

  // localStorage key
  saveKey: 'mini-arcade-cookie-clicker-save',
};
