export interface UssdResponse {
  message: string;
  type: 'CON' | 'END';
}

export function buildUssdMenu(text: string): UssdResponse {
  const parts = text ? text.split('*') : [];
  const step = parts.length;

  if (text === '' || step === 0) {
    return {
      type: 'CON',
      message: `Welcome to BimaOS - Insurance for Every African

1. Buy Micro-Insurance
2. File active Claim
3. View My Policies
4. Learn About Insurance`,
    };
  }

  const mainOption = parts[0];

  if (mainOption === '1') {
    return handleBuyInsurance(parts);
  } else if (mainOption === '2') {
    return handleFileClaim(parts);
  } else if (mainOption === '3') {
    return handleMyPolicies();
  } else if (mainOption === '4') {
    return handleEducation(parts);
  }

  return {
    type: 'END',
    message: 'Invalid option. Please try again.',
  };
}

const categories = {
  '1': { id: 'kilimo', name: '🌾 Kilimo Shield', desc: 'Parametric Crop Cover' },
  '2': { id: 'boda', name: '🏍️ Boda & Motor', desc: 'Rider Vehicle Cover' },
  '3': { id: 'biashara', name: '🏪 Biashara Cover', desc: 'Market Trader Cover' },
  '4': { id: 'health', name: '🩺 Afya Care', desc: 'Health & Life Cover' }
};

const plansMap: Record<string, Record<string, { name: string; premium: number }>> = {
  '1': {
    '1': { name: 'Crop Guard Basic', premium: 150 },
    '2': { name: 'Weather-Indexed Plus', premium: 450 },
    '3': { name: 'Parametric Shield', premium: 1200 }
  },
  '2': {
    '1': { name: 'Boda Daily', premium: 20 },
    '2': { name: 'Rider Commuter', premium: 100 },
    '3': { name: 'Comprehensive Motor', premium: 500 }
  },
  '3': {
    '1': { name: 'Mama Mboga Daily', premium: 30 },
    '2': { name: 'Market Stall Standard', premium: 150 },
    '3': { name: 'Retail Shop Secure', premium: 800 }
  },
  '4': {
    '1': { name: 'Bima Afya Basic', premium: 50 },
    '2': { name: 'Sacco Health Cover', premium: 200 },
    '3': { name: 'Afya Family Shield', premium: 600 }
  }
};

function handleBuyInsurance(parts: string[]): UssdResponse {
  const step = parts.length;

  if (step === 1) {
    return {
      type: 'CON',
      message: `Select Cover Category:

1. Kilimo Shield (Agriculture)
2. Boda & Motor (Vehicle)
3. Biashara Cover (Micro-Retail)
4. Afya Care (Health & Life)`,
    };
  }

  const categoryIndex = parts[1];
  const category = categories[categoryIndex as keyof typeof categories];
  if (!category) {
    return { type: 'END', message: 'Invalid category. Please try again.' };
  }

  if (step === 2) {
    const plans = plansMap[categoryIndex];
    if (!plans) return { type: 'END', message: 'Invalid category mapping.' };
    return {
      type: 'CON',
      message: `Select Plan in ${category.name}:

1. ${plans['1'].name} - KES ${plans['1'].premium}
2. ${plans['2'].name} - KES ${plans['2'].premium}
3. ${plans['3'].name} - KES ${plans['3'].premium}`,
    };
  }

  const planIndex = parts[2];
  const plans = plansMap[categoryIndex];
  const plan = plans?.[planIndex];
  if (!plan) {
    return { type: 'END', message: 'Invalid plan selection.' };
  }

  if (step === 3) {
    return {
      type: 'CON',
      message: `${plan.name} (${category.name})
Premium: KES ${plan.premium}

1. Confirm Purchase via M-Pesa
2. Cancel`,
    };
  }

  if (step === 4 && parts[3] === '1') {
    const policyRef = `BOS${Date.now().toString(36).toUpperCase()}`;
    return {
      type: 'END',
      message: `✅ Purchase Initiated!

Policy: ${policyRef}
Type: ${plan.name}
Amount: KES ${plan.premium}

Check your phone for M-Pesa PIN prompt. You will receive an SMS confirmation.`,
    };
  }

  return { type: 'END', message: 'Purchase cancelled.' };
}

function handleFileClaim(parts: string[]): UssdResponse {
  const step = parts.length;

  if (step === 1) {
    return {
      type: 'CON',
      message: 'Enter your policy number or phone number:',
    };
  }

  if (step === 2) {
    return {
      type: 'CON',
      message: `Describe what happened (max 160 chars):

Example: "Hit by another boda on Kenyatta Ave"`,
    };
  }

  if (step === 3) {
    const claimRef = `CLM${Date.now().toString(36).toUpperCase()}`;
    return {
      type: 'END',
      message: `✅ Claim Registered!

Reference: ${claimRef}

You will receive an SMS with a link to upload photos, ID, and KRA certificate for AI processing.`,
    };
  }

  return { type: 'END', message: 'Claim filing error. Please try again.' };
}

function handleMyPolicies(): UssdResponse {
  return {
    type: 'END',
    message: `📋 Policy Status:

To check your policy details and claim history, please visit:
bima-os.vercel.app/client

Or reply with your phone number for an SMS update.`,
  };
}

function handleEducation(parts: string[]): UssdResponse {
  const step = parts.length;

  if (step === 1) {
    return {
      type: 'CON',
      message: `Select Topic:

1. What is Insurance?
2. How to File a Claim?
3. Understanding Premiums
4. Insurance Tips`,
    };
  }

  const topic = parts[1];
  const educationalContent: Record<string, string> = {
    '1': `📖 Insurance is a way to protect yourself from unexpected financial loss. You pay a small amount (premium) regularly, and the insurer covers you when something goes wrong - like an accident, illness, or crop failure.`,
    '2': `📋 To file a claim:

1. Dial *384*11400# on your phone
2. Select "File a Claim"
3. Enter your policy number
4. Describe what happened
5. Upload photos via the SMS link you receive

Your claim will be processed within 24 hours.`,
    '3': `💰 A premium is the amount you pay for insurance coverage.

Daily premiums start from as low as KES 20 - less than the price of a soda!

You can pay daily, weekly, or per season via M-Pesa.`,
    '4': `💡 Insurance Tips:

• Always keep your policy number handy
• Take photos immediately after an incident
• Report claims within 24 hours
• Update your details if you change phone numbers
• Review your coverage regularly`,
  };

  const content = educationalContent[topic];
  if (!content) {
    return { type: 'END', message: 'Thank you for using BimaOS. Stay protected!' };
  }

  return {
    type: 'END',
    message: content,
  };
}

export function extractPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.startsWith('+254')) return phoneNumber;
  if (phoneNumber.startsWith('0')) return '+254' + phoneNumber.slice(1);
  if (phoneNumber.startsWith('254')) return '+' + phoneNumber;
  return '+254' + phoneNumber;
}
