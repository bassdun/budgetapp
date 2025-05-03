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

export default mockOpenAI; 