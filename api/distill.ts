import type { VercelRequest, VercelResponse } from '@vercel/node';

// Cost control: hard-locked to cheapest flagship model
const MODEL = 'gpt-4o-mini';

// Runtime validation guardrail
if (MODEL !== 'gpt-4o-mini') {
  throw new Error('Cost control violation: model must be gpt-4o-mini');
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Rate limiting: in-memory Map (resets on function restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_REQUESTS = 10; // requests per window
const RATE_LIMIT_WINDOW = 60000; // 60 seconds
const MAX_TEXT_LENGTH = 20000; // characters

interface RequestBody {
  text: string;
  model?: never; // Explicitly ignore client-provided model
}

interface OpenAIResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
}

interface DistilledPlan {
  sections: Array<{
    id: string;
    title: string;
    items: Array<{
      id: string;
      text: string;
      completed: boolean;
    }>;
  }>;
}

function getClientIP(req: VercelRequest): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    (req.headers['x-real-ip'] as string) ||
    req.socket?.remoteAddress ||
    'unknown'
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Check API key
  if (!OPENAI_API_KEY) {
    res.status(500).json({ error: 'OpenAI API key not configured' });
    return;
  }

  // Parse request body
  let body: RequestBody;
  try {
    body = req.body as RequestBody;
  } catch (error) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  if (!body.text || typeof body.text !== 'string') {
    res.status(400).json({ error: 'Missing or invalid text field' });
    return;
  }

  // Enforce size limit
  if (body.text.length > MAX_TEXT_LENGTH) {
    res.status(413).json({ 
      error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` 
    });
    return;
  }

  // Rate limiting
  const ip = getClientIP(req);
  if (!checkRateLimit(ip)) {
    res.status(429).json({ error: 'Rate limit exceeded. Please try again later.' });
    return;
  }

  // Ensure model is still hard-locked (defensive check)
  if (MODEL !== 'gpt-4o-mini') {
    const error = new Error('Cost control violation: model must be gpt-4o-mini');
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }

  const prompt = `You are a productivity assistant. Analyze the following brain dump and extract actionable tasks, organizing them into logical categories with descriptive section titles.

Brain dump:
${body.text}

Return ONLY a valid JSON object in this exact format (no markdown, no code blocks, just the raw JSON):
{
  "sections": [
    {
      "title": "Section Name",
      "bullets": [
        "Action item 1",
        "Action item 2",
        "Action item 3"
      ]
    }
  ]
}

Guidelines:
- Extract key ideas from the input
- For each idea: create 3-5 concise practical bullets (minimum 3)
- Create 2-5 sections based on natural categories in the content
- Make items clear and actionable (start with verbs when appropriate)
- Organize related tasks together
- No commentary, no prose outside JSON
- If the input is very short or unclear, still create at least one section with reasonable action items`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL, // Hard-locked model
        messages: [
          {
            role: 'system',
            content: 'You are a helpful productivity assistant that extracts actionable tasks from brain dumps. Always return valid JSON only, no markdown, no code blocks.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.6,
        max_tokens: 700, // Conservative limit
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI API error:', response.status, errorData);
      res.status(500).json({ error: 'AI processing failed' });
      return;
    }

    const data: OpenAIResponse = await response.json();
    const content = data.choices[0]?.message?.content?.trim();

    if (!content) {
      res.status(500).json({ error: 'No response from AI' });
      return;
    }

    // Try to extract JSON from the response (in case it's wrapped in markdown)
    let jsonString = content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonString = jsonMatch[0];
    }

    let parsed: { sections: Array<{ title: string; bullets: string[] }> };
    try {
      parsed = JSON.parse(jsonString);
    } catch (error) {
      console.error('Failed to parse AI response as JSON:', error);
      // Return safe fallback
      res.status(500).json({ 
        error: 'Invalid response format',
        fallback: {
          sections: [{
            id: 'error-1',
            title: 'Processing Error',
            items: [{
              id: 'error-item-1',
              text: 'Unable to process input. Please try again.',
              completed: false,
            }],
          }],
        },
      });
      return;
    }

    // Validate response structure
    if (!parsed.sections || !Array.isArray(parsed.sections)) {
      res.status(500).json({ error: 'Invalid response structure' });
      return;
    }

    // Convert to our format (bullets -> items)
    const sections: DistilledPlan['sections'] = parsed.sections.map((section, sectionIndex) => ({
      id: `section-${sectionIndex + 1}-${Date.now()}`,
      title: section.title || `Section ${sectionIndex + 1}`,
      items: (section.bullets || []).map((item, itemIndex) => ({
        id: `item-${sectionIndex}-${itemIndex}-${Date.now()}`,
        text: item,
        completed: false,
      })),
    }));

    // Ensure we have at least one section with items
    if (sections.length === 0 || sections.every(s => s.items.length === 0)) {
      sections.push({
        id: 'fallback-1',
        title: 'Action Items',
        items: [{
          id: 'fallback-item-1',
          text: 'Review and organize the input',
          completed: false,
        }],
      });
    }

    res.status(200).json({ sections });
  } catch (error) {
    console.error('AI processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
