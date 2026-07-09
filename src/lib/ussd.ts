export interface UssdResponse {
  message: string;
  type: 'CON' | 'END';
}

export type Lang = 'en' | 'sw';

/**
 * Bilingual USSD menu for BimaOS.
 *
 * Flow (indices are relative to the raw `text` split by '*'):
 *   parts[0] -> language ('1' = English, '2' = Kiswahili)
 *   parts[1] -> main menu option
 *   parts[2+] -> sub-menu selections
 *
 * The language prefix means every downstream selection is shifted by one
 * position. The DB mutation logic in /api/ussd/route.ts accounts for this.
 */

// Shared plan catalog — kept in sync with route.ts planMap and the client
// staticPlans. Prices in KES. Plan (brand) names stay untranslated; the
// category label and all surrounding copy are localised.
export const categories: Record<
  string,
  { id: string; en: string; sw: string }
> = {
  '1': { id: 'kilimo', en: 'Kilimo Shield (Agriculture)', sw: 'Kilimo Shield (Kilimo)' },
  '2': { id: 'boda', en: 'Boda & Motor (Vehicle)', sw: 'Boda na Magari (Usafiri)' },
  '3': { id: 'biashara', en: 'Biashara Cover (Retail)', sw: 'Biashara Cover (Biashara Ndogo)' },
  '4': { id: 'health', en: 'Afya Care (Health & Life)', sw: 'Afya Care (Afya na Maisha)' },
};

export const plansMap: Record<string, Record<string, { name: string; premium: number }>> = {
  '1': {
    '1': { name: 'Crop Guard Basic', premium: 150 },
    '2': { name: 'Weather-Indexed Plus', premium: 450 },
    '3': { name: 'Parametric Shield', premium: 1200 },
  },
  '2': {
    '1': { name: 'Boda Daily', premium: 20 },
    '2': { name: 'Rider Commuter', premium: 100 },
    '3': { name: 'Comprehensive Motor', premium: 500 },
  },
  '3': {
    '1': { name: 'Mama Mboga Daily', premium: 30 },
    '2': { name: 'Market Stall Standard', premium: 150 },
    '3': { name: 'Retail Shop Secure', premium: 800 },
  },
  '4': {
    '1': { name: 'Bima Afya Basic', premium: 50 },
    '2': { name: 'Sacco Health Cover', premium: 200 },
    '3': { name: 'Afya Family Shield', premium: 600 },
  },
};

