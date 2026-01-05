import type { DistilledPlan } from '../types';

export const generatePlanWithAI = async (input: string): Promise<DistilledPlan> => {
  try {
    const response = await fetch('/api/distill', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text: input }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle specific error cases
      if (response.status === 413) {
        throw new Error('Input text is too long');
      }
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again later.');
      }
      if (response.status === 405) {
        throw new Error('Method not allowed');
      }
      
      // Generic error
      throw new Error(errorData.error || `API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Validate response structure
    if (!data.sections || !Array.isArray(data.sections)) {
      throw new Error('Invalid response format from server');
    }

    return data as DistilledPlan;
  } catch (error) {
    console.error('AI processing error:', error);
    throw error;
  }
};