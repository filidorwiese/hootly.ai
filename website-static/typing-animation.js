// Typing animation for Hootly.ai website screenshot
(function() {
  'use strict';

  const EXAMPLE_PROMPTS = [
    'Summarize this page',
    'Translate this page to Japanese',
    'Respond professionally to this email',
    'Explain this code',
    'Find key points in these terms and services',
    'Rewrite in simpler terms',
    'Generate reply to this comment',
    'Extract contact info from this page',
    'Compare prices on this page',
    'Draft a summary for my notes'
  ];

  const TYPING_SPEED = 50;  // ms per character
  const DELAY_BETWEEN_PROMPTS = 5000;  // 5 seconds
  const CURSOR_BLINK_RATE = 530;  // ms

  let currentPromptIndex = 0;
  let cursorVisible = true;
  let cursorInterval = null;

  function shuffleArray(arr) {
    const shuffled = [...arr];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  function createCursor() {
    return '<span class="typing-cursor">|</span>';
  }

  function typeText(element, text, callback) {
    let charIndex = 0;

    function typeChar() {
      if (charIndex < text.length) {
        const displayText = text.substring(0, charIndex + 1);
        element.innerHTML = displayText + createCursor();
        charIndex++;
        setTimeout(typeChar, TYPING_SPEED);
      } else {
        if (callback) callback();
      }
    }

    typeChar();
  }

  function clearText(element, callback) {
    element.innerHTML = createCursor();
    if (callback) setTimeout(callback, 200);
  }

  function startCursorBlink(element) {
    if (cursorInterval) clearInterval(cursorInterval);

    cursorInterval = setInterval(function() {
      const cursor = element.querySelector('.typing-cursor');
      if (cursor) {
        cursorVisible = !cursorVisible;
        cursor.style.opacity = cursorVisible ? '1' : '0';
      }
    }, CURSOR_BLINK_RATE);
  }

  function runTypingAnimation(element, prompts) {
    function typeNextPrompt() {
      const prompt = prompts[currentPromptIndex];

      typeText(element, prompt, function() {
        setTimeout(function() {
          clearText(element, function() {
            currentPromptIndex = (currentPromptIndex + 1) % prompts.length;
            typeNextPrompt();
          });
        }, DELAY_BETWEEN_PROMPTS);
      });
    }

    element.innerHTML = createCursor();
    startCursorBlink(element);
    typeNextPrompt();
  }

  function init() {
    const overlay = document.getElementById('typing-overlay');
    if (!overlay) return;

    const screenshot = document.querySelector('.hero-screenshot');
    if (!screenshot) return;

    // Wait for screenshot to load before starting animation
    if (screenshot.complete) {
      startAnimation();
    } else {
      screenshot.addEventListener('load', startAnimation);
      screenshot.addEventListener('error', function() {
        overlay.style.display = 'none';
      });
    }

    function startAnimation() {
      const shuffledPrompts = shuffleArray(EXAMPLE_PROMPTS);
      runTypingAnimation(overlay, shuffledPrompts);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
