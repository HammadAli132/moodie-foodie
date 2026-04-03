import { RESTAURANTS, QUESTIONS } from '../data/mockData';

/**
 * Map mood text keywords to tags.
 * Scans the user's free-text mood for trigger words and adds matching tags.
 */
export function getMoodTags(moodText) {
  const text = moodText.toLowerCase();
  const tags = new Set();

  const keywordMap = {
    comfort:  ['comfort', 'cozy', 'warm', 'hug', 'safe', 'home', 'blanket', 'snuggle', 'snug'],
    spicy:    ['spicy', 'fire', 'kick', 'heat', 'hot', 'burn'],
    light:    ['light', 'small', 'snack', 'little', 'quick'],
    heavy:    ['hungry', 'starving', 'everything', 'big', 'heavy', 'feast'],
    cheesy:   ['cheese', 'cheesy', 'melty', 'gooey'],
    crispy:   ['crispy', 'crunchy', 'crunch', 'fried'],
    classic:  ['classic', 'traditional', 'old', 'nostalgic'],
    hearty:   ['hearty', 'filling', 'substantial', 'satisfying'],
    sharing:  ['share', 'sharing', 'together', 'friends', 'family'],
    savory:   ['savory', 'salty', 'umami', 'meaty'],
  };

  for (const [tag, triggers] of Object.entries(keywordMap)) {
    if (triggers.some((kw) => text.includes(kw))) {
      tags.add(tag);
    }
  }

  // Always seed with comfort + cozy as emotional defaults
  tags.add('comfort');
  tags.add('cozy');

  return tags;
}

/**
 * Build a combined tag set from mood text + question answers,
 * then score and return the top 3 dishes.
 */
export function getRecommendations(moodText, answers) {
  const wantedTags = getMoodTags(moodText);

  answers.forEach((answerIndex, questionIndex) => {
    if (answerIndex === null) return;
    const tags = QUESTIONS[questionIndex].tagMap[answerIndex] || [];
    tags.forEach((t) => wantedTags.add(t));
  });

  const scored = [];
  RESTAURANTS.forEach((r) => {
    r.dishes.forEach((d) => {
      const score = d.tags.filter((t) => wantedTags.has(t)).length;
      scored.push({ ...d, restaurant: r.restaurant, link: r.link, score });
    });
  });

  scored.sort((a, b) => b.score - a.score);

  const seen = new Set();
  const picks = [];
  for (const item of scored) {
    if (!seen.has(item.name) && picks.length < 3) {
      seen.add(item.name);
      picks.push(item);
    }
  }

  return picks;
}
