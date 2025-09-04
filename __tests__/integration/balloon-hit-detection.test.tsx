import React from 'react';

describe('Balloon Hit Detection Analysis', () => {
  test('analyzes hit detection with floating balloons', () => {
    // Simulate balloon Z in top-right corner
    const balloonZ = {
      id: 19, // Z is typically the last balloon
      x: 700, // Top-right area
      y: 100, // Top area
      size: 0.8,
      floatPhase: Math.PI / 4, // 45 degrees
      floatAmount: 5, // 5px floating range
      phoneme: 'Z'
    };

    // Calculate floating Y position
    const floatingY = balloonZ.y + Math.sin(balloonZ.floatPhase) * balloonZ.floatAmount;
    
    console.log(`Balloon Z base Y: ${balloonZ.y}`);
    console.log(`Balloon Z floating Y: ${floatingY.toFixed(1)}`);
    console.log(`Float offset: ${(floatingY - balloonZ.y).toFixed(1)}px`);

    // Test click coordinates (where user might click)
    const clickX = 700;
    const clickY = 100; // User clicks at base position

    // Calculate distance using floating position (current implementation)
    const dx = balloonZ.x - clickX;
    const dy = floatingY - clickY;
    const distanceWithFloat = Math.sqrt(dx * dx + dy * dy);

    // Calculate distance using base position (what user expects)
    const dyBase = balloonZ.y - clickY;
    const distanceWithBase = Math.sqrt(dx * dx + dyBase * dyBase);

    // Mobile hit radius
    const isMobile = true;
    const baseHitRadius = isMobile ? 80 : 50;
    const hitRadius = baseHitRadius * balloonZ.size;

    console.log(`Distance with floating Y: ${distanceWithFloat.toFixed(1)}`);
    console.log(`Distance with base Y: ${distanceWithBase.toFixed(1)}`);
    console.log(`Hit radius: ${hitRadius.toFixed(1)}`);
    console.log(`Hit with floating: ${distanceWithFloat < hitRadius}`);
    console.log(`Hit with base: ${distanceWithBase < hitRadius}`);

    // The issue: if balloon is floating up, distance increases
    expect(distanceWithFloat).toBeGreaterThan(distanceWithBase);
    
    // This could cause the balloon to be unclickable when floating
    if (distanceWithFloat > hitRadius && distanceWithBase < hitRadius) {
      console.log('❌ PROBLEM: Balloon is unclickable when floating!');
    }
  });

  test('tests different float phases and their impact on hit detection', () => {
    const balloon = {
      x: 700,
      y: 100,
      size: 0.8,
      floatAmount: 5
    };

    const clickX = 700;
    const clickY = 100;
    const baseHitRadius = 80;
    const hitRadius = baseHitRadius * balloon.size;

    // Test different float phases
    const phases = [0, Math.PI / 4, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    
    phases.forEach((phase, index) => {
      const floatingY = balloon.y + Math.sin(phase) * balloon.floatAmount;
      const dy = floatingY - clickY;
      const distance = Math.sqrt((balloon.x - clickX) ** 2 + dy ** 2);
      const isClickable = distance < hitRadius;
      
      console.log(`Phase ${index}: floatY=${floatingY.toFixed(1)}, distance=${distance.toFixed(1)}, clickable=${isClickable}`);
    });
  });

  test('suggests solution: use base Y position for hit detection', () => {
    const balloon = {
      x: 700,
      y: 100,
      size: 0.8,
      floatPhase: Math.PI / 2, // Maximum float
      floatAmount: 5
    };

    const clickX = 700;
    const clickY = 100;
    const baseHitRadius = 80;
    const hitRadius = baseHitRadius * balloon.size;

    // Current implementation (with floating)
    const floatingY = balloon.y + Math.sin(balloon.floatPhase) * balloon.floatAmount;
    const dyFloat = floatingY - clickY;
    const distanceFloat = Math.sqrt((balloon.x - clickX) ** 2 + dyFloat ** 2);

    // Proposed solution (base position only)
    const dyBase = balloon.y - clickY;
    const distanceBase = Math.sqrt((balloon.x - clickX) ** 2 + dyBase ** 2);

    console.log(`Current (floating): distance=${distanceFloat.toFixed(1)}, hit=${distanceFloat < hitRadius}`);
    console.log(`Proposed (base): distance=${distanceBase.toFixed(1)}, hit=${distanceBase < hitRadius}`);

    // Base position should always be more reliable
    expect(distanceBase).toBeLessThanOrEqual(distanceFloat);
  });
});
