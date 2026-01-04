import { useEffect, useRef } from "react";
import { useExperienceSettings } from "@/contexts/ExperienceSettingsContext";

/**
 * Hook to add hover sound effects to interactive elements
 */
export const useHoverSound = () => {
  const { settings } = useExperienceSettings();
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    if (!settings.backgroundMusicEnabled) return;

    // Initialize AudioContext on first user interaction
    const initAudioContext = () => {
      if (!audioContextRef.current) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          audioContextRef.current = new AudioContextClass();
        }
      }
    };

    // Play subtle hover sound
    const playHoverSound = () => {
      if (!audioContextRef.current) return;
      
      try {
        const ctx = audioContextRef.current;
        if (ctx.state === 'suspended') {
          ctx.resume();
        }

        // Create a short, subtle "tick" sound
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        
        // High frequency tick sound
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        // Very short envelope
        const now = ctx.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(0.05, now + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        
        oscillator.start(now);
        oscillator.stop(now + 0.08);
      } catch (error) {
        console.warn('Hover sound failed:', error);
      }
    };

    // Add hover listeners to interactive elements
    const addHoverListeners = () => {
      initAudioContext();
      
      const selectors = [
        'button',
        'a',
        '.card',
        '[role="button"]',
        'input',
        'select',
        'textarea',
        '.hover-sound' // Custom class for elements that should have sound
      ].join(', ');

      const elements = document.querySelectorAll(selectors);
      
      elements.forEach((element) => {
        element.addEventListener('mouseenter', playHoverSound, { passive: true });
      });

      return () => {
        elements.forEach((element) => {
          element.removeEventListener('mouseenter', playHoverSound);
        });
      };
    };

    // Initialize after a short delay to ensure DOM is ready
    const timeoutId = setTimeout(addHoverListeners, 100);
    
    // Re-add listeners when DOM changes (for dynamically added elements)
    const observer = new MutationObserver(() => {
      addHoverListeners();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [settings.backgroundMusicEnabled]);
};
