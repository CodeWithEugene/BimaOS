export interface AiAnalysisResult {
  confidenceScore: number;
  isFraudSuspected: boolean;
  analysis: {
    imageQuality: number;
    damageSeverity: number;
    manipulationDetected: boolean;
    stockImageMatch: boolean;
    geoLocationMatch: boolean;
    timestampConsistency: boolean;
  };
  recommendations: string[];
}

export async function analyzeClaimEvidence(
  imageUrls: string[],
): Promise<AiAnalysisResult> {
  const analysis: AiAnalysisResult = {
    confidenceScore: 0,
    isFraudSuspected: false,
    analysis: {
      imageQuality: 0,
      damageSeverity: 0,
      manipulationDetected: false,
      stockImageMatch: false,
      geoLocationMatch: true,
      timestampConsistency: true,
    },
    recommendations: [],
  };

  for (let i = 0; i < Math.max(imageUrls.length, 1); i++) {
    const imageResult = await analyzeSingleImage();
    analysis.analysis.imageQuality += imageResult.imageQuality;
    analysis.analysis.damageSeverity += imageResult.damageSeverity;
    if (imageResult.manipulationDetected) analysis.analysis.manipulationDetected = true;
    if (imageResult.stockImageMatch) analysis.analysis.stockImageMatch = true;
  }

  if (imageUrls.length > 0) {
    analysis.analysis.imageQuality /= imageUrls.length;
    analysis.analysis.damageSeverity /= imageUrls.length;
  }

  const baseScore =
    analysis.analysis.imageQuality * 0.3 +
    (1 - (analysis.analysis.manipulationDetected ? 0.3 : 0)) * 0.25 +
    (analysis.analysis.geoLocationMatch ? 0.2 : 0) +
    (analysis.analysis.timestampConsistency ? 0.15 : 0) +
    analysis.analysis.damageSeverity * 0.1;

  const fraudPenalty =
    (analysis.analysis.manipulationDetected ? 0.3 : 0) +
    (analysis.analysis.stockImageMatch ? 0.2 : 0);

  analysis.confidenceScore = Math.round(Math.max(0, Math.min(100, baseScore * 100 - fraudPenalty * 100)));

  analysis.isFraudSuspected = fraudPenalty > 0.15 || analysis.confidenceScore < 40;

  if (analysis.confidenceScore >= 90) {
    analysis.recommendations.push('Auto-approve: High confidence match');
  } else if (analysis.confidenceScore >= 60) {
    analysis.recommendations.push('Flag for human review: Medium confidence');
  } else {
    analysis.recommendations.push('Flag for human review: Low confidence');
  }

  if (analysis.analysis.manipulationDetected) {
    analysis.recommendations.push('Image manipulation detected - manual verification required');
  }
  if (analysis.analysis.stockImageMatch) {
    analysis.recommendations.push('Image matches known stock photo - possible fraud');
  }

  return analysis;
}

async function analyzeSingleImage(): Promise<{
  imageQuality: number;
  damageSeverity: number;
  manipulationDetected: boolean;
  stockImageMatch: boolean;
}> {
  await new Promise((r) => setTimeout(r, 100));

  return {
    imageQuality: 0.75 + Math.random() * 0.2,
    damageSeverity: 0.3 + Math.random() * 0.5,
    manipulationDetected: Math.random() < 0.1,
    stockImageMatch: Math.random() < 0.05,
  };
}

export function generateClaimDescription(analysis: AiAnalysisResult): string {
  const parts: string[] = [];
  if (analysis.analysis.damageSeverity > 0.7) parts.push('severe damage detected');
  else if (analysis.analysis.damageSeverity > 0.4) parts.push('moderate damage detected');
  else parts.push('minor damage detected');

  if (analysis.analysis.manipulationDetected) parts.push('possible image manipulation');
  if (analysis.analysis.stockImageMatch) parts.push('stock image match');

  return parts.join(', ') || 'standard claim';
}
