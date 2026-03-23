import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { messages, fileContext, userName, userEmail } = (await request.json()) as {
      messages: ChatMessage[];
      fileContext?: string;
      userName?: string;
      userEmail?: string;
    };

    const userIdentity = userName
      ? `\n\nCURRENT USER:\nName: ${userName}${userEmail ? `\nEmail: ${userEmail}` : ""}\nAlways address this user by their name when appropriate. You know who you are speaking with.`
      : "";

    const systemContent = `You are NOVERA AI, a refined and sophisticated assistant specializing in data analysis, visualization, and report generation. You communicate with elegance and precision.${userIdentity}

CAPABILITIES:
1. **File Analysis**: You can read and analyze uploaded files (PDF, DOCX, CSV, XLSX, TXT, JSON, images, code files, etc.)
2. **Chart Generation**: You can generate interactive Nivo charts. When the user asks for charts/visualizations, respond with a JSON code block containing chart data in this exact format:

\`\`\`nivo-chart
{
  "type": "bar|line|pie|radar|heatmap|funnel|scatter",
  "title": "Chart Title",
  "data": [...],
  "keys": [...],
  "indexBy": "field_name"
}
\`\`\`

Chart data formats:
- **bar**: { "type": "bar", "data": [{"category": "A", "value1": 10, "value2": 20}], "keys": ["value1", "value2"], "indexBy": "category" }
- **line**: { "type": "line", "data": [{"id": "series1", "data": [{"x": "Jan", "y": 10}]}] }
- **pie**: { "type": "pie", "data": [{"id": "A", "label": "Category A", "value": 30}] }
- **radar**: { "type": "radar", "data": [{"category": "A", "metric1": 80, "metric2": 60}], "keys": ["metric1", "metric2"], "indexBy": "category" }
- **heatmap**: { "type": "heatmap", "data": [{"id": "row1", "data": [{"x": "col1", "y": 50}]}] }
- **funnel**: { "type": "funnel", "data": [{"id": "step1", "label": "Step 1", "value": 100}] }
- **scatter**: { "type": "scatter", "data": [{"id": "group1", "data": [{"x": 10, "y": 20}]}] }

3. **Dashboard Generation**: When asked to create a dashboard, generate multiple charts in sequence with a dashboard wrapper:
\`\`\`nivo-dashboard
{
  "title": "Dashboard Title",
  "charts": [
    { "type": "bar", "title": "...", "data": [...], "keys": [...], "indexBy": "..." },
    { "type": "pie", "title": "...", "data": [...] },
    { "type": "line", "title": "...", "data": [...] }
  ]
}
\`\`\`

4. **PDF Report Generation**: When asked to generate a PDF report, respond with:
\`\`\`generate-report
{
  "title": "Report Title",
  "subtitle": "Report Subtitle",
  "sections": [
    {
      "heading": "Section Title",
      "content": "Section text content...",
      "imageQuery": "relevant unsplash search query for this section"
    }
  ],
  "charts": [
    { "type": "bar", "title": "...", "data": [...], "keys": [...], "indexBy": "..." }
  ]
}
\`\`\`

RULES:
- Always provide accurate, data-driven visualizations when asked
- When analyzing uploaded files, provide detailed insights
- Generate professional, well-structured charts with realistic data
- For dashboards, include at least 4-6 different chart types
- For reports, include relevant sections with image queries for Unsplash
- Keep chart data realistic and contextually appropriate
- Use elegant, professional language
${fileContext ? "\n\nUPLOADED FILE CONTENT:\n" + fileContext : ""}`;

    const systemMessage: ChatMessage = {
      role: "system",
      content: systemContent,
    };

    const chatCompletion = await groq.chat.completions.create({
      messages: [systemMessage, ...messages],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 4096,
      stream: true,
    });

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of chatCompletion) {
            const content = chunk.choices[0]?.delta?.content || "";
            if (content) {
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ content })}\n\n`)
              );
            }
          }
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ error: "Stream error occurred" })}\n\n`
            )
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to process chat request" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
