import OpenAI from "openai";

// Initialize OpenAI client with API key from environment variables
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Function to analyze text and suggest template data
export async function analyzeTemplateText(
  companyName: string,
  description?: string,
  logoUrl?: string
): Promise<{
  suggestions: {
    colorPrimary: string;
    colorSecondary: string;
    colorAccent: string;
    colorBackground: string;
    colorText: string;
    style: string;
    companyInfo: Array<{
      id: string;
      title: string;
      description: string;
      svg: string;
    }>;
    description?: string;
  };
  error?: string;
}> {
  try {
    // Prepare the content for the AI analysis
    const messages = [
      {
        role: "system",
        content: `You are a professional web design assistant that specializes in creating visually appealing product templates.
        Analyze the company name, description, and logo (if provided) to suggest a cohesive design theme.
        Respond with a JSON structure containing design suggestions including:
        - Color scheme (primary, secondary, accent, background, text)
        - Design style (modern, classic, minimalist, bold, or elegant)
        - Company section information with 3 key features or selling points
        - Improved description (if the original needs enhancement)`,
      },
    ];

    // Add company name info
    messages.push({
      role: "user",
      content: `Company Name: ${companyName}`,
    });

    // Add description if available
    if (description) {
      messages.push({
        role: "user",
        content: `Description: ${description}`,
      });
    }

    // Add logo info if available
    if (logoUrl) {
      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: "Logo image (please analyze this for color and style suggestions):",
          },
          {
            type: "image_url",
            image_url: {
              url: logoUrl,
            },
          },
        ] as any,
      });
    }

    // Get AI response
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: messages as any, 
      response_format: { type: "json_object" },
      max_tokens: 1000,
    });

    // Parse the AI response
    const suggestions = JSON.parse(response.choices[0].message.content || "{}");
    
    // Add unique IDs to company info sections if they don't have them
    if (suggestions.companyInfo && Array.isArray(suggestions.companyInfo)) {
      suggestions.companyInfo = suggestions.companyInfo.map((section: {id?: string; title: string; description: string; svg: string}, index: number) => {
        if (!section.id) {
          return {
            ...section,
            id: `section-${index + 1}`,
          };
        }
        return section;
      });
    }

    return { suggestions };
  } catch (error: any) {
    console.error("Error in OpenAI template analysis:", error);
    return {
      suggestions: {
        colorPrimary: "#3498db",
        colorSecondary: "#2ecc71",
        colorAccent: "#e74c3c",
        colorBackground: "#f9f9f9",
        colorText: "#333333",
        style: "modern",
        companyInfo: [
          {
            id: "section-1",
            title: "Quality Products",
            description: "We provide high-quality products that meet industry standards.",
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>'
          },
          {
            id: "section-2",
            title: "Customer Satisfaction",
            description: "Our priority is ensuring our customers are completely satisfied.",
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
          },
          {
            id: "section-3",
            title: "Fast Delivery",
            description: "We ensure quick and reliable delivery to our customers.",
            svg: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>'
          }
        ]
      },
      error: error.message,
    };
  }
}