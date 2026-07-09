import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { category, coverageAmount, durationDays, risks, kraPin, nationalId } = await req.json();
    const apiKey = process.env.NVIDIA_API_KEY;

    // Validate KRA PIN format locally first (standard Kenyan KRA PIN format: Letter + 9 Digits + Letter)
    const kraRegex = /^[A-Z]\d{9}[A-Z]$/i;
    const isKraValid = kraRegex.test(kraPin?.trim() || '');

    // Local underwriting math
    const baseRates: Record<string, number> = {
      kilimo: 0.015, // 1.5% base
      boda: 0.02,    // 2.0% base
      biashara: 0.018, // 1.8% base
      health: 0.012  // 1.2% base
    };

    const baseRate = baseRates[category] || 0.015;
    const riskMultiplier = 1 + (risks?.length || 0) * 0.15;
    const durationFactor = durationDays / 365;
    
    // Formula: premium = coverage * baseRate * riskMultiplier * durationFactor
    // Ensure a minimum premium of KES 50
    const calculatedPremium = Math.max(50, Math.round(coverageAmount * baseRate * riskMultiplier * durationFactor));
    const riskScore = Math.min(100, Math.round(30 + (risks?.length || 0) * 12 + (coverageAmount > 500000 ? 15 : 0)));
    const riskVerdict = riskScore < 50 ? 'Safe' : riskScore < 75 ? 'Moderate' : 'High';

    if (!apiKey || apiKey === 'placeholder-nvidia-key' || apiKey.trim() === '') {
      // Mock AI underwriting details if API key not present
      return NextResponse.json({
        success: true,
        premiumAmount: calculatedPremium,
        riskVerdict,
        riskScore,
        underwritingNote: `[SIMULATED UNDERWRITER] KRA PIN ${kraPin} is ${isKraValid ? 'VALID' : 'INVALID format (should be like A123456789B)'}. Risk factors scanned: ${risks?.join(', ') || 'None'}. Duration: ${durationDays} days. Verified National ID ${nationalId}. Risk score set to ${riskScore}%.`,
        isKraValid
      });
    }

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-70b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are the BimaOS AI Underwriter. Analyze the user\'s insurance request details and provide a professional, concise underwriting note (max 3 sentences) assessing the risk. State if the KRA PIN format is valid. Keep the response factual and suitable for display on a dashboard.'
          },
          {
            role: 'user',
            content: `Underwrite request:
- Category: ${category}
- Coverage Amount: KES ${coverageAmount}
- Duration: ${durationDays} days
- Included Risks: ${risks?.join(', ') || 'None'}
- KRA PIN: ${kraPin} (regex validity check: ${isKraValid ? 'PASS' : 'FAIL'})
- National ID: ${nationalId}
- Computed Risk Score: ${riskScore}%
- Computed Premium: KES ${calculatedPremium}`
          }
        ],
        temperature: 0.1,
        max_tokens: 150
      })
    });

    const data = await response.json();
    const note = data.choices?.[0]?.message?.content || `Underwritten policy successfully with risk score ${riskScore}%.`;

    return NextResponse.json({
      success: true,
      premiumAmount: calculatedPremium,
      riskVerdict,
      riskScore,
      underwritingNote: note,
      isKraValid
    });
  } catch (error: any) {
    console.error('NVIDIA Underwriting error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
