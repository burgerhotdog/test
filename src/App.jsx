import React, { useState, useCallback, useEffect, useRef, memo } from 'react';
import {
  Container,
  Box,
  Button,
  Typography,
  Card,
  CardMedia,
  Stack,
  CircularProgress,
  Paper,
} from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import { styled } from '@mui/system';

// Styled components for the app
const AppBackground = styled(Box)({
  minHeight: '100vh',
  background: 'linear-gradient(135deg, #1a2a6c, #b21f1f, #fdbb2d)',
  padding: '12px 0',
  margin: 0,
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  width: '100vw',
  height: '100vh',
  overflow: 'auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

const AppContainer = styled(Container)({
  paddingTop: '12px',
  paddingBottom: '12px',
  height: '100%',
  width: '100%',
  overflowX: 'hidden',
  display: 'flex',
  justifyContent: 'center',
});

const MainContent = styled(Paper)({
  padding: '24px',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  background: 'radial-gradient(circle, #ffffff 30%, #f0f8ff 70%, #c4e0f3 100%)',
  height: '700px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  overflow: 'hidden',
  width: '100%',
  maxWidth: '1200px',
  margin: '0 auto',
  minWidth: 'min-content',
});

const AppTitle = styled(Typography)({
  fontWeight: 800,
  color: '#222',
  textAlign: 'center',
  marginBottom: '16px',
  fontSize: '1.8rem',
});

const ActionButton = styled(Button)({
  padding: '12px 24px',
  borderRadius: '50px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '16px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  background: 'linear-gradient(45deg, #FF416C, #FF4B2B)',
  '&:hover': {
    background: 'linear-gradient(45deg, #FF4B2B, #FF416C)',
    boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
  }
});

// Add a SwipeIndicator component for the rainbow line
const SwipeIndicator = styled(motion.div)({
  position: 'absolute',
  height: '15px',
  background: 'linear-gradient(to right, #ff0000, #ff9900, #ffff00, #00ff00, #0099ff, #6633ff)',
  borderRadius: '6px',
  boxShadow: '0 0 30px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.9), 0 0 50px rgba(255,255,255,0.8)',
  zIndex: 3, // Higher than the pack images to ensure visibility
  pointerEvents: 'none',
  width: '100%', // Full width always
  opacity: 0.9,
  filter: 'saturate(2) brightness(1.8) contrast(1.5)', // Make colors more vibrant
});

// Add a "knife/cutting" effect element
const CuttingEffect = styled(motion.div)({
  position: 'absolute',
  width: '6px',
  height: '30px',
  background: 'linear-gradient(to bottom, transparent, #ffffff, transparent)',
  boxShadow: '0 0 20px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.9), 0 0 60px rgba(255,255,255,0.8)',
  zIndex: 8, // Above everything
  pointerEvents: 'none',
  borderRadius: '3px',
});

// Add an EdgeIndicator to highlight where to swipe
const EdgeIndicator = styled(motion.div)({
  position: 'absolute',
  height: '30px',
  background: 'rgba(255, 255, 255, 0.2)',
  border: '2px dashed rgba(255, 255, 255, 0.5)',
  borderRadius: '4px',
  zIndex: 3,
  pointerEvents: 'none',
  width: '30%', // Change from 100% to 30% to show only the left portion
  left: 0, // Ensure it's at the left edge
});

// Limitless TCG Pocket data
const SET_CODE = 'A2b'; // Shining Revelry set code
const CARD_BASE_URL = `https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/pocket/${SET_CODE}/${SET_CODE}_`;

// Regular function for formatting card URLs (not a hook)
const formatCardImageUrl = (cardNumber) => {
  // Format the card number with leading zeros to match the URL pattern (e.g., 001)
  const formattedNumber = String(cardNumber).padStart(3, '0');
  return `${CARD_BASE_URL}${formattedNumber}_EN.webp`;
};

// Diamond card numbers
const oneDiamond = [1, 4, 5, 8, 11, 14, 16, 18, 23, 26, 29, 32, 33, 36, 37, 38, 40, 41, 42, 45, 47, 50, 52, 55, 58, 59, 60, 62, 63, 64, 66, 67];
const twoDiamond = [2, 6, 9, 13, 15, 17, 21, 24, 25, 27, 30, 34, 44, 46,49, 53, 56, 68, 69, 70, 71, 72];
const threeDiamond = [7, 12, 20, 28, 31, 39, 51, 57, 61];
const fourDiamond = [3, 10, 19, 22, 35, 43, 48, 54, 65];

// Styled components for the pack and cards
const PackContainer = styled(motion.div)(({ theme }) => ({
  position: 'relative',
  width: 340,
  height: 654,
  borderRadius: 16,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  overflow: 'hidden',
  cursor: 'grab',
  '&:active': { cursor: 'grabbing' },
  perspective: '1000px',
  userSelect: 'none', // Prevent text selection
  WebkitUserSelect: 'none',
  MozUserSelect: 'none', 
  msUserSelect: 'none',
}));

const PackTop = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '15%',
  background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  zIndex: 2,
  transformOrigin: 'top',
  userSelect: 'none', // Prevent text selection
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
});

