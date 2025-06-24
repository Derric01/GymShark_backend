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
    
    // Rate limiting protection
    this.lastRequest = 0;
    this.minInterval = 2000; // 2 seconds between requests
    this.cache = new Map(); // Simple caching
  }

  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequest;
    if (timeSinceLastRequest < this.minInterval) {
      await this.delay(this.minInterval - timeSinceLastRequest);
    }
    this.lastRequest = Date.now();
  }

  async getFitnessTips(userProfile, specificRequest = null, retries = 3) {
    if (!this.model) {
      return {
        success: false,
        message: 'AI service is not available. Please configure Gemini API key.',
        tips: this.getFallbackTips(userProfile.goal || 'general')
      };
    }

    // Check cache first
    const cacheKey = `${userProfile.goal}-${userProfile.experience}-${specificRequest}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 3600000) { // 1 hour cache
        return cached.data;
      }
    }

    try {
      await this.rateLimit();
      
      // Simplified, shorter prompt
      const prompt = this.buildSimplePrompt(userProfile, specificRequest);
      
      for (let attempt = 0; attempt < retries; attempt++) {
        try {
          const result = await this.model.generateContent(prompt);
          const response = await result.response;
          const text = response.text();

          const successResponse = {
            success: true,
            tips: this.parseResponseSimple(text),
            timestamp: new Date().toISOString()
          };

          // Cache the response
          this.cache.set(cacheKey, {
            data: successResponse,
            timestamp: Date.now()
          });

          return successResponse;
        } catch (error) {
          console.error(`Gemini API attempt ${attempt + 1} failed:`, error.message);
          
          if (attempt === retries - 1) {
            throw error;
          }
          
          // Exponential backoff
          await this.delay(Math.pow(2, attempt) * 1000);
        }
      }
    } catch (error) {
      console.error('Gemini API error:', error);
      
      return {
        success: false,
        message: 'AI tips temporarily unavailable. Using expert recommendations.',
        tips: this.getFallbackTips(userProfile.goal || 'general')
      };
    }
  }

  buildSimplePrompt(userProfile, specificRequest) {
    const goal = userProfile.goal || 'general fitness';
    const experience = userProfile.experience || 'beginner';
    
    let prompt = `Give 3 concise fitness tips for ${goal} (${experience} level). Format as: 1. tip 2. tip 3. tip`;
    
    if (specificRequest) {
      prompt += ` Focus on: ${specificRequest}`;
    }
    
    return prompt;
  }

  parseResponseSimple(text) {
    // Much simpler parsing - just split by numbers
    const tips = [];
    const lines = text.split(/[.\n]/).filter(line => line.trim());
    
    for (let line of lines) {
      line = line.trim();
      // Remove numbering and clean up
      line = line.replace(/^\d+\.\s*/, '').replace(/^[•\-\*]\s*/, '').trim();
      
      if (line.length > 15 && line.length < 150) {
        tips.push(line);
        if (tips.length >= 3) break;
      }
    }
    
    return tips.length > 0 ? tips : this.getFallbackTips('general');
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
