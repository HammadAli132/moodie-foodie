# Foodie Moodie

A warm, mood-driven food recommendation app that helps you decide what to eat based on how you're feeling. Describe your vibe, answer a few questions, and get three curated dish recommendations — complete with foodpanda order links.

---

## Features

- **Mood Input** — Free-text field where you describe your evening, feeling, or craving
- **Follow-up Questions** — Three personalised questions (hunger level, texture preference, spice tolerance) with four selectable options each
- **Recommendation Engine** — Keyword + tag-based matching returns your top 3 dishes from local Islamabad restaurants
- **Dish Cards** — Each pick shows the dish name, restaurant, emotional reason, tags, and a direct foodpanda link
- **Feedback Screen** — 1–5 star rating with optional comment; stores responses in localStorage
- **Animated Background** — Subtle raindrop ambient animation throughout
- **Smooth Transitions** — fadeUp / slideInUp animations between every screen

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Framework  | React 18                            |
| Styling    | CSS Modules + CSS custom properties |
| Typography | Cormorant Garamond + Jost (Google Fonts) |
| Bundler    | Create React App (react-scripts 5)  |
| Data       | Hardcoded mock JSON — no backend    |

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the development server

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

### 3. Build for production

```bash
npm run build
```

---

## Project Structure

```
src/
  components/
    Background.jsx        # Animated raindrop ambient layer
    StepDots.jsx          # Progress indicator in the header
    MoodInput.jsx         # Screen 1 — free-text mood entry
    Questions.jsx         # Screen 2 — three personalisation questions
    DishCard.jsx          # Single recommendation card
    Recommendations.jsx   # Screen 3 — three dish recommendations
    Feedback.jsx          # Screen 4 — star rating + comment
  data/
    mockData.js           # Restaurants, dishes, questions, warm reasons
  utils/
    recommendationEngine.js  # Mood keyword mapping + tag scoring logic
  styles/
    global.css            # Design tokens, reset, keyframe animations
    App.module.css
    Background.module.css
    StepDots.module.css
    MoodScreen.module.css
    QuestionsScreen.module.css
    RecommendationsScreen.module.css
    FeedbackScreen.module.css
  App.jsx                 # Root component — state + screen routing
  index.js                # React DOM entry point
public/
  index.html
```