const t = {
  en: {
    mainMenu: `BimaOS - Insurance for Every African

1. Buy Micro-Insurance
2. File a Claim
3. View My Policies
4. Learn About Insurance`,
    invalid: 'Invalid option. Please try again.',
    selectCategory: `Select Cover Category:

1. Kilimo Shield (Agriculture)
2. Boda & Motor (Vehicle)
3. Biashara Cover (Retail)
4. Afya Care (Health & Life)`,
    invalidCategory: 'Invalid category. Please try again.',
    selectPlan: (cat: string) => `Select Plan - ${cat}:`,
    invalidPlan: 'Invalid plan selection.',
    confirm: (plan: string, cat: string, premium: number) =>
      `${plan} (${cat})
Premium: KES ${premium}

1. Confirm & Pay via M-Pesa
2. Cancel`,
    purchaseOk: (ref: string, plan: string, premium: number) =>
      `Purchase initiated!

Policy: ${ref}
Plan: ${plan}
Amount: KES ${premium}

An M-Pesa PIN prompt will be sent to your phone. You will get an SMS confirmation.`,
    cancelled: 'Purchase cancelled.',
    claimEnterPolicy: 'File a Claim.\nEnter your policy number or phone number:',
    claimDescribe: `Describe what happened (max 160 chars):

e.g. "Hit by another boda on Kenyatta Ave"`,
    claimOk: (ref: string) => `Claim registered!

Reference: ${ref}

You will receive an SMS with a link to upload photos, ID and KRA certificate for AI review.`,
    claimErr: 'Claim filing error. Please try again.',
    policies: `My Policies:

To view your policy details and claim history, visit:
bima-os.vercel.app/client

You will also receive an SMS update shortly.`,
    eduMenu: `Learn About Insurance:

1. What is Insurance?
2. How to File a Claim
3. Understanding Premiums
4. Insurance Tips`,
    edu: {
      '1': `Insurance protects you from unexpected financial loss. You pay a small amount (premium) regularly, and the insurer covers you when something goes wrong - an accident, illness or crop failure.`,
      '2': `To file a claim:
1. Dial *384*11400#
2. Choose your language
3. Select "File a Claim"
4. Enter your policy number
5. Describe what happened
6. Upload photos via the SMS link

Claims are processed within 24 hours.`,
      '3': `A premium is what you pay for cover.

Daily premiums start from as low as KES 20 - less than a soda!

Pay daily, weekly or per season via M-Pesa.`,
      '4': `Insurance Tips:
- Keep your policy number handy
- Take photos right after an incident
- Report claims within 24 hours
- Update details if you change numbers
- Review your cover regularly`,
    } as Record<string, string>,
    eduThanks: 'Thank you for using BimaOS. Stay protected!',
  },
  sw: {
    mainMenu: `BimaOS - Bima kwa Kila Mwafrika

1. Nunua Bima Ndogo
2. Wasilisha Dai
3. Angalia Bima Zangu
4. Jifunze Kuhusu Bima`,
    invalid: 'Chaguo si sahihi. Tafadhali jaribu tena.',
    selectCategory: `Chagua Aina ya Bima:

1. Kilimo Shield (Kilimo)
2. Boda na Magari (Usafiri)
3. Biashara Cover (Biashara Ndogo)
4. Afya Care (Afya na Maisha)`,
    invalidCategory: 'Aina si sahihi. Tafadhali jaribu tena.',
    selectPlan: (cat: string) => `Chagua Mpango - ${cat}:`,
    invalidPlan: 'Mpango uliochagua si sahihi.',
    confirm: (plan: string, cat: string, premium: number) =>
      `${plan} (${cat})
Ada: KES ${premium}

1. Thibitisha na Lipa kwa M-Pesa
2. Ghairi`,
    purchaseOk: (ref: string, plan: string, premium: number) =>
      `Ununuzi umeanzishwa!

Bima: ${ref}
Mpango: ${plan}
Kiasi: KES ${premium}

Utapokea ujumbe wa PIN ya M-Pesa kwenye simu yako. Utapata uthibitisho kwa SMS.`,
    cancelled: 'Ununuzi umeghairiwa.',
    claimEnterPolicy: 'Wasilisha Dai.\nWeka nambari ya bima au nambari ya simu:',
    claimDescribe: `Eleza kilichotokea (herufi 160):

mf. "Nimegongwa na boda nyingine Kenyatta Ave"`,
    claimOk: (ref: string) => `Dai limesajiliwa!

Kumbukumbu: ${ref}

Utapokea SMS yenye kiungo cha kupakia picha, kitambulisho na cheti cha KRA kwa ukaguzi wa AI.`,
    claimErr: 'Hitilafu katika kuwasilisha dai. Tafadhali jaribu tena.',
    policies: `Bima Zangu:

Ili kuona maelezo ya bima na historia ya madai, tembelea:
bima-os.vercel.app/client

Pia utapokea taarifa kwa SMS hivi karibuni.`,
    eduMenu: `Jifunze Kuhusu Bima:

1. Bima ni nini?
2. Jinsi ya Kuwasilisha Dai
3. Kuelewa Ada
4. Vidokezo vya Bima`,
    edu: {
      '1': `Bima hukukinga dhidi ya hasara isiyotarajiwa. Unalipa kiasi kidogo (ada) mara kwa mara, na mtoa bima hukulipia jambo linapoharibika - ajali, ugonjwa au kushindwa kwa mazao.`,
      '2': `Kuwasilisha dai:
1. Piga *384*11400#
2. Chagua lugha
3. Chagua "Wasilisha Dai"
4. Weka nambari ya bima
5. Eleza kilichotokea
6. Pakia picha kupitia kiungo cha SMS

Madai hushughulikiwa ndani ya saa 24.`,
      '3': `Ada ni kiasi unacholipa kwa ajili ya bima.

Ada za kila siku huanzia KES 20 tu - chini ya bei ya soda!

Lipa kila siku, kila wiki au kwa msimu kupitia M-Pesa.`,
      '4': `Vidokezo vya Bima:
- Weka nambari ya bima karibu
- Piga picha mara tu baada ya tukio
- Ripoti madai ndani ya saa 24
- Sasisha maelezo ukibadili nambari
- Kagua bima yako mara kwa mara`,
    } as Record<string, string>,
    eduThanks: 'Asante kwa kutumia BimaOS. Endelea kuwa salama!',
  },
};

