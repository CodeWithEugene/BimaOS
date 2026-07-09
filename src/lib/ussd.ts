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

1. Buy Insurance
2. File a Claim
3. My Policies
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

function handleBuyInsurance(parts: string[]): UssdResponse {
  const step = parts.length;

  if (step === 1) {
    return {
      type: 'CON',
      message: `Select Cover Type:

1. Daily Boda Cover - KES 20/day
2. Daily Market Cover - KES 30/day
3. Seasonal Crop Cover - KES 150/season
4. Health Cover - KES 50/day
5. SME Fire Cover - KES 100/day
6. Life Cover - KES 40/day`,
    };
  }

  const productIndex = parseInt(parts[1]);
  const products: Record<number, { name: string; premium: number }> = {
    1: { name: 'Daily Boda Cover', premium: 20 },
    2: { name: 'Daily Market Cover', premium: 30 },
    3: { name: 'Seasonal Crop Cover', premium: 150 },
    4: { name: 'Health Cover', premium: 50 },
    5: { name: 'SME Fire Cover', premium: 100 },
    6: { name: 'Life Cover', premium: 40 },
  };

  const product = products[productIndex];
  if (!product) {
    return { type: 'END', message: 'Invalid selection. Please try again.' };
  }

  if (step === 2) {
    return {
      type: 'CON',
      message: `${product.name}
Premium: KES ${product.premium}

1. Confirm Purchase
2. Cancel`,
    };
  }

  if (step === 3 && parts[2] === '1') {
    const policyRef = `BOS${Date.now().toString(36).toUpperCase()}`;
    return {
      type: 'END',
      message: `✅ Purchase Initiated!

Policy: ${policyRef}
Type: ${product.name}
Amount: KES ${product.premium}

Check your phone for M-Pesa PIN prompt to complete payment. You will receive an SMS confirmation.`,
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
      message: `✅ Claim Filed!

Reference: ${claimRef}

You will receive an SMS with a link to upload photos of the damage for quick processing.`,
    };
  }

  return { type: 'END', message: 'Claim filing error. Please try again.' };
}

function handleMyPolicies(): UssdResponse {
  return {
    type: 'END',
    message: `📋 Policy Status:

To check your policy details and claim history, please visit:
bimaos.app/my-policies

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
4. Insurance Tips
5. Back`,
    };
  }

  const topic = parts[1];
  const educationalContent: Record<string, string> = {
    '1': `📖 Insurance is a way to protect yourself from unexpected financial loss. You pay a small amount (premium) regularly, and the insurer covers you when something goes wrong - like an accident, illness, or crop failure.`,
    '2': `📋 To file a claim:

1. Dial *384*XXX# on your phone
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
