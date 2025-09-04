// Mock HTMLCanvasElement and CanvasRenderingContext2D for testing
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  fillRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  fill: jest.fn(),
  stroke: jest.fn(),
  save: jest.fn(),
  restore: jest.fn(),
  translate: jest.fn(),
  rotate: jest.fn(),
  scale: jest.fn(),
  createRadialGradient: jest.fn(() => ({
    addColorStop: jest.fn()
  })),
  fillStyle: '',
  strokeStyle: '',
  lineWidth: 0,
  font: '',
  textAlign: '',
  textBaseline: '',
  shadowColor: '',
  shadowBlur: 0,
  shadowOffsetX: 0,
  shadowOffsetY: 0,
  globalAlpha: 1,
  setLineDash: jest.fn(),
  strokeText: jest.fn(),
  fillText: jest.fn(),
  moveTo: jest.fn(),
  lineTo: jest.fn(),
  closePath: jest.fn(),
  quadraticCurveTo: jest.fn(),
  ellipse: jest.fn()
}));

HTMLCanvasElement.prototype.getBoundingClientRect = jest.fn(() => ({
  left: 0,
  top: 0,
  width: 800,
  height: 400
}));

// Mock canvas dimensions
Object.defineProperty(HTMLCanvasElement.prototype, 'width', {
  writable: true,
  value: 800
});

Object.defineProperty(HTMLCanvasElement.prototype, 'height', {
  writable: true,
  value: 400
});

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
global.cancelAnimationFrame = jest.fn();

// Mock device pixel ratio
Object.defineProperty(window, 'devicePixelRatio', {
  writable: true,
  value: 2
});

// Mock touch support
Object.defineProperty(window, 'ontouchstart', {
  writable: true,
  value: true
});

Object.defineProperty(navigator, 'maxTouchPoints', {
  writable: true,
  value: 5
});

// Mock TouchEvent
global.TouchEvent = class TouchEvent extends Event {
  constructor(type, eventInitDict = {}) {
    super(type);
    this.touches = eventInitDict.touches || [];
    this.changedTouches = eventInitDict.changedTouches || [];
  }
};

// Mock Touch
global.Touch = class Touch {
  constructor(touchInitDict) {
    this.clientX = touchInitDict.clientX || 0;
    this.clientY = touchInitDict.clientY || 0;
    this.target = touchInitDict.target || null;
  }
};
