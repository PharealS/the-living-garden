/**
 * ====================================================================
 *   THE LIVING GARDEN - CONFIGURATION
 * ====================================================================
 * 
 * Personalize your birthday gift here!
 * Change the names, date, message paragraphs, and custom initials.
 * All changes here will immediately reflect in the garden experience.
 */

const GARDEN_CONFIG = {
  // --- Personal Information ---
  recipientName: "Ara",                 // Her name
  senderName: "Atharv",                // Your name
  initials: "A + A",                   // Inscribed subtly into the Great Tree
  specialDate: "August 7, 2027",       // Special date or birthday
  birthdayTargetDate: "2027-08-07T00:00:00", // Countdown unlock date (August 7, 2027)

  // --- Poetic Environmental Prompts ---
  // (Fades in softly at dusk, disappears naturally as she explores)
  introHint: "Take a look around, some things are worth touching, like Atharv for instance, but also other things, like lanterns and windchimes. Maybe pick up a flower pot and water some plants. Perhaps you'll witness a surprise.",

  // --- Final Letter / Birthday Note ---
  // Appears after the Great Transformation inside the heart of the garden.
  letterHeading: "To the Love of my Life.",
  letterParagraphs: [
    "Happy Birthday Ara!! I'm writing this while I'm in 9th, on the date of... lemme see, 11 October 2026, at 12:45 am. You're in 10th now, and I'm sure I still love you then just as much as I love you right now. (I hope we get good marks in Boards...)",
    "Ahem, anyways—I wanted to create a small corner of the world just for you, somewhere quiet, peaceful, and full of life.",
    "Thank you for being my favourite person to talk to, my favourite person to dream with, and the best part of my day. I love you.",
    "I hope this year gives you all the happiness, wonder, and gentle magic you give to everyone around you, including me. You're even more beautiful than this magical garden."
  ],
  letterClosing: "Forever yours,",
  letterSignature: "Atharv",

  // --- Secret Details ---
  secretConstellationName: "The Heart Flower",
  treeCarvingText: "A + A ♡",

  // --- Experience Tuning ---
  musicVolume: 0.65,                   // Ambient soundtrack volume (0.0 to 1.0)
  sfxVolume: 0.75,                     // Sound effects volume (0.0 to 1.0)
  enableNightCicadas: true             // Subtle ambient crickets/cicadas at dusk
};

// Export to window for global access
if (typeof window !== "undefined") {
  window.GARDEN_CONFIG = GARDEN_CONFIG;
}
