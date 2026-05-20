import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const AI_URL = "https://gen.pollinations.ai/v1/chat/completions";

interface AIRequest {
  action: "summary" | "enhance" | "skills" | "cover-letter";
  context: Record<string, unknown>;
}

const SYSTEM_PROMPT = `You are a professional CV/resume writing assistant. You help users create compelling, ATS-friendly resume content. Always respond with plain text, no markdown formatting. Be concise and professional. Write in first person when generating personal summaries.`;

function buildPrompt(action: string, context: Record<string, unknown>): string {
  switch (action) {
    case "summary": {
      const info = context.personal_info as Record<string, string>;
      const exp = context.experience as Array<Record<string, string>>;
      const edu = context.education as Array<Record<string, string>>;
      const skills = context.skills as Array<Record<string, string>>;

      let prompt = "Write a professional summary (2-3 sentences) for a resume based on:\n";
      if (info?.fullName) prompt += `Name: ${info.fullName}\n`;
      if (exp?.length) prompt += `Experience: ${exp.map((e) => `${e.position} at ${e.company}`).join(", ")}\n`;
      if (edu?.length) prompt += `Education: ${edu.map((e) => `${e.degree} in ${e.field} from ${e.institution}`).join(", ")}\n`;
      if (skills?.length) prompt += `Skills: ${skills.map((s) => s.name).join(", ")}\n`;
      prompt += "\nWrite a compelling, concise professional summary. No bullet points, just 2-3 flowing sentences.";
      return prompt;
    }

    case "enhance": {
      const description = (context.description as string) || "";
      const position = (context.position as string) || "";
      const company = (context.company as string) || "";
      return `Improve this resume experience description. Make it more impactful with action verbs and quantifiable results where possible. Keep it concise (3-5 bullet points max).\n\nPosition: ${position}\nCompany: ${company}\nCurrent description: ${description}\n\nRewrite as powerful bullet points starting with action verbs. Be specific and results-oriented.`;
    }

    case "skills": {
      const exp = context.experience as Array<Record<string, string>>;
      const edu = context.education as Array<Record<string, string>>;
      const existing = context.skills as Array<Record<string, string>>;

      let prompt = "Suggest relevant skills for a resume based on:\n";
      if (exp?.length) prompt += `Experience: ${exp.map((e) => `${e.position} at ${e.company} - ${e.description}`).join("; ")}\n`;
      if (edu?.length) prompt += `Education: ${edu.map((e) => `${e.degree} in ${e.field}`).join("; ")}\n`;
      if (existing?.length) prompt += `Already listed: ${existing.map((s) => s.name).join(", ")}\n`;
      prompt += "\nSuggest 8-12 relevant skills that would strengthen this resume. Return only the skill names separated by commas, no numbering or extra text.";
      return prompt;
    }

    case "cover-letter": {
      const info = context.personal_info as Record<string, string>;
      const exp = context.experience as Array<Record<string, string>>;
      const edu = context.education as Array<Record<string, string>>;
      const skills = context.skills as Array<Record<string, string>>;
      const jobTitle = (context.jobTitle as string) || "";
      const company = (context.company as string) || "";

      let prompt = `Write a brief, professional cover letter for:\n`;
      prompt += `Job Title: ${jobTitle}\nCompany: ${company}\n`;
      if (info?.fullName) prompt += `Applicant: ${info.fullName}\n`;
      if (exp?.length) prompt += `Experience: ${exp.map((e) => `${e.position} at ${e.company}`).join(", ")}\n`;
      if (edu?.length) prompt += `Education: ${edu.map((e) => `${e.degree} in ${e.field}`).join(", ")}\n`;
      if (skills?.length) prompt += `Skills: ${skills.map((s) => s.name).join(", ")}\n`;
      prompt += "\nWrite a concise cover letter (3 short paragraphs). Professional tone, no fluff.";
      return prompt;
    }

    default:
      return "Hello";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { action, context } = (await req.json()) as AIRequest;
    const prompt = buildPrompt(action, context);

    const response = await fetch(AI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "openai-fast",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`AI API error: ${response.status} - ${err}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "No response generated.";

    return new Response(JSON.stringify({ content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
