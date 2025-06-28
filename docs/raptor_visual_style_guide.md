# Raptor: Call of the Shadows Reimagining - Visual Style Guide

## Overview

This document outlines the visual style for our reimagining of Raptor: Call of the Shadows. The goal is to create a modern interpretation that remains faithful to the original 1994 DOS game while enhancing the visual quality for contemporary displays.

## Visual Style

### Core Aesthetic

- **Retro-Modern Fusion**: Maintain the pixel art style of the original but with enhanced detail and smoother animations
- **Top-Down Perspective**: Preserve the vertical scrolling shooter perspective
- **Sci-Fi Military**: Futuristic fighter jets, military installations, and high-tech weaponry
- **Dynamic Lighting**: Add subtle lighting effects for explosions and weapon fire
- **Vibrant Color Palette**: Use bold, saturated colors that pop against darker backgrounds

### Color Palette
test
![Color Palette](https://example.com/color-palette.png)

#### Primary Colors
- **Deep Space Blue**: #0A1128 - For backgrounds and dark elements
- **Military Green**: #3E5622 - For ground-based enemies and terrain
- **Steel Gray**: #7D8491 - For metallic elements and UI frames
- **Warning Red**: #D62828 - For enemy highlights and warning indicators
- **Energy Blue**: #4CC9F0 - For player weapons and shields

#### Secondary Colors
- **Accent Orange**: #F77F00 - For explosions and special effects
- **Highlight Yellow**: #FCBF49 - For collectibles and power-ups
- **Tech Cyan**: #06D6A0 - For special weapons and energy indicators
- **Ground Brown**: #774936 - For terrain and ground installations
- **Water Teal**: #118AB2 - For water areas

### Typography

- **UI Font**: "Exo 2" - A modern, slightly futuristic sans-serif font for menus and HUD
- **Title Font**: "Orbitron" - Bold, tech-inspired font for game title and headings
- **In-Game Text**: "Rajdhani" - Clean, readable font for in-game messages

## Game Elements

### Player Ship

- **Style**: Sleek, aerodynamic fighter jet with futuristic elements
- **Color Scheme**: Primarily white/light gray with blue accents and red striping
- **Animation**: Subtle thruster animations, weapon mounting points that visibly change with upgrades
- **Detail Level**: Medium-high detail with recognizable cockpit, wings, and thrusters
- **Size**: Approximately 64x64 pixels

### Enemy Types

#### Air Enemies
- **Fighters**: Small, agile craft with sharp angles and visible weapon mounts
- **Bombers**: Larger, bulkier craft with visible bomb bays and heavier armor
- **Elite Ships**: More detailed designs with unique silhouettes and special weapon effects

#### Ground Installations
- **Turrets**: Rotating gun turrets with visible barrels and base structures
- **Missile Launchers**: Rectangular structures with opening missile doors
- **Buildings**: Industrial/military structures with destructible elements
- **Radar Dishes**: Communication installations with rotating dish components

#### Bosses
- **Level 1 Boss**: Large aircraft carrier-like vessel with multiple weapon systems
- **Level 2 Boss**: Heavily armored ground installation with surrounding defense systems

### Projectiles

- **Player Weapons**:
  - **Machine Gun**: Small, bright blue energy bolts
  - **Missiles**: Sleek missiles with visible thrusters
  - **Special Weapons**: Unique visual effects based on weapon type

- **Enemy Weapons**:
  - **Standard Fire**: Red/orange energy bolts
  - **Missiles**: Darker, more menacing designs than player missiles
  - **Special Attacks**: Distinct visual patterns for different enemy types

### Collectibles

- **Health**: Green cross or medical symbol with glowing effect
- **Shield**: Blue shield icon with pulsing animation
- **Weapons**: Distinctive icons representing each weapon type
- **Money/Points**: Gold coins or credit symbols
- **Megabombs**: Orange/red bomb icon with warning symbols

### Environment

#### Backgrounds
- **Level 1**: Ocean with islands, transitioning to coastal areas
- **Level 2**: Terrain with more industrial elements and military installations

#### Terrain Features
- **Water**: Animated blue surface with subtle wave patterns
- **Land**: Textured brown/green surfaces with detail elements
- **Roads/Runways**: Gray strips with markings
- **Vegetation**: Minimal stylized trees and bushes

### Visual Effects

- **Explosions**: Multi-frame animations with expanding fireballs and debris
- **Weapon Fire**: Glowing effects with appropriate colors for each weapon type
- **Shield Hits**: Blue/white flashes and ripple effects
- **Damage**: Smoke trails and visible damage states on player and enemy craft
- **Collectible Pickup**: Brief flash and particle effects

### UI Elements

- **Health Bar**: Red bar with gradient effect and clear border
- **Shield Bar**: Blue bar with pulsing effect
- **Weapon Display**: Icons showing current and available weapons
- **Score/Money**: Digital counter with gold/yellow text
- **Megabomb Count**: Small icons showing available bombs
- **Menu Screens**: Dark backgrounds with tech-inspired borders and highlights

## Animation Guidelines

- **Player Ship**: 2-3 frame thruster animation, weapon firing animations
- **Enemy Movement**: Unique movement patterns for each enemy type
- **Explosions**: 8-12 frame animations with varying sizes based on object destroyed
- **Collectibles**: Subtle pulsing or rotating animations
- **Background**: Continuous scrolling with parallax layers for depth
- **UI Elements**: Subtle animations for health changes, weapon selection

## Technical Specifications

- **Resolution**: Base sprites designed at 2x original resolution for crisp appearance
- **Format**: PNG with transparency for all game elements
- **Sprite Sheets**: Organized by element type for efficient loading
- **Animation Frames**: Consistent frame sizes within sprite sheets
- **File Naming**: Descriptive naming convention (e.g., `player_ship_base.png`, `enemy_fighter_1.png`)

## Implementation Notes

- Use sprite sheets to minimize texture swapping
- Implement simple particle systems for enhanced visual effects
- Consider adding subtle screen shake for explosions and impacts
- Use layered rendering for depth (background, terrain, enemies, player, effects, UI)
- Implement smooth scrolling with multiple background layers

This style guide serves as the foundation for creating consistent and visually appealing assets for our Raptor: Call of the Shadows reimagining.

