import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { financialData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Prepare comprehensive analysis prompt
    const systemPrompt = `You are a professional credit analyst and financial advisor with expertise in personal and business credit analysis. 
    Analyze the provided financial data comprehensively and provide:
    
    1. Overall Financial Health Assessment
    2. Strengths and positive indicators
    3. Areas of concern or risk
    4. Key ratio analysis (debt-to-income, liquidity, savings rate, etc.)
    5. Cash flow trends and patterns
    6. Credit worthiness assessment
    7. Specific actionable recommendations for improvement
    8. Risk mitigation strategies
    
    Be specific, reference actual numbers from the data, and provide professional yet accessible insights.
    Format your response in clear sections with headers.`;

    const userPrompt = `Analyze this financial profile:

Personal Income (across periods):
${JSON.stringify(financialData.personalPeriods, null, 2)}

Personal Assets & Liabilities:
Assets: ${JSON.stringify(financialData.personalAssets, null, 2)}
Liabilities: ${JSON.stringify(financialData.personalLiabilities, null, 2)}

Business Income:
${JSON.stringify(financialData.businessPeriods, null, 2)}

Existing Debts:
${JSON.stringify(financialData.debts, null, 2)}

Affiliate Entities:
${JSON.stringify(financialData.affiliateEntities, null, 2)}

Summary Metrics:
Total Assets: $${financialData.summary.totalAssets.toLocaleString()}
Total Liabilities: $${financialData.summary.totalLiabilities.toLocaleString()}
Net Worth: $${(financialData.summary.totalAssets - financialData.summary.totalLiabilities).toLocaleString()}

Provide a comprehensive credit analysis and financial recommendations.`;

    console.log('Calling Lovable AI for financial analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    console.log('Analysis generated successfully');

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-financial-analysis:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});