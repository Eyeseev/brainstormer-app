import type { DistilledPlan, ActionSection, ActionItem } from '../types';
import { generatePlanWithAI } from './aiService';

export const generatePlan = async (input: string): Promise<DistilledPlan> => {
  // Try AI first, fall back to mock if API key is not set or request fails
  try {
    return await generatePlanWithAI(input);
  } catch (error) {
    console.log('Using mock data generator (AI unavailable):', error);
    return generateMockPlan(input);
  }
};

export const generateMockPlan = (input: string): Promise<DistilledPlan> => {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      const words = input.toLowerCase().split(/\s+/);
      
      // Detect common categories based on keywords
      const sections: ActionSection[] = [];
      
      if (words.some(w => ['work', 'job', 'career', 'project', 'task'].includes(w))) {
        sections.push({
          id: 'work-1',
          title: 'Work & Projects',
          items: [
            { id: 'w1', text: 'Review project timeline and deliverables', completed: false },
            { id: 'w2', text: 'Schedule team sync meeting', completed: false },
            { id: 'w3', text: 'Update project documentation', completed: false },
          ],
        });
      }
      
      if (words.some(w => ['personal', 'life', 'home', 'family'].includes(w))) {
        sections.push({
          id: 'personal-1',
          title: 'Personal',
          items: [
            { id: 'p1', text: 'Plan weekend activities', completed: false },
            { id: 'p2', text: 'Organize home workspace', completed: false },
          ],
        });
      }
      
      if (words.some(w => ['health', 'exercise', 'fitness', 'gym', 'workout'].includes(w))) {
        sections.push({
          id: 'health-1',
          title: 'Health & Wellness',
          items: [
            { id: 'h1', text: 'Schedule gym sessions for the week', completed: false },
            { id: 'h2', text: 'Meal prep for healthy lunches', completed: false },
          ],
        });
      }
      
      if (words.some(w => ['learn', 'study', 'course', 'skill', 'education'].includes(w))) {
        sections.push({
          id: 'learning-1',
          title: 'Learning & Growth',
          items: [
            { id: 'l1', text: 'Complete online course module', completed: false },
            { id: 'l2', text: 'Practice new skill for 30 minutes', completed: false },
          ],
        });
      }
      
      // Default section if no specific categories detected
      if (sections.length === 0) {
        sections.push({
          id: 'general-1',
          title: 'Action Items',
          items: [
            { id: 'g1', text: 'Prioritize and organize tasks', completed: false },
            { id: 'g2', text: 'Break down larger goals into steps', completed: false },
            { id: 'g3', text: 'Set deadlines for key actions', completed: false },
          ],
        });
      }
      
      resolve({ sections });
    }, 1500); // 1.5 second delay to simulate processing
  });
};

export const expandSection = (section: ActionSection): ActionItem[] => {
  // Generate additional suggested actions based on section title
  const suggestions: Record<string, string[]> = {
    'Work & Projects': [
      'Create detailed project roadmap',
      'Identify potential blockers',
      'Set up progress tracking system',
      'Schedule review checkpoint',
    ],
    'Personal': [
      'Update personal calendar',
      'Reach out to friends and family',
      'Plan time for hobbies',
      'Review personal goals',
    ],
    'Health & Wellness': [
      'Track daily water intake',
      'Plan active rest days',
      'Schedule health checkup',
      'Prepare workout playlist',
    ],
    'Learning & Growth': [
      'Find learning resources',
      'Join relevant community',
      'Set learning milestones',
      'Create study schedule',
    ],
    'Action Items': [
      'Review and prioritize',
      'Delegate if possible',
      'Set specific deadlines',
      'Track progress regularly',
    ],
  };
  
  const newItems = (suggestions[section.title] || [
    'Break down into smaller steps',
    'Identify dependencies',
    'Set success criteria',
    'Review and refine',
  ]).map((text, idx) => ({
    id: `${section.id}-expand-${idx}`,
    text,
    completed: false,
  }));
  
  return newItems;
};
