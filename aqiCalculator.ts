export interface HealthAdvice {
  level: string;
  color: string;
  advice: string;
  maskRequired: boolean;
}

export const getHealthAdvice = (aqi: number): HealthAdvice => {
  if (aqi <= 50) {
    return {
      level: 'Good',
      color: '#10b981',
      advice: 'Air quality is satisfactory. Enjoy outdoor activities.',
      maskRequired: false
    };
  } else if (aqi <= 100) {
    return {
      level: 'Moderate',
      color: '#fbbf24',
      advice: 'Sensitive individuals should limit prolonged outdoor exertion.',
      maskRequired: false
    };
  } else if (aqi <= 200) {
    return {
      level: 'Unhealthy',
      color: '#f97316',
      advice: 'Everyone should begin to limit outdoor activities. Wear a mask if outside.',
      maskRequired: true
    };
  } else if (aqi <= 300) {
    return {
      level: 'Very Unhealthy',
      color: '#ef4444',
      advice: 'Avoid outdoor activities. Use air purifiers indoors.',
      maskRequired: true
    };
  } else {
    return {
      level: 'Hazardous',
      color: '#7f1d1d',
      advice: 'Serious health alert! Remain indoors with windows closed.',
      maskRequired: true
    };
  }
};
