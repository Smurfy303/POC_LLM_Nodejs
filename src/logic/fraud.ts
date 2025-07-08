

export function calculateFraudRisk(amount: number, email: string): number {
    let score = 0.1;
  
    if (amount > 1000) score += 0.4;
  
    const suspiciousDomains = ['.ru', '.cn', 'test.com'];
    const domain = email.split('@')[1] || '';
  
    if (suspiciousDomains.some(suffix => domain.endsWith(suffix))) {
      score += 0.4;
    }
  
    const noise = (Math.random() * 0.2) - 0.1;
    return Math.min(Math.max(score + noise, 0), 1);
  }
  
