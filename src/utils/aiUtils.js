// Mock OpenAI client for testing
const mockOpenAI = {
  chat: {
    completions: {
      create: async () => {
        return {
          choices: [
            {
              message: {
                content: JSON.stringify({
                  category: 'Groceries',
                  confidence: 0.95
                })
              }
            }
          ]
        };
      }
    }
  }
};

export const openai = mockOpenAI;

export async function categorizeTransaction(description) {
  try {
    console.log('Categorizing transaction:', description);
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a financial transaction categorizer. Return only JSON with category and confidence."
        },
        {
          role: "user",
          content: `Categorize this transaction: ${description}`
        }
      ]
    });

    const result = JSON.parse(response.choices[0].message.content);
    console.log('Categorization result:', result);
    return result;
  } catch (error) {
    console.error('Error categorizing transaction:', error);
    // Return a default category for testing
    return {
      category: 'Uncategorized',
      confidence: 0.0
    };
  }
} 