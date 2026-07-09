import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey || apiKey === 'placeholder-nvidia-key' || apiKey.trim() === '') {
      // Return a simulated helpful response if the API key is not yet set
      const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';
      let reply = "Hello! I am your BimaOS assistant. How can I help you today?";
      
      if (lastMessage.includes('price') || lastMessage.includes('cost') || lastMessage.includes('premium')) {
        reply = "Our microinsurance policies start from as low as KES 20/day (for Boda Cover) up to KES 1,200/season (for Kilimo Parametric Cover). You can customize a policy on our Products page and get real-time dynamic pricing underwritten by our AI engine!";
      } else if (lastMessage.includes('claim')) {
        reply = "To file a claim, go to the Claims page, input your registered details, upload your KRA Certificate & National ID image, and tell us what happened. Our AI Claims Auditor will process it instantly!";
      } else if (lastMessage.includes('boda') || lastMessage.includes('bike') || lastMessage.includes('motor')) {
        reply = "Boda Daily covers riders for KES 20/day with up to KES 30,000 in accident/medical coverage. You can register on the Products page or dial *384*11400# from your phone.";
      } else if (lastMessage.includes('kilimo') || lastMessage.includes('crop') || lastMessage.includes('farm')) {
        reply = "Our Kilimo Shield provides parametric crop insurance. If local weather indexes detect drought or excessive rainfall in your region, payouts are sent automatically to your M-Pesa account!";
      } else if (lastMessage.includes('biashara') || lastMessage.includes('business') || lastMessage.includes('market') || lastMessage.includes('shop')) {
        reply = "Our Biashara Cover protects small businesses from theft, fire, and political risk. Insurer admins can also create temporary ad-hoc policies, like one-day riot/maandamano protection covers!";
      } else if (lastMessage.includes('hi') || lastMessage.includes('hello')) {
        reply = "Habari! I am BimaOS AI. I can help you understand our Kilimo (Agriculture), Boda, Biashara, and Health covers. Ask me anything about our plans or how to file claims!";
      }

      return NextResponse.json({
        message: reply,
        simulated: true
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
            content: 'You are BimaOS Assistant, an expert AI chatbot designed to help informal workers, market traders, boda boda riders, and smallholder farmers in East Africa understand, buy, and manage microinsurance policies. Keep answers friendly, clear, short (max 2-3 sentences), and use terms relevant to East Africa (KES, M-Pesa, boda, Kilimo, Gikomba, maandamano, KRA PIN, etc.). Be extremely helpful.'
          },
          ...messages
        ],
        temperature: 0.2,
        max_tokens: 250
      })
    });

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I could not process your request at the moment.";

    return NextResponse.json({
      message: reply
    });
  } catch (error: any) {
    console.error('NVIDIA AI Chat error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
