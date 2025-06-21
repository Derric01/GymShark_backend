 const { GoogleGenerativeAI } = require('@google/generative-ai');

class GeminiClient {
  constructor() {
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      console.warn('⚠️  Gemini API key not configured. AI features will be disabled.');
      this.genAI = null;
      this.model = null;
    } else {
      this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async getFitnessTips(userProfile, specificRequest = null) {
    if (!this.model) {
      return {
        success: false,
        message: 'AI service is not available. Please configure Gemini API key.',
        tips: [
          'Stay hydrated throughout the day',
          'Get adequate sleep (7-9 hours)',
          'Focus on compound exercises',
          'Maintain consistency in your routine'
        ]
      };
    }

    try {
      const prompt = this.buildFitnessPrompt(userProfile, specificRequest);
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        tips: this.parseResponse(text),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Gemini API error:', error);
      
      return {
        success: false,
        message: 'Unable to generate AI tips at this time',
        tips: this.getFallbackTips(userProfile.goal)
      };
    }
  }

  buildFitnessPrompt(userProfile, specificRequest) {
    const basePrompt = `
You are a professional fitness and nutrition advisor. Provide personalized advice for:

User Profile:
- Age: ${userProfile.age}
- Gender: ${userProfile.gender}
- Height: ${userProfile.height}cm
- Weight: ${userProfile.weight}kg
- Fitness Goal: ${userProfile.goal}
- BMI: ${userProfile.bmi || 'Not calculated'}

${specificRequest ? `Specific Request: ${specificRequest}` : ''}

Please provide 5-7 specific, actionable tips focusing on:
1. Exercise recommendations
2. Nutrition advice
3. Recovery and lifestyle
4. Goal-specific strategies

Format your response as numbered points (1., 2., 3., etc.) with each tip on a new line.
Keep each tip concise but informative (2-3 sentences max).
Focus on practical, achievable advice.
    `.trim();

    return basePrompt;
  }

  parseResponse(text) {
    // Split response into individual tips
    const lines = text.split('\n').filter(line => line.trim());
    const tips = [];

    for (const line of lines) {
      const trimmed = line.trim();
      // Look for numbered points or bullet points
      if (trimmed.match(/^\d+\./) || trimmed.match(/^[•\-\*]/) || (trimmed.length > 20 && !tips.includes(trimmed))) {
        // Clean up the tip text
        const cleanTip = trimmed.replace(/^\d+\.\s*/, '').replace(/^[•\-\*]\s*/, '').trim();
        if (cleanTip.length > 10) {
          tips.push(cleanTip);
        }
      }
    }

    // If parsing failed, return the full text split by sentences
    if (tips.length === 0) {
      return text.split('.').filter(sentence => sentence.trim().length > 20).slice(0, 7);
    }

    return tips.slice(0, 7); // Limit to 7 tips
  }

  getFallbackTips(goal) {
    const tipsByGoal = {
      'weight loss': [
        'Create a moderate caloric deficit of 300-500 calories per day',
        'Focus on high-protein foods to maintain muscle mass',
        'Incorporate both cardio and strength training',
        'Stay hydrated and drink water before meals',
        'Get adequate sleep to regulate hunger hormones'
      ],
      'muscle gain': [
        'Eat in a slight caloric surplus with adequate protein',
        'Focus on compound exercises like squats, deadlifts, and bench press',
        'Progressive overload is key - gradually increase weight or reps',
        'Allow proper rest between training sessions',
        'Consume protein within 30 minutes post-workout'
      ],
      'maintenance': [
        'Maintain a balanced diet with all macronutrients',
        'Mix different types of exercise for overall fitness',
        'Focus on consistency rather than intensity',
        'Listen to your body and adjust as needed',
        'Regular health check-ups and assessments'
      ]
    };

    return tipsByGoal[goal] || tipsByGoal['maintenance'];
  }

  async getDietAdvice(userProfile, dietGoal) {
    if (!this.model) {
      return {
        success: false,
        message: 'AI service is not available',
        advice: this.getFallbackDietAdvice(dietGoal)
      };
    }

    try {
      const prompt = `
Provide specific dietary advice for a ${userProfile.age}-year-old ${userProfile.gender} 
with goal: ${dietGoal}. Current weight: ${userProfile.weight}kg, Height: ${userProfile.height}cm.

Focus on:
1. Macronutrient distribution
2. Meal timing
3. Food choices
4. Hydration
5. Supplements (if needed)

Provide practical, actionable advice in 5 key points.
      `.trim();

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        advice: this.parseResponse(text)
      };
    } catch (error) {
      console.error('Gemini diet advice error:', error);
      return {
        success: false,
        message: 'Unable to generate diet advice',
        advice: this.getFallbackDietAdvice(dietGoal)
      };
    }
  }

  getFallbackDietAdvice(goal) {
    const adviceByGoal = {
      'weight loss': [
        'Reduce portion sizes and eat slowly',
        'Choose lean proteins and fiber-rich foods',
        'Limit processed foods and sugary drinks',
        'Plan meals in advance to avoid impulse eating'
      ],
      'muscle gain': [
        'Increase protein intake to 1.6-2.2g per kg body weight',
        'Eat frequent meals throughout the day',
        'Include complex carbohydrates around workouts',
        'Don\'t forget healthy fats for hormone production'
      ],
      'maintenance': [
        'Follow the 80/20 rule - healthy choices 80% of the time',
        'Include variety in your diet for all nutrients',
        'Stay consistent with meal timing',
        'Monitor your energy levels and adjust accordingly'
      ]
    };

    return adviceByGoal[goal] || adviceByGoal['maintenance'];
  }
}

module.exports = new GeminiClient();