const PackRest = styled(motion.div)({
  position: 'absolute',
  top: '15%',
  left: 0,
  width: '100%',
  height: '85%',
  background: 'linear-gradient(45deg, #ff6b6b, #ff8e53)',
  borderBottomLeftRadius: 16,
  borderBottomRightRadius: 16,
  zIndex: 2,
  userSelect: 'none', // Prevent text selection
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
});

const PackWrapper = styled(motion.div)({
  position: 'relative',
  width: '100%',
  height: '100%',
  overflow: 'visible',
  userSelect: 'none', // Prevent text selection
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
});

const PackOverlay = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: 'rgba(0,0,0,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 10,
  userSelect: 'none', // Prevent text selection
  WebkitUserSelect: 'none',
  MozUserSelect: 'none',
  msUserSelect: 'none',
});

const CardStack = styled(motion.div)({
  position: 'relative',
  width: 367,
  height: 512,
  borderRadius: 16,
  margin: '0 auto',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  perspective: '1000px',
});

const CardInStack = styled(motion.div)({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  borderRadius: 16,
  backfaceVisibility: 'hidden',
  boxShadow: '0 8px 16px rgba(0,0,0,0.2)',
  background: 'white',
});

// Simplified animation variants
const packVariants = {
  sealed: { 
    opacity: 1, 
    scale: 1, 
    y: 0, 
    transition: { 
      duration: 0.6, 
      type: "spring", 
      stiffness: 70, 
      damping: 15, 
      delay: 0.3 // Give time for the previous content to fade out
    } 
  },
  initial: { opacity: 0, scale: 0.9, y: 200 },
  opening: { scale: 1.05, transition: { duration: 0.3 } },
  opened: {
    opacity: 0, scale: 0.9,
    transition: { opacity: { duration: 0.3 }, scale: { duration: 0.3 } }
  }
};

const packTopVariants = {
  sealed: { rotateX: 0, y: 0, opacity: 1 },
  opening: {
    rotateX: -60, y: -300, opacity: 0,
    transition: { type: 'spring', stiffness: 100, damping: 10, duration: 0.8 }
  }
};

const packBottomVariants = {
  sealed: { y: 0, opacity: 1 },
  opening: {
    y: 500, opacity: 0,
    transition: { 
      type: 'spring', 
      stiffness: 70, 
      damping: 10, 
      delay: 0.4,
      duration: 0.8 
    }
  }
};

// Memoized card component for better performance
const SingleCard = memo(({ card, width, height, delay, index, getCardImageUrl }) => {
  return (
    <motion.div
      key={`grid-card-${card}-${index}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{ userSelect: 'none' }}
    >
      <Card sx={{ 
        width, 
        height,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        borderRadius: '8px',
      }}>
        <CardMedia
          component="img"
          image={getCardImageUrl(card)}
          alt={String(card)}
          loading="lazy"
          sx={{ 
            height: '100%', 
            width: '100%',
            objectFit: 'cover',
            objectPosition: 'center'
          }}
          draggable="false"
        />
      </Card>
    </motion.div>
  );
});

// Make sure positions are consistent between animation and final state
const CARD_WIDTH = 260;
const CARD_HEIGHT = 370;
const CARD_POSITION = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)'
};

function App() {
  const [packState, setPackState] = useState('sealed'); // 'sealed', 'opening', 'opened'
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [showAllCards, setShowAllCards] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false); // New state for transition
  const [swipeStarted, setSwipeStarted] = useState(false);
  const [swipeProgress, setSwipeProgress] = useState(0);
  const [swipePosition, setSwipePosition] = useState({ x: 0, y: 0 });
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [isNearEdge, setIsNearEdge] = useState(false);
  const [showNewPackButton, setShowNewPackButton] = useState(false);
  
  const packRef = useRef(null);
  const cardConstraintsRef = useRef(null);
  const cardRefs = useRef(Array(5).fill().map(() => useAnimation()));
  
  // Add cursor styling to the entire app when in cutting mode
  const appCursorStyle = packState === 'sealed' && isMouseDown ? { cursor: 'grabbing' } : {};
  
  // Memoize card URL function to prevent recalculation
  const getCardImageUrl = useCallback((cardNumber) => {
    return formatCardImageUrl(cardNumber);
  }, []);
  
  // Reset to a new pack
  const resetPack = useCallback(() => {
    // Start the transition animation
    setIsTransitioning(true);
    
    // Wait for fade-out animation to complete
    setTimeout(() => {
      // Reset states
      setPackState('sealed');
      setCards([]);
      setCurrentCardIndex(0);
      setShowAllCards(false);
      setShowNewPackButton(false);
      
      // End transition after a short delay to ensure state updates are processed
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }, 500); // Match this with the CSS transition duration
  }, []);

  // Get cards for a new pack with proper rarity distribution - memoized for performance
  const getPackCards = useCallback(() => {
    const pack = [];

    // Regular or Rare Pack
    const packSelection = Math.random();
    if (packSelection < 0.0005) {
      // Rare Pack logic
      for (let i = 0; i < 5; i++) {
        const rarity = Math.random();
        if (rarity < 0.02564) { // Crown
          pack.push(111);
        } else if (rarity < 0.1282) { // 2 Shiny
          const offset = Math.floor(Math.random() * 4);
          pack.push(107 + offset);
        } else if (rarity < 0.38461) { // 1 Shiny
          const offset = Math.floor(Math.random() * 10);
          pack.push(97 + offset);
        } else if (rarity < 0.41025) { // 3 Star
          pack.push(96);
        } else if (rarity < 0.84614) { // 2 Star
          const offset = Math.floor(Math.random() * 17);
          pack.push(79 + offset);
        } else { // 1 Star
          const offset = Math.floor(Math.random() * 6);
          pack.push(73 + offset);
        }
      }
    } else {
      // Regular Pack logic 
      for (let i = 0; i < 3; i++) {
        const index = Math.floor(Math.random() * oneDiamond.length);
        pack.push(oneDiamond[index]);
      }

      // 4th card
      const rarity4 = Math.random();
      if (rarity4 < 0.0004) { // Crown
        pack.push(111);
      } else if (rarity4 < 0.00373) { // 2 Shiny
        const offset = Math.floor(Math.random() * 4);
        pack.push(107 + offset);
      } else if (rarity4 < 0.01087) { // 1 Shiny
        const offset = Math.floor(Math.random() * 10);
        pack.push(97 + offset);
      } else if (rarity4 < 0.01309) { // 3 Star
        pack.push(96);
      } else if (rarity4 < 0.01809) { // 2 Star
        const offset = Math.floor(Math.random() * 17);
        pack.push(79 + offset);
      } else if (rarity4 < 0.04381) { // 1 Star
        const offset = Math.floor(Math.random() * 6);
        pack.push(73 + offset);
      } else if (rarity4 < 0.06047) { // 4 Diamond
        const index = Math.floor(Math.random() * fourDiamond.length);
        pack.push(fourDiamond[index]);
      } else if (rarity4 < 0.10999) { // 3 Diamond
        const index = Math.floor(Math.random() * threeDiamond.length);
        pack.push(threeDiamond[index]);
      } else { // 2 Diamond
        const index = Math.floor(Math.random() * twoDiamond.length);
        pack.push(twoDiamond[index]);
      }

      // 5th card
      const rarity5 = Math.random();
      if (rarity5 < 0.0016) { // Crown
        pack.push(111);
      } else if (rarity5 < 0.01493) { // 2 Shiny
        const offset = Math.floor(Math.random() * 4);
        pack.push(107 + offset);
      } else if (rarity5 < 0.0435) { // 1 Shiny
        const offset = Math.floor(Math.random() * 10);
        pack.push(97 + offset);
      } else if (rarity5 < 0.05238) { // 3 Star
        pack.push(96);
      } else if (rarity5 < 0.07238) { // 2 Star
        const offset = Math.floor(Math.random() * 17);
        pack.push(79 + offset);
      } else if (rarity5 < 0.17526) { // 1 Star
        const offset = Math.floor(Math.random() * 6);
        pack.push(73 + offset);
      } else if (rarity5 < 0.2419) { // 4 Diamond
        const index = Math.floor(Math.random() * fourDiamond.length);
        pack.push(fourDiamond[index]);
      } else if (rarity5 < 0.44) { // 3 Diamond
        const index = Math.floor(Math.random() * threeDiamond.length);
        pack.push(threeDiamond[index]);
      } else { // 2 Diamond
        const index = Math.floor(Math.random() * twoDiamond.length);
        pack.push(twoDiamond[index]);
      }
    }
    return pack;
  }, []);

  // Start the pack opening animation
  const openPack = useCallback(() => {
    if (packState !== 'sealed' || loading || swipeProgress < 0.9) return;
    
    // Immediately stop further swipes and reset mouse states
    setSwipeStarted(false);
    setIsMouseDown(false);
    setLoading(true);
    
    // Pre-generate cards immediately before animation starts
    const newCards = getPackCards();
    setCards(newCards);
    setShowNewPackButton(false); // Ensure button is hidden
    
    // Short delay to ensure cards are loaded into state
    setTimeout(() => {
      setPackState('opening');
      
      // Wait for animation to complete before finalizing
      setTimeout(() => {
        setPackState('opened');
        setLoading(false);
      }, 1500);
    }, 50);
  }, [packState, loading, getPackCards, swipeProgress]);

  // Handle swipe interactions
  const handleSwipeStart = useCallback((e) => {
    if (packState !== 'sealed' || loading || !packRef.current) return;
    
    // Get position relative to the pack element
    const packRect = packRef.current.getBoundingClientRect();
    const y = e.clientY - packRect.top;
    const x = e.clientX - packRect.left;
    
    // Check if swipe is starting near the opening edge (around 15% of pack height)
    const edgePosition = packRect.height * 0.15;
    const tolerance = 30; // pixels
    
    // Left edge tolerance for starting the swipe
    const leftEdgeTolerance = 50; // pixels
    const isNearLeftEdge = x <= leftEdgeTolerance;
    
    if (Math.abs(y - edgePosition) <= tolerance && isNearLeftEdge) {
      setSwipeStarted(true);
      setSwipeProgress(0);
      setSwipePosition({ 
        x: e.clientX - packRect.left, 
        y: edgePosition // Lock to the edge line
      });
    }
  }, [packState, loading]);
  
  // Handle mouse down anywhere
  const handleMouseDown = useCallback((e) => {
    if (packState !== 'sealed' || loading) return;
    // Store that mouse is down, but don't start swipe yet
    setIsMouseDown(true);
  }, [packState, loading]);
  
  // Handle mouse move, checks for both regular swipe and entering-from-outside swipe
  const handleSwipeMove = useCallback((e) => {
    if (packState !== 'sealed' || !packRef.current) return;
    
    const packRect = packRef.current.getBoundingClientRect();
    const y = e.clientY - packRect.top;
    const x = e.clientX - packRect.left;
    
    // Check if mouse is within pack boundaries
    const isWithinPackX = x >= 0 && x <= packRect.width;
    const isWithinPackY = y >= 0 && y <= packRect.height;
    
    // Check if mouse is near the edge line
    const edgePosition = packRect.height * 0.15;
    const tolerance = 30; // pixels
    const isNearEdge = Math.abs(y - edgePosition) <= tolerance;
    
    // Left edge tolerance for starting the swipe
    const leftEdgeTolerance = 50; // pixels
    const isNearLeftEdge = x <= leftEdgeTolerance;
    
    // Case 1: Already in swipe mode, update progress
    if (swipeStarted) {
      // Calculate swipe progress (from left to right)
      const progress = Math.min(Math.max(x / packRect.width, 0), 1);
      setSwipeProgress(progress);
      setSwipePosition(prev => ({ 
        ...prev, 
        x: Math.max(0, Math.min(x, packRect.width))
      }));
      
      // Auto-complete the swipe if we reach the right edge
      if (progress >= 0.95) {
        // Complete the swipe and call openPack
        openPack();
      }
    } 
    // Case 2: Mouse is down, within pack, near edge, and near left edge - start swipe
    else if (isMouseDown && isWithinPackX && isWithinPackY && isNearEdge && isNearLeftEdge) {
      setSwipeStarted(true);
      // For progress, use current x position
      const progress = Math.min(Math.max(x / packRect.width, 0), 1);
      setSwipeProgress(progress);
      setSwipePosition({ 
        x: Math.max(0, Math.min(x, packRect.width)), 
        y: edgePosition // Lock to the edge line
      });
    }
  }, [swipeStarted, packState, isMouseDown, openPack]);
  
  // Handle mouse up, cleanup
  const handleSwipeEnd = useCallback(() => {
    setSwipeStarted(false);
    setIsMouseDown(false);
    
    if (swipeStarted && swipeProgress > 0.9) {
      // If swiped more than 90% across, open the pack
      openPack();
    }
  }, [swipeStarted, swipeProgress, openPack]);

  // Animate cards when revealed
  useEffect(() => {
    if (packState === 'opened' && cards.length > 0 && !showAllCards) {
      // Set initial state for all cards
      cards.forEach((_, index) => {
        // Reset animation controls for each card
        cardRefs.current[index].set({ 
          x: index < currentCardIndex ? 500 : 0, // Keep swiped cards away
          opacity: index < currentCardIndex ? 0 : 1, // Keep swiped cards hidden
          rotate: index < currentCardIndex ? 5 : 0,
          scale: 1
        });
      });
      // No pulse animation - cards are ready to be tapped immediately
    }
  }, [packState, cards, showAllCards, cardRefs, currentCardIndex]);

  // Handle card tap to reveal next card
  const handleCardTap = useCallback(() => {
    // Get the animation control for current card
    const currentCardControl = cardRefs.current[currentCardIndex];
    
    // Check if this is the last card
    const isLastCard = currentCardIndex === cards.length - 1;
    
    // Animate current card sliding off to the right
    currentCardControl.start({
      x: 500,
      opacity: 0,
      rotate: 5,
      transition: { duration: 0.4, ease: "easeOut" }
    }).then(() => {
      // After animation completes, handle next steps
      if (!isLastCard) {
        // Move to next card if not the last one
        setCurrentCardIndex(prev => prev + 1);
      } else {
        // For the last card, you can either:
        // 1. Show the grid view of all cards
        setShowAllCards(true);
        // Or 2. Show the "Open New Pack" button
        // Uncomment the line below and comment the setShowAllCards line above if you prefer showing the button
        // setShowNewPackButton(true);
      }
    });
  }, [cardRefs, currentCardIndex, cards.length]);

  // Render a single card with detailed information - memoized
  const renderCardWithDetails = useCallback((card) => (
    <Card sx={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      <CardMedia
        component="img"
        image={getCardImageUrl(card)}
        alt={String(card)}
        loading="lazy"
        sx={{ 
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'center'
        }}
        draggable="false"
      />
    </Card>
  ), [getCardImageUrl]);

  // Render all cards in the stack, with proper visibility control
  const renderCardStack = useCallback(() => {
    if (cards.length === 0) return null;
    
    return cards.map((card, index) => (
      <CardInStack
        key={`card-${card}-${index}`}
        onClick={index === currentCardIndex ? handleCardTap : undefined}
        animate={cardRefs.current[index]}
        whileHover={index === currentCardIndex ? { scale: 1.03, boxShadow: '0 12px 30px rgba(0,0,0,0.3)' } : undefined}
        style={{ 
          zIndex: cards.length - index,
          background: 'white',
          visibility: index < currentCardIndex ? 'hidden' : 'visible', // Hide swiped cards
          cursor: index === currentCardIndex ? 'pointer' : 'default',
          transform: `translateY(${(index - currentCardIndex) * 5}px) scale(${1 - (index - currentCardIndex) * 0.02})`,
          pointerEvents: index === currentCardIndex ? 'auto' : 'none',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }}
      >
        {renderCardWithDetails(card)}
      </CardInStack>
    ));
  }, [cards, currentCardIndex, handleCardTap, renderCardWithDetails]);

  // Effect to reset mouse states when pack state changes
  useEffect(() => {
    // Reset mouse states whenever pack state changes from 'sealed'
    if (packState !== 'sealed') {
      setIsMouseDown(false);
      setSwipeStarted(false);
    }
  }, [packState]);

  // Effect to add global mouse event listeners when needed
  useEffect(() => {
    // Only add listeners if we're in the sealed pack state
    if (packState === 'sealed') {
      // Add global mouse event listeners
      document.addEventListener('mousemove', handleSwipeMove);
      document.addEventListener('mouseup', handleSwipeEnd);
      
      // Cleanup function
      return () => {
        document.removeEventListener('mousemove', handleSwipeMove);
        document.removeEventListener('mouseup', handleSwipeEnd);
      };
    }
  }, [packState, handleSwipeMove, handleSwipeEnd]);

  // Handler for mouse leaving the pack
  const handleMouseLeavePack = useCallback(() => {
    setIsHovering(false);
    setIsNearEdge(false);
    // Don't end the swipe anymore, since we want to continue tracking it outside
  }, []);
  
  // Add handler to check if mouse is near the edge
  const handleMouseMoveOverPack = useCallback((e) => {
    if (packState !== 'sealed' || loading || swipeStarted || !packRef.current) return;
    
    const packRect = packRef.current.getBoundingClientRect();
    const y = e.clientY - packRect.top;
    const x = e.clientX - packRect.left;
    
    // Check if mouse is near the opening edge
    const edgePosition = packRect.height * 0.15;
    const tolerance = 30; // pixels
    
    // Left edge tolerance for starting the swipe
    const leftEdgeTolerance = 50; // pixels
    const isNearLeftEdge = x <= leftEdgeTolerance;
    
    // Only set isNearEdge to true if also near the left edge
    setIsNearEdge(Math.abs(y - edgePosition) <= tolerance && isNearLeftEdge);
  }, [packState, loading, swipeStarted]);

  // Effect to add a global mouseup event listener for fail-safe reset
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsMouseDown(false);
      setSwipeStarted(false);
    };
    
    // Add global mouseup handler that will reset states regardless of component state
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    // Cleanup
    return () => {
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  return (
    <AppBackground 
      onMouseDown={handleMouseDown}
      style={appCursorStyle}
    >
      <AppContainer maxWidth="lg">
        <MainContent elevation={0}>
          <AppTitle variant="h4" gutterBottom>
            Pokémon TCG Pocket - Shining Revelry - Simulator
          </AppTitle>

          <Box sx={{ 
            flex: 1, 
            width: '100%', 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            position: 'relative'
          }}>
            {/* Initial Pack State */}
            {packState === 'sealed' && (
              <PackContainer
                ref={packRef}
                onMouseDown={handleMouseDown}
                onMouseMove={(e) => {
                  handleSwipeMove(e);
                  handleMouseMoveOverPack(e);
                }}
                onMouseUp={handleSwipeEnd}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={handleMouseLeavePack}
                variants={packVariants}
                initial="initial"
                animate="sealed"
                style={{ 
                  cursor: swipeStarted ? 'grabbing' : (isNearEdge ? 'e-resize' : 'pointer'),
                  width: 300,
                  height: 570,
                }}
              >
                {/* Edge indicator - shows where to swipe */}
                {isNearEdge && !swipeStarted && packRef.current && (
                  <EdgeIndicator
                    style={{ 
                      top: packRef.current.getBoundingClientRect().height * 0.15 - 15,
                    }}
                    animate={{ 
                      opacity: [0.5, 0.8, 0.5],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 1.5,
                    }}
                  />
                )}
                
                {/* Rainbow reveal effect */}
                {swipeStarted && (
                  <>
                    <SwipeIndicator
                      style={{ 
                        top: swipePosition.y - 7, // Center line on swipe position
                        left: 0,
                        height: '15px',
                        clipPath: `polygon(0 0, ${swipeProgress * 100}% 0, ${swipeProgress * 100}% 100%, 0 100%)`,
                        mixBlendMode: 'screen',
                      }}
                      animate={{ 
                        boxShadow: [
                          '0 0 30px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.9), 0 0 50px rgba(255,255,255,0.8)',
                          '0 0 40px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.9), 0 0 80px rgba(255,255,255,0.8)',
                          '0 0 30px rgba(255,255,255,1), 0 0 40px rgba(255,255,255,0.9), 0 0 50px rgba(255,255,255,0.8)'
                        ],
                        filter: [
                          'saturate(2) brightness(1.8) contrast(1.5)',
                          'saturate(2.5) brightness(2) contrast(1.6)',
                          'saturate(2) brightness(1.8) contrast(1.5)'
                        ]
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 1.2,
                      }}
                    />
                    <CuttingEffect 
                      style={{
                        top: swipePosition.y - 15,
                        left: `calc(${swipeProgress * 100}% - 3px)`,
                        height: '30px',
                      }}
                      animate={{ 
                        opacity: [0.85, 1, 0.85],
                        boxShadow: [
                          '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)',
                          '0 0 30px rgba(255,255,255,1), 0 0 60px rgba(255,255,255,0.9), 0 0 90px rgba(255,255,255,0.7)',
                          '0 0 15px rgba(255,255,255,0.8), 0 0 30px rgba(255,255,255,0.6)'
                        ],
                        width: ['5px', '8px', '5px'],
                      }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 0.7,
                      }}
                    />
                  </>
                )}
                
                <PackOverlay
                  style={{ 
                    opacity: (loading || (isHovering && !swipeStarted)) ? 1 : 0,
                    transition: 'opacity 0.2s ease'
                  }}
                >
                  {loading ? (
                    <CircularProgress color="inherit" />
                  ) : (
                    <Typography 
                      variant="h6" 
                      color="white"
                      sx={{ 
                        fontWeight: 700,
                        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
                        background: 'rgba(0,0,0,0.4)',
                        padding: '12px 20px',
                        borderRadius: '8px',
                        userSelect: 'none',
                      }}
                    >
                      Swipe along edge to open
                    </Typography>
                  )}
                </PackOverlay>
                
                <PackWrapper>
                  <PackTop
                    variants={packTopVariants}
                    initial="sealed"
                  >
                    <img 
                      src="https://www.serebii.net/tcgpocket/shiningrevelry/booster.jpg"
                      alt="Pack Top"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'top',
                        borderTopLeftRadius: 16,
                        borderTopRightRadius: 16,
                      }}
                      draggable="false"
                    />
                  </PackTop>
                  
                  <PackRest>
                    <img 
                      src="https://www.serebii.net/tcgpocket/shiningrevelry/booster.jpg"
                      alt="Pack Bottom"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'bottom',
                        borderBottomLeftRadius: 16,
                        borderBottomRightRadius: 16,
                      }} 
                      draggable="false"
                    />
                  </PackRest>
                </PackWrapper>
              </PackContainer>
            )}

            {/* Opening Animation */}
            {packState === 'opening' && (
              <Box sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}>
                {/* Pre-position cards - they'll be covered by the pack initially */}
                <Box 
                  sx={{
                    ...CARD_POSITION,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    zIndex: 1 // Ensure they appear OVER the pack bottom once it starts moving
                  }}
                >
                  {cards.length > 0 ? cards.map((card, index) => (
                    <Box
                      key={`opening-card-${card}-${index}`}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        zIndex: cards.length - index,
                        transform: `translateY(${index * 5}px) scale(${1 - (index * 0.02)})`,
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }}
                    >
                      <Card sx={{ width: '100%', height: '100%', overflow: 'hidden' }}>
                        <CardMedia
                          component="img"
                          image={getCardImageUrl(card)}
                          alt={String(card)}
                          sx={{ 
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            objectPosition: 'center'
                          }}
                        />
                      </Card>
                    </Box>
                  )) : (
                    <Typography>Loading cards...</Typography>
                  )}
                </Box>

                {/* Pack on top of cards */}
                <PackContainer
                  variants={packVariants}
                  initial="sealed"
                  animate="opening"
                  style={{
                    width: 300,
                    height: 570,
                    position: 'absolute',
                    zIndex: 2 // Higher than cards initially
                  }}
                >
                  <PackWrapper>
                    <PackTop
                      variants={packTopVariants}
                      initial="sealed"
                      animate="opening"
                      style={{ zIndex: 3 }} // Always on top
                    >
                      <img 
                        src="https://www.serebii.net/tcgpocket/shiningrevelry/booster.jpg" 
                        alt="Pack Top"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          objectPosition: 'top',
                          borderTopLeftRadius: 16,
                          borderTopRightRadius: 16
                        }} 
                        draggable="false"
                      />
                    </PackTop>
                    
                    <PackRest
                      variants={packBottomVariants}
                      initial="sealed"
                      animate="opening"
                      style={{ zIndex: 2 }} // Above cards but below top
                    >
                      <img 
                        src="https://www.serebii.net/tcgpocket/shiningrevelry/booster.jpg" 
                        alt="Pack Bottom"
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          objectPosition: 'bottom',
                          borderBottomLeftRadius: 16,
                          borderBottomRightRadius: 16
                        }} 
                        draggable="false"
                      />
                    </PackRest>
                  </PackWrapper>
                </PackContainer>
              </Box>
            )}

            {/* Opened Pack with Cards */}
            {packState === 'opened' && !showAllCards && !isTransitioning && (
              <Box ref={cardConstraintsRef} sx={{ 
                width: '100%',
                height: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative',
                opacity: isTransitioning ? 0 : 1,
                transition: 'opacity 0.5s ease-out'
              }}>
                <CardStack
                  style={{ 
                    ...CARD_POSITION,
                    width: CARD_WIDTH,
                    height: CARD_HEIGHT,
                    position: 'absolute'
                  }}
                >
                  {/* Stack of cards - render all cards but only topmost is interactive */}
                  {renderCardStack()}
                </CardStack>
                
                {/* Tap instruction - appear with a slight delay, hide when showing new pack button */}
                {cards.length > 0 && !showNewPackButton && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    style={{
                      position: 'absolute',
                      bottom: 20,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      zIndex: 10
                    }}
                  >
                    <Typography variant="body2" sx={{ 
                      color: 'black', 
                      fontWeight: 'bold',
                      bgcolor: 'rgba(255,255,255,0.7)',
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      display: 'inline-block'
                    }}>
                      Tap to continue
                    </Typography>
                  </motion.div>
                )}
                
                {/* Open New Pack button - appears after the last card */}
                {showNewPackButton && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    style={{
                      position: 'absolute',
                      bottom: 40,
                      left: 0,
                      right: 0,
                      textAlign: 'center',
                      zIndex: 10
                    }}
                  >
                    <ActionButton
                      variant="contained"
                      onClick={resetPack}
                      size="medium"
                    >
                      Open Another Pack
                    </ActionButton>
                  </motion.div>
                )}
              </Box>
            )}

            {/* Show all cards grid after finished swiping */}
            {(showAllCards || isTransitioning) && (
              <Stack 
                spacing={3} 
                width="100%" 
                height="100%" 
                justifyContent="center"
                sx={{
                  opacity: isTransitioning ? 0 : 1,
                  transition: 'opacity 0.5s ease-out',
                  position: 'relative'
                }}
              >
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  px: 2,
                  py: 2
                }}>
                  {/* First row - 3 cards */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 2,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}>
                    {cards.slice(0, 3).map((card, index) => (
                      <SingleCard 
                        key={`grid-row1-${card}-${index}`}
                        card={card}
                        width={{ xs: 90, sm: 120, md: 160 }}
                        height={{ xs: 126, sm: 168, md: 224 }}
                        delay={index * 0.1}
                        index={index}
                        getCardImageUrl={getCardImageUrl}
                      />
                    ))}
                  </Box>
                  
                  {/* Second row - 2 cards */}
                  <Box sx={{ 
                    display: 'flex', 
                    justifyContent: 'center',
                    gap: 2,
                    flexWrap: { xs: 'wrap', sm: 'nowrap' }
                  }}>
                    {cards.slice(3, 5).map((card, index) => (
                      <SingleCard 
                        key={`grid-row2-${card}-${index}`}
                        card={card}
                        width={{ xs: 90, sm: 120, md: 160 }}
                        height={{ xs: 126, sm: 168, md: 224 }}
                        delay={(index + 3) * 0.1}
                        index={index + 3}
                        getCardImageUrl={getCardImageUrl}
                      />
                    ))}
                  </Box>
                </Box>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0, width: '100%' }}>
                  <ActionButton
                    variant="contained"
                    onClick={resetPack}
                    size="medium"
                  >
                    Open Another Pack
                  </ActionButton>
                </Box>
              </Stack>
            )}
          </Box>
        </MainContent>
      </AppContainer>
    </AppBackground>
  );
}

export default App;