/* Stack Tower — Configuration */

var Config = {
  // Canvas
  canvasW: 320,
  canvasH: 480,

  // Block dimensions
  startWidth: 200,
  blockHeight: 22,
  blockDepthTop: 10,     // isometric top face height
  blockDepthSide: 10,    // isometric side face width

  // Base platform
  baseY: 400,            // Y position of the base block (screen coords)

  // Movement
  startSpeed: 120,       // px/s initial sliding speed
  speedIncrement: 4,     // px/s added per block stacked
  maxSpeed: 400,         // px/s cap

  // Perfect placement
  perfectTolerance: 5,   // px — snap to perfect if within this
  perfectBonus: 4,       // px — block grows wider on perfect placement

  // Falling overhang
  overhangGravity: 600,  // px/s² downward
  overhangFadeTime: 1.2, // seconds before overhang piece disappears

  // Camera
  cameraSmooth: 6,       // lerp speed for camera scroll
  cameraBlockThreshold: 3, // start scrolling after this many blocks

  // Colors — HSL-based gradient that shifts with tower height
  baseHue: 0,            // starting hue
  hueStep: 12,           // hue shift per block
  saturation: 70,        // %
  lightness: 55,         // % for front face
  topLightnessBoost: 15, // % added for top face
  sideLightnessDrop: 12, // % subtracted for side face

  // Background
  bgColor: '#0a0a16',
  bgGradientTop: '#0a0a16',
  bgGradientBottom: '#12121f',

  // UI
  textColor: '#e0e0e0',
  hudColor: '#ffd700',
  perfectColor: '#ffd700',
  accentColor: '#ff8844',

  // Background stars
  bgStarCount: 40,
};

// Derived
Config.startX = (Config.canvasW - Config.startWidth) / 2;