export function buildUssdMenu(text: string): UssdResponse {
  const parts = text ? text.split('*') : [];

  // Step 0 — Language selection (root menu)
  if (text === '' || parts.length === 0) {
    return {
      type: 'CON',
      message: `Welcome to BimaOS / Karibu BimaOS

1. English
2. Kiswahili`,
    };
  }

  const langChoice = parts[0];
  const lang: Lang | null = langChoice === '1' ? 'en' : langChoice === '2' ? 'sw' : null;

  if (!lang) {
    return { type: 'END', message: 'Invalid option / Chaguo si sahihi.' };
  }

  const L = t[lang];
  // Selections after the language prefix
  const menuParts = parts.slice(1);

  // Main menu (language chosen, nothing else yet)
  if (menuParts.length === 0) {
    return { type: 'CON', message: L.mainMenu };
  }

  const mainOption = menuParts[0];

  if (mainOption === '1') return handleBuyInsurance(menuParts, lang);
  if (mainOption === '2') return handleFileClaim(menuParts, lang);
  if (mainOption === '3') return handleMyPolicies(lang);
  if (mainOption === '4') return handleEducation(menuParts, lang);

  return { type: 'END', message: L.invalid };
}

function handleBuyInsurance(menuParts: string[], lang: Lang): UssdResponse {
  const L = t[lang];
  const step = menuParts.length; // 1 = at buy root

  if (step === 1) {
    return { type: 'CON', message: L.selectCategory };
  }

  const categoryIndex = menuParts[1];
  const category = categories[categoryIndex];
  if (!category) {
    return { type: 'END', message: L.invalidCategory };
  }
  const catName = category[lang];

  if (step === 2) {
    const plans = plansMap[categoryIndex];
    return {
      type: 'CON',
      message: `${L.selectPlan(catName)}

1. ${plans['1'].name} - KES ${plans['1'].premium}
2. ${plans['2'].name} - KES ${plans['2'].premium}
3. ${plans['3'].name} - KES ${plans['3'].premium}`,
    };
  }

  const planIndex = menuParts[2];
  const plan = plansMap[categoryIndex]?.[planIndex];
  if (!plan) {
    return { type: 'END', message: L.invalidPlan };
  }

  if (step === 3) {
    return { type: 'CON', message: L.confirm(plan.name, catName, plan.premium) };
  }

  if (step === 4 && menuParts[3] === '1') {
    const policyRef = `BOS${Date.now().toString(36).toUpperCase()}`;
    return { type: 'END', message: L.purchaseOk(policyRef, plan.name, plan.premium) };
  }

  return { type: 'END', message: L.cancelled };
}

function handleFileClaim(menuParts: string[], lang: Lang): UssdResponse {
  const L = t[lang];
  const step = menuParts.length;

  if (step === 1) {
    return { type: 'CON', message: L.claimEnterPolicy };
  }

  if (step === 2) {
    return { type: 'CON', message: L.claimDescribe };
  }

  if (step === 3) {
    const claimRef = `CLM${Date.now().toString(36).toUpperCase()}`;
    return { type: 'END', message: L.claimOk(claimRef) };
  }

  return { type: 'END', message: L.claimErr };
}

function handleMyPolicies(lang: Lang): UssdResponse {
  return { type: 'END', message: t[lang].policies };
}

function handleEducation(menuParts: string[], lang: Lang): UssdResponse {
  const L = t[lang];
  const step = menuParts.length;

  if (step === 1) {
    return { type: 'CON', message: L.eduMenu };
  }

  const topic = menuParts[1];
  const content = L.edu[topic];
  if (!content) {
    return { type: 'END', message: L.eduThanks };
  }

  return { type: 'END', message: content };
}

export function extractPhoneNumber(phoneNumber: string): string {
  if (phoneNumber.startsWith('+254')) return phoneNumber;
  if (phoneNumber.startsWith('0')) return '+254' + phoneNumber.slice(1);
  if (phoneNumber.startsWith('254')) return '+' + phoneNumber;
  return '+254' + phoneNumber;
}
