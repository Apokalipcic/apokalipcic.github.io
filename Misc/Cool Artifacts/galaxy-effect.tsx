import React, { useState, useEffect, useRef } from 'react';

const Star = ({ style }) => {
  return (
    <div 
      className="absolute rounded-full" 
      style={style}
    />
  );
};

const GalaxyEffect = () => {
  const [stars, setStars] = useState([]);
  const [mousePosition, setMousePosition] = useState({ x: -1000, y: -1000 });
  const [blackHoleActive, setBlackHoleActive] = useState(false);
  const [blackHoleStrength, setBlackHoleStrength] = useState(0);
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const frameCount = useRef(0);
  const mouseStationaryTimer = useRef(null);
  
  // Initialize stars
  useEffect(() => {
    const generateInitialStars = () => {
      // 1000 stars
      const numStars = 1000;
      const newStars = [];
      
      for (let i = 0; i < numStars; i++) {
        newStars.push(createRandomStar(i));
      }
      
      setStars(newStars);
    };
    
    generateInitialStars();
    
    // Handle window resize
    const handleResize = () => {
      generateInitialStars();
    };
    
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (mouseStationaryTimer.current) {
        clearTimeout(mouseStationaryTimer.current);
      }
    };
  }, []);
  
  // Track mouse movement for black hole effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setMousePosition({ x, y });
        
        // Reset black hole formation timer when mouse moves
        if (mouseStationaryTimer.current) {
          clearTimeout(mouseStationaryTimer.current);
        }
        
        // Start forming black hole if mouse stays in same position
        mouseStationaryTimer.current = setTimeout(() => {
          setBlackHoleActive(true);
        }, 300); // Start forming black hole after 300ms of no movement
      }
    };
    
    const handleMouseLeave = () => {
      // Reset black hole when mouse leaves container
      setMousePosition({ x: -1000, y: -1000 });
      setBlackHoleActive(false);
      if (mouseStationaryTimer.current) {
        clearTimeout(mouseStationaryTimer.current);
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    if (containerRef.current) {
      containerRef.current.addEventListener('mouseleave', handleMouseLeave);
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (containerRef.current) {
        containerRef.current.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (mouseStationaryTimer.current) {
        clearTimeout(mouseStationaryTimer.current);
      }
    };
  }, []);
  
  // Handle black hole strength animation
  useEffect(() => {
    const updateBlackHoleStrength = () => {
      if (blackHoleActive) {
        // Gradually increase black hole strength
        setBlackHoleStrength(prevStrength => 
          prevStrength < 1 ? Math.min(prevStrength + 0.05, 1) : 1
        );
      } else {
        // Gradually decrease black hole strength
        setBlackHoleStrength(prevStrength => 
          prevStrength > 0 ? Math.max(prevStrength - 0.08, 0) : 0
        );
      }
    };
    
    const intervalId = setInterval(updateBlackHoleStrength, 50);
    return () => clearInterval(intervalId);
  }, [blackHoleActive]);
  
  // Create a random star
  const createRandomStar = (id) => {
    // Random size - keeping the larger default size
    const baseSize = 2 + Math.random() * 6;
    
    // Generate four colors for transitions instead of two
    const colorA = getRandomColor();
    const colorB = getRandomColor();
    const colorC = getRandomColor();
    const colorD = getRandomColor();
    
    // Random position across the entire canvas
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    
    // Random life stage (so not all stars start at the same phase)
    const lifeTime = Math.random();
    
    // Shorter random lifetime duration between 0.25 and 1.0 seconds
    const lifeDuration = 0.25 + Math.random() * 0.75;
    
    // Create directional vector (generally moving toward bottom-right, but faster)
    const directionX = 0.4 + Math.random() * 0.8; // 0.4-1.2 (faster rightward)
    const directionY = 0.4 + Math.random() * 0.8; // 0.4-1.2 (faster downward)
    
    return {
      id,
      x,
      y,
      baseSize,
      // Movement properties - increased speed by ~50%
      speed: 0.08 + Math.random() * 0.22,
      directionX,
      directionY,
      // Life cycle properties
      lifeTime,
      lifeDirection: Math.random() > 0.5 ? 1 : -1, // Random starting direction
      lifeSpeed: 0.01 / lifeDuration, // Adjusted for faster lifecycle
      lifeDuration, // Store the duration for reference
      // Color transition properties - now with 4 colors
      colorA,
      colorB,
      colorC,
      colorD,
      // Store original position (for black hole effect)
      originalX: x,
      originalY: y,
      // Black hole influence properties
      blackHoleInfluence: 0,
      swirlFactor: Math.random() * 2 * Math.PI, // Random starting angle for swirl
      swirlSpeed: 0.01 + Math.random() * 0.04  // How fast this star swirls
    };
  };
  
  // Animation loop
  useEffect(() => {
    const animate = () => {
      frameCount.current += 1;
      
      setStars(prevStars => {
        // Create a copy of the stars array
        const updatedStars = [...prevStars];
        
        // Continuously add new stars (every 2 frames, add multiple stars)
        if (frameCount.current % 2 === 0) {
          // Find stars to replace (off-screen or almost invisible)
          for (let i = 0; i < 10; i++) { // Replace up to 10 stars at once
            const indexToReplace = updatedStars.findIndex(star => 
              star.x > 105 || star.y > 105 || 
              (star.lifeTime < 0.1 && star.lifeDirection < 0)
            );
            
            if (indexToReplace !== -1) {
              updatedStars[indexToReplace] = createRandomStar(updatedStars[indexToReplace].id);
            }
          }
        }
        
        // Get black hole parameters
        const blackHoleRadius = 20 * blackHoleStrength; // Max radius of influence in % of screen
        const blackHoleX = mousePosition.x;
        const blackHoleY = mousePosition.y;
        const blackHoleIntensity = blackHoleStrength * 1.5; // Adjust intensity factor
        
        // Update all stars
        return updatedStars.map(star => {
          // Calculate distance to black hole (if active)
          let distanceToBlackHole = Math.sqrt(
            Math.pow(star.x - blackHoleX, 2) + 
            Math.pow(star.y - blackHoleY, 2)
          );
          
          // Determine black hole influence (0 = none, 1 = maximum)
          let blackHoleInfluence = 0;
          if (blackHoleStrength > 0 && distanceToBlackHole < blackHoleRadius) {
            // Stronger influence as stars get closer to the center
            blackHoleInfluence = (1 - distanceToBlackHole / blackHoleRadius) * blackHoleIntensity;
            blackHoleInfluence = Math.min(blackHoleInfluence, 1); // Cap at 1
          }
          
          // Apply black hole influence to star position
          let newX = star.x;
          let newY = star.y;
          
          if (blackHoleInfluence > 0) {
            // Direction to black hole center
            const dirToBlackHoleX = blackHoleX - star.x;
            const dirToBlackHoleY = blackHoleY - star.y;
            
            // For stars very close to black hole, add swirl effect
            if (blackHoleInfluence > 0.3) {
              // Swirl angle based on star's individual swirl properties
              const swirlAngle = star.swirlFactor + (frameCount.current * star.swirlSpeed);
              
              // Calculate swirl offset (perpendicular to direction to black hole)
              const swirlStrength = (blackHoleInfluence - 0.3) * 1.5; // Increases with proximity
              const swirlOffsetX = Math.cos(swirlAngle) * swirlStrength * 2;
              const swirlOffsetY = Math.sin(swirlAngle) * swirlStrength * 2;
              
              // Apply both attraction and swirl
              const pullStrength = blackHoleInfluence * 0.3;
              newX += dirToBlackHoleX * pullStrength + swirlOffsetX;
              newY += dirToBlackHoleY * pullStrength + swirlOffsetY;
            } else {
              // Just apply slight attraction for distant stars
              const pullStrength = blackHoleInfluence * 0.1;
              newX += dirToBlackHoleX * pullStrength;
              newY += dirToBlackHoleY * pullStrength;
            }
          } else {
            // Normal star movement when not influenced by black hole
            newX += star.directionX * star.speed;
            newY += star.directionY * star.speed;
          }
          
          // If star moves off-screen, create a new star instead of just resetting position
          if (newX > 105 || newY > 105) {
            return createRandomStar(star.id);
          }
          
          // Update life cycle (0 to 1 and back to 0)
          let newLifeTime = star.lifeTime + (star.lifeSpeed * star.lifeDirection);
          let newLifeDirection = star.lifeDirection;
          
          // Change direction if reaching limits
          if (newLifeTime >= 1) {
            newLifeTime = 1;
            newLifeDirection = -1;
          } else if (newLifeTime <= 0) {
            newLifeTime = 0;
            newLifeDirection = 1;
          }
          
          return {
            ...star,
            x: newX,
            y: newY,
            lifeTime: newLifeTime,
            lifeDirection: newLifeDirection,
            blackHoleInfluence: blackHoleInfluence,
            swirlFactor: star.swirlFactor + star.swirlSpeed
          };
        });
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => cancelAnimationFrame(animationRef.current);
  }, [mousePosition, blackHoleStrength]);
  
  // Function to generate a random color
  const getRandomColor = () => {
    // Color groups for more interesting combinations
    const colorGroups = [
      // Blues and purples
      ['#3498db', '#9b59b6', '#8e44ad', '#2980b9', '#6c5ce7', '#4834d4'],
      // Reds and oranges
      ['#e74c3c', '#d35400', '#e67e22', '#c0392b', '#ff7675', '#ff3838'],
      // Greens and teals
      ['#2ecc71', '#1abc9c', '#16a085', '#27ae60', '#00b894', '#32ff7e'],
      // Warm whites and yellows
      ['#f5f6fa', '#ffeaa7', '#f1c40f', '#fbc531', '#fffffe', '#fffa65'],
      // Cool whites and cyans
      ['#ecf0f1', '#00cec9', '#81ecec', '#dfe6e9', '#55efc4', '#18dcff']
    ];
    
    // Pick a random color group
    const group = colorGroups[Math.floor(Math.random() * colorGroups.length)];
    // Pick a random color from that group
    return group[Math.floor(Math.random() * group.length)];
  };
  
  // Function to get current color based on 4 colors and lifecycle
  const getCurrentColor = (star) => {
    // Divide lifecycle into 3 segments for transitions between 4 colors
    const lifePhase = star.lifeTime * 3; // 0-3 range
    
    if (lifePhase < 1) {
      // First transition: colorA to colorB
      return interpolateColors(star.colorA, star.colorB, lifePhase);
    } else if (lifePhase < 2) {
      // Second transition: colorB to colorC
      return interpolateColors(star.colorB, star.colorC, lifePhase - 1);
    } else {
      // Third transition: colorC to colorD
      return interpolateColors(star.colorC, star.colorD, lifePhase - 2);
    }
  };
  
  // Function to interpolate between two colors
  const interpolateColors = (colorA, colorB, ratio) => {
    // Convert hex to RGB
    const hexToRgb = (hex) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : {r: 255, g: 255, b: 255}; // Default to white if parsing fails
    };
    
    // Get RGB values for both colors
    const rgbA = hexToRgb(colorA);
    const rgbB = hexToRgb(colorB);
    
    // Interpolate between the colors
    const r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * ratio);
    const g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * ratio);
    const b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * ratio);
    
    return `rgb(${r}, ${g}, ${b})`;
  };
  
  // Create some glowing nebulas in the background
  const renderNebulas = () => {
    return (
      <>
        <div className="absolute w-full h-full opacity-20 overflow-hidden">
          {/* Nebula 1 - Blue */}
          <div 
            className="absolute rounded-full bg-blue-500 blur-3xl" 
            style={{
              width: '40%',
              height: '40%',
              left: '10%',
              top: '10%',
              opacity: 0.3
            }}
          />
          
          {/* Nebula 2 - Purple */}
          <div 
            className="absolute rounded-full bg-purple-500 blur-3xl" 
            style={{
              width: '60%',
              height: '60%',
              left: '60%',
              top: '70%',
              opacity: 0.2
            }}
          />
          
          {/* Nebula 3 - Teal */}
          <div 
            className="absolute rounded-full bg-teal-500 blur-3xl" 
            style={{
              width: '35%',
              height: '35%',
              left: '75%',
              top: '20%',
              opacity: 0.15
            }}
          />
          
          {/* Nebula 4 - Orange */}
          <div 
            className="absolute rounded-full bg-orange-400 blur-3xl" 
            style={{
              width: '25%',
              height: '25%',
              left: '35%',
              top: '65%',
              opacity: 0.1
            }}
          />
          
          {/* Nebula 5 - Pink */}
          <div 
            className="absolute rounded-full bg-pink-400 blur-3xl" 
            style={{
              width: '45%',
              height: '45%',
              left: '25%',
              top: '40%',
              opacity: 0.05
            }}
          />
        </div>
      </>
    );
  };
  
  // Render black hole effect
  const renderBlackHole = () => {
    if (blackHoleStrength <= 0) return null;
    
    return (
      <>
        {/* Dark center */}
        <div 
          className="absolute rounded-full bg-black" 
          style={{
            width: `${6 * blackHoleStrength}%`,
            height: `${6 * blackHoleStrength}%`,
            left: `${mousePosition.x - (3 * blackHoleStrength)}%`,
            top: `${mousePosition.y - (3 * blackHoleStrength)}%`,
            opacity: Math.min(blackHoleStrength * 1.2, 1),
            boxShadow: `0 0 ${20 * blackHoleStrength}px ${8 * blackHoleStrength}px rgba(0, 0, 0, 0.8)`,
            transform: `scale(${1 + blackHoleStrength * 0.3})`,
            transition: 'width 0.2s, height 0.2s, opacity 0.2s, box-shadow 0.2s'
          }}
        />
        
        {/* Accretion disk effect (subtle glow around black hole) */}
        <div 
          className="absolute rounded-full" 
          style={{
            width: `${14 * blackHoleStrength}%`,
            height: `${14 * blackHoleStrength}%`,
            left: `${mousePosition.x - (7 * blackHoleStrength)}%`,
            top: `${mousePosition.y - (7 * blackHoleStrength)}%`,
            background: `radial-gradient(circle, rgba(120, 0, 255, 0.2) 0%, rgba(255, 80, 0, 0.05) 50%, transparent 70%)`,
            opacity: blackHoleStrength * 0.7,
            transform: `scale(${1 + blackHoleStrength * 0.1})`,
            transition: 'width 0.2s, height 0.2s, opacity 0.2s'
          }}
        />
      </>
    );
  };
  
  return (
    <div 
      ref={containerRef}
      className="bg-black h-screen w-full overflow-hidden relative cursor-none"
    >
      {/* Deep space background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-950 via-black to-blue-950 opacity-90"></div>
      
      {/* Subtle nebula effects */}
      {renderNebulas()}
      
      {/* Black hole effect */}
      {renderBlackHole()}
      
      {/* Stars */}
      {stars.map(star => {
        // Calculate current star size based on life cycle (0->1->0)
        const baseSize = star.baseSize * star.lifeTime;
        
        // Black hole distortion affects size
        let currentSize = baseSize;
        if (star.blackHoleInfluence > 0) {
          // Stars get stretched/elongated as they approach the black hole
          currentSize = baseSize * (1 - star.blackHoleInfluence * 0.7);
        }
        
        // Get current color from the 4-color lifecycle
        const currentColor = getCurrentColor(star);
        
        // Calculate opacity based on life cycle and black hole influence
        const fadeInFactor = Math.min(star.lifeTime * 3, 1); // Fade in quickly (0-0.33 of life)
        const fadeOutFactor = star.lifeTime < 0.7 ? 1 : (1 - (star.lifeTime - 0.7) / 0.3); // Fade out in last 30% of life
        let opacity = Math.min(fadeInFactor, fadeOutFactor);
        
        // Stars close to black hole fade out
        if (star.blackHoleInfluence > 0.7) {
          opacity *= (1 - (star.blackHoleInfluence - 0.7) * 3); // Fade out when very close
        }
        
        // Stars very close to black hole stretch in the direction of the black hole
        let transform = '';
        if (star.blackHoleInfluence > 0.5) {
          // Calculate angle to black hole center
          const angle = Math.atan2(
            mousePosition.y - star.y,
            mousePosition.x - star.x
          ) * (180 / Math.PI);
          
          // Stretch more as black hole influence increases
          const stretchFactor = 1 + star.blackHoleInfluence * 4;
          transform = `rotate(${angle}deg) scaleX(${stretchFactor})`;
        }
        
        return (
          <Star
            key={star.id}
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${currentSize}px`,
              height: `${currentSize}px`,
              opacity: opacity,
              backgroundColor: currentColor,
              boxShadow: currentSize > 2 ? `0 0 ${currentSize * 3}px ${currentColor}` : 'none',
              transform: transform,
              transition: star.blackHoleInfluence > 0 ? 'none' : 'transform 0.2s' // Smoother transitions when not near black hole
            }}
          />
        );
      })}
      
      {/* Simple content */}
      <div className="flex flex-col items-center justify-center h-full relative z-10">
        <h1 className="text-white text-4xl font-light mb-6 tracking-widest">COSMIC VOYAGE</h1>
        <p className="text-blue-100 text-lg max-w-md text-center opacity-70">
          Hold your cursor still to create a black hole
        </p>
      </div>
    </div>
  );
};

export default GalaxyEffect;