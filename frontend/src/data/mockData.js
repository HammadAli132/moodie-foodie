export const RESTAURANTS = [
  {
    restaurant: "Cheezious",
    link: "https://www.foodpanda.pk/restaurant/v3mx/cheezious-f-10-markaz",
    dishes: [
      { name: "Crown Crust Pizza",  tags: ["comfort", "heavy", "sharing", "cozy", "cheesy"], priceRange: "low" },
      { name: "Behari Roll",        tags: ["spicy", "quick", "savory", "filling"],            priceRange: "low" },
      { name: "Bazinga Burger",     tags: ["filling", "trendy", "savory", "quick"],           priceRange: "low" },
    ],
  },
  {
    restaurant: "McDonald's",
    link: "https://www.foodpanda.pk/restaurant/s4bn/mcdonalds-f-7-markaz",
    dishes: [
      { name: "Big Mac",            tags: ["comfort", "filling", "savory", "classic"],        priceRange: "medium" },
      { name: "McSpicy Burger",     tags: ["spicy", "quick", "savory", "crispy"],             priceRange: "medium" },
      { name: "Chicken McNuggets",  tags: ["quick", "sharing", "comfort", "crispy", "light"], priceRange: "low" },
    ],
  },
  {
    restaurant: "Hotspot",
    link: "https://www.foodpanda.pk/restaurant/v4hs/hotspot",
    dishes: [
      { name: "Chicken Karahi",     tags: ["comfort", "spicy", "cozy", "hearty", "heavy"],   priceRange: "medium" },
      { name: "Seekh Kebab Platter",tags: ["savory", "sharing", "cozy", "classic"],           priceRange: "medium" },
      { name: "Nihari",             tags: ["comfort", "cozy", "heavy", "hearty", "classic"],  priceRange: "low" },
    ],
  },
  {
    restaurant: "Pizza Hut",
    link: "https://www.foodpanda.pk/restaurant/p1zh/pizza-hut",
    dishes: [
      { name: "Stuffed Crust Pizza",tags: ["comfort", "heavy", "sharing", "cozy", "cheesy"], priceRange: "medium" },
      { name: "Chicken Supreme",    tags: ["savory", "filling", "sharing", "classic"],        priceRange: "medium" },
      { name: "Garlic Bread",       tags: ["quick", "comfort", "cozy", "light", "cheesy"],   priceRange: "low" },
    ],
  },
  {
    restaurant: "Nando's",
    link: "https://www.foodpanda.pk/restaurant/nandos",
    dishes: [
      { name: "Peri-Peri Chicken",  tags: ["spicy", "hearty", "savory", "grilled"],          priceRange: "high" },
      { name: "Chicken Wrap",       tags: ["light", "quick", "savory", "spicy"],             priceRange: "medium" },
      { name: "Loaded Fries",       tags: ["comfort", "sharing", "heavy", "cheesy"],         priceRange: "medium" },
    ],
  },
  {
    restaurant: "Kolachi",
    link: "https://www.foodpanda.pk/restaurant/kolachi",
    dishes: [
      { name: "Daal Makhani",       tags: ["comfort", "cozy", "hearty", "classic", "light"], priceRange: "low" },
      { name: "Biryani",            tags: ["heavy", "savory", "classic", "sharing", "cozy"], priceRange: "low" },
      { name: "Haleem",             tags: ["comfort", "cozy", "heavy", "hearty", "classic"], priceRange: "low" },
    ],
  },
];

export const QUESTIONS = [
  {
    question: "How hungry are you feeling right now?",
    options: [
      "Just a small craving",
      "Moderately peckish",
      "Pretty hungry actually",
      "I could eat everything",
    ],
    tagMap: {
      0: ["light", "quick"],
      1: ["light", "savory"],
      2: ["filling", "hearty"],
      3: ["heavy", "filling", "hearty"],
    },
  },
  {
    question: "What texture sounds most comforting tonight?",
    options: [
      "Crispy & crunchy",
      "Soft & pillowy",
      "Rich & saucy",
      "Warm & melty",
    ],
    tagMap: {
      0: ["crispy", "quick"],
      1: ["comfort", "cozy"],
      2: ["cozy", "hearty", "classic"],
      3: ["cheesy", "comfort", "cozy"],
    },
  },
  {
    question: "How spicy do you want it?",
    options: [
      "Mild please, no heat",
      "A gentle warmth",
      "Bring a good kick",
      "The more fire the better",
    ],
    tagMap: {
      0: ["classic", "comfort"],
      1: ["savory", "classic"],
      2: ["spicy"],
      3: ["spicy", "hearty"],
    },
  },
];

export const WARM_REASONS = [
  "Perfect for a cozy night when you just want something warm and satisfying.",
  "Just the right kind of comfort — familiar, filling, and deeply good.",
  "Made for evenings like this one. You'll feel better after every bite.",
];
