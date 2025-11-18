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
    const systemPrompt = `You are a senior credit analyst and financial advisor with 20+ years of experience in personal and business credit analysis, specializing in comprehensive financial assessments for lending decisions.
    
    Analyze the provided financial data with extreme thoroughness and provide a detailed multi-section report:
    
    ## Required Analysis Structure:
    
    ### 1. EXECUTIVE SUMMARY
    - Overall credit grade (Excellent/Good/Fair/Poor)
    - 3-5 key findings (both positive and negative)
    - Credit recommendation (Approve/Approve with conditions/Decline)
    
    ### 2. PERSONAL FINANCIAL ANALYSIS
    - Personal income trends and stability across all periods
    - Personal asset composition and quality
    - Personal liability structure and debt service obligations
    - Personal cash flow analysis and savings capacity
    - Personal financial ratios: Debt-to-Income, Liquidity Ratio, Savings Rate
    - Credit profile assessment
    
    ### 3. BUSINESS FINANCIAL ANALYSIS
    - Business revenue trends and growth patterns
    - Profitability analysis (gross margin, net margin, EBITDA)
    - Business asset quality and liquidity position
    - Business debt structure and leverage ratios
    - Working capital analysis and operational efficiency
    - Business financial ratios: Current Ratio, Debt-to-Equity, Asset Turnover, ROA
    - Industry comparison and performance benchmarks
    
    ### 4. AFFILIATE ENTITIES ANALYSIS (if applicable)
    - Performance of each affiliate entity
    - Consolidated financial impact
    - Cross-entity dependencies and risks
    
    ### 5. GLOBAL/CONSOLIDATED POSITION
    - Combined balance sheet strength
    - Total debt service coverage across all entities
    - Global cash flow and liquidity position
    - Overall leverage and risk exposure
    - Net worth assessment and wealth composition
    
    ### 6. STRENGTHS & OPPORTUNITIES
    - Key positive indicators with specific numbers
    - Competitive advantages
    - Growth potential areas
    
    ### 7. RISKS & CONCERNS
    - Material weaknesses with quantified impact
    - Cash flow vulnerabilities
    - Leverage concerns
    - Industry or market risks
    
    ### 8. ACTIONABLE RECOMMENDATIONS
    - Specific steps to improve creditworthiness (prioritized)
    - Debt optimization strategies
    - Cash flow improvement tactics
    - Risk mitigation measures
    - Timeline and expected impact for each recommendation
    
    ### 9. CREDIT DECISION RATIONALE
    - Key factors supporting approval/decline
    - Required conditions or covenants (if applicable)
    - Monitoring requirements
    
    Format Requirements:
    - Use ## for main sections, ### for subsections
    - **Bold** all numerical metrics and ratios
    - Use bullet points and numbered lists for clarity
    - Include specific dollar amounts and percentages from the data
    - Compare current metrics to industry standards where relevant
    - Be direct, professional, and analytical - this is for lending decisions`;

    const userPrompt = `Perform a comprehensive credit analysis on this complete financial profile:

## PERSONAL FINANCIAL DATA

### Personal Income History (Period Labels: ${JSON.stringify(financialData.personalPeriodLabels)}):
${JSON.stringify(financialData.personalPeriods, null, 2)}

### Personal Balance Sheet:
**Assets:** ${JSON.stringify(financialData.personalAssets, null, 2)}
**Liabilities:** ${JSON.stringify(financialData.personalLiabilities, null, 2)}

### Personal Financial Metrics:
- **Total Personal Assets:** $${financialData.calculatedMetrics.personal.totalAssets.toLocaleString()}
- **Total Personal Liabilities:** $${financialData.calculatedMetrics.personal.totalLiabilities.toLocaleString()}
- **Personal Net Worth:** $${financialData.calculatedMetrics.personal.netWorth.toLocaleString()}
- **Liquid Assets:** $${financialData.calculatedMetrics.personal.liquidAssets.toLocaleString()}
- **Personal Debt-to-Assets Ratio:** ${financialData.calculatedMetrics.personal.debtToAssets.toFixed(1)}%
- **Personal Liquidity Ratio:** ${financialData.calculatedMetrics.personal.liquidityRatio.toFixed(2)}

## BUSINESS FINANCIAL DATA

### Business Income Statements (Period Labels: ${JSON.stringify(financialData.businessPeriodLabels)}):
${JSON.stringify(financialData.businessPeriods, null, 2)}

### Business Balance Sheets:
${JSON.stringify(financialData.businessBalanceSheetPeriods, null, 2)}

### Business Financial Metrics:
- **Revenue:** $${financialData.calculatedMetrics.business.revenue.toLocaleString()}
- **Gross Profit:** $${financialData.calculatedMetrics.business.grossProfit.toLocaleString()}
- **Gross Margin:** ${financialData.calculatedMetrics.business.grossMargin.toFixed(1)}%
- **Net Income:** $${financialData.calculatedMetrics.business.netIncome.toLocaleString()}
- **Net Margin:** ${financialData.calculatedMetrics.business.netMargin.toFixed(1)}%
- **Total Business Assets:** $${financialData.calculatedMetrics.business.totalAssets.toLocaleString()}
- **Total Business Liabilities:** $${financialData.calculatedMetrics.business.totalLiabilities.toLocaleString()}
- **Current Ratio:** ${financialData.calculatedMetrics.business.currentRatio.toFixed(2)}
- **Debt-to-Equity Ratio:** ${financialData.calculatedMetrics.business.debtToEquity.toFixed(2)}

## EXISTING DEBT OBLIGATIONS:
${JSON.stringify(financialData.debts, null, 2)}

## AFFILIATE ENTITIES:
${JSON.stringify(financialData.affiliateEntities, null, 2)}

## CONSOLIDATED/GLOBAL POSITION:
- **Total Combined Assets:** $${financialData.calculatedMetrics.combined.totalAssets.toLocaleString()}
- **Total Combined Liabilities:** $${financialData.calculatedMetrics.combined.totalLiabilities.toLocaleString()}
- **Total Net Worth (Global):** $${financialData.calculatedMetrics.combined.totalNetWorth.toLocaleString()}

---

Provide a thorough, professional credit analysis following the structure outlined in your system instructions. Be specific, reference actual numbers, analyze trends across periods, and provide clear, actionable recommendations.`;

    console.log('Calling Lovable AI for financial analysis...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 4000,
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