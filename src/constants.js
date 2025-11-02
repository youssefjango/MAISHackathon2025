export const questions = [
  {
    id: 0,
    text: "What is the allowed size format for your cheatsheet?",
    restrictionPreffix: "The size of each page should be of the format of one ", // what precedes the options chosen in the restriction string
    restrictionSuffix: ".", // what follows the options chosen in the restriction string
    options: ["A4(8.27 × 11.69 in)", "Letter (8.5 × 11 in)", "Half-sheet Letter (8.5 × 5.5 in)", "Index Card (3 × 5 in)"],
    maxSelections: 1,
  },
  {
    id: 1,
    text: "What is the exact number of pages for your cheatsheet?",
    restrictionPreffix: "There should be ",
    restrictionSuffix: " exactly allowed.",
    options: ["1 page", "2 pages", "3 pages", "4 pages", "no limit"],
    maxSelections: 1,
  },
  {
    id: 2,
    text: "What content should be prioritized in your cheatsheet?",
    restrictionPreffix: "The content should be prioritized in the cheatsheet should be ",
    restrictionSuffix: ".",
    options: ["key concepts", "examples", "explanations", "formulas", "diagrams", "solutions to exercices"],
    maxSelections: 3,
  },
  {
    id: 3,
    text: "Which of these would make your sheet more comfortable to use?",
    restrictionPreffix: "The following features of the crib sheet should make the sheet more comfortable to use, and should be prioritized: ",
    restrictionSuffix: ".",
    options: ["Lots of white space and clear sections", "Compact, dense information in small text", "Color-coding or highlighting key parts", "Example problems with annotations"],
    maxSelections: 2,
  },
  {
    id: 4,
    text: "Which layout style do you prefer?",
    restrictionPreffix: "The overall layout style should be ",
    restrictionSuffix: ".",
    options: ["Structured boxes or tables", "Free-form notes and sketches", "Hierarchical outline (headings and subpoints)"],
    maxSelections: 1,
  },
  {
    id: 5,
    text: "How large should your writing be to stay readable under pressure?",
    restrictionPreffix: "The font size used in the cheatsheet should be in the ",
    restrictionSuffix: " range to ensure readability and efficiency.",
    options: ["Small (8-10 pt)", "Medium (11-12 pt)", "Large (13-16 pt)"],
    maxSelections: 1,
  }
];