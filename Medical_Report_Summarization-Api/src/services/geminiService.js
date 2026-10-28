import { GoogleGenAI } from "@google/genai";
import supabase from "../config/supabase.js";
import path from "path";

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.warn("GEMINI_API_KEY environment variable is not set.");
}

const genAI = new GoogleGenAI({ apiKey: apiKey || "placeholder" });

const systemPrompt = `You are a clinical report analyst. Analyze the provided medical report 
and return ONLY a valid JSON object with no extra text, no markdown, 
no code fences. Use this exact structure:
{
  "report_type": "type of report e.g. Blood Test, MRI Report, Prescription, Discharge Summary",
  "patient_name": "extracted from report or Unknown",
  "report_date": "extracted from report or Unknown",
  "summary": "2-3 sentence plain english summary of the overall report",
  "critical_flags": [
    {
      "metric": "metric name",
      "value": "exact value as written in report",
      "unit": "unit",
      "status": "HIGH or LOW or ABNORMAL",
      "note": "brief clinical note explaining why this is flagged"
    }
  ],
  "all_findings": [
    {
      "category": "e.g. Hematology, Biochemistry, Vitals, Radiology",
      "metrics": [
        {
          "name": "metric name",
          "value": "exact value as written in report",
          "unit": "unit or empty string",
          "reference_range": "reference range if present in report or empty string",
          "is_abnormal": true or false
        }
      ]
    }
  ],
  "report_status": "Final or Interim or Partial — extracted from report",
  "pending_results": ["list of tests that are marked as results to follow or blank"],
  "doctor_recommendation": "any follow-up or recommendation found in the report or empty string"
}
Do not estimate or modify any numerical values. Extract them exactly as they appear.`;

export const processReport = async (reportId, fileUrl, fileName) => {
  try {
    console.log(
      `[GeminiService] Starting processing for reportId: ${reportId}`,
    );

    // Download file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("medical-docs")
      .download(fileUrl);

    if (downloadError) {
      throw new Error(
        `Failed to download file from Supabase: ${downloadError.message}`,
      );
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString("base64");

    // Detect mime type from file extension
    const ext = path.extname(fileName).toLowerCase();
    let mimeType = "application/pdf";
    if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
    else if (ext === ".png") mimeType = "image/png";

    console.log(
      `[GeminiService] Sending to Gemini for reportId: ${reportId}`,
    );

    // Correct new SDK usage — single generateContent call
    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: "Analyze this medical report according to your system instructions.",
            },
            { inlineData: { data: base64Data, mimeType } },
          ],
        },
      ],
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text;

    console.log(
      `[GeminiService] Received response for reportId: ${reportId}`,
    );

    // Parse JSON response
    let summaryJson;
    try {
      summaryJson = JSON.parse(responseText.trim());
    } catch {
      const clean = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      try {
        summaryJson = JSON.parse(clean);
      } catch {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          summaryJson = JSON.parse(match[0]);
        } else {
          console.error("Raw Gemini response:", responseText);
          throw new Error(
            "Could not locate a valid JSON object in the Gemini response.",
          );
        }
      }
    }

    console.log(
      `[GeminiService] Final JSON for reportId ${reportId}:`,
      JSON.stringify(summaryJson, null, 2),
    );

    // Insert summary into database
    const { error: summaryError } = await supabase
      .from("summaries")
      .insert([{ report_id: reportId, summary_json: summaryJson }]);

    if (summaryError)
      throw new Error(`Failed to insert summary: ${summaryError.message}`);

    // Update report status to done
    const { error: updateError } = await supabase
      .from("reports")
      .update({ status: "done" })
      .eq("id", reportId);

    if (updateError)
      throw new Error(
        `Failed to update report status: ${updateError.message}`,
      );

    console.log(
      `[GeminiService] Successfully processed reportId: ${reportId}`,
    );
  } catch (error) {
    console.error(
      `[GeminiService] Failed to process reportId: ${reportId}`,
      error,
    );
    await supabase
      .from("reports")
      .update({ status: "failed" })
      .eq("id", reportId);
  }
};

export const generateOverallSummary = async (profile, summaries) => {
  try {
    console.log(`[GeminiService] Generating overall summary for patient profile...`);
    
    const formattedProfile = `
Full Name: ${profile?.full_name || "N/A"}
Role: Patient
Date of Birth: ${profile?.date_of_birth || "N/A"}
Biological Sex: ${profile?.biological_sex || "N/A"}
Blood Group: ${profile?.blood_group || "N/A"}
Height: ${profile?.height_cm ? profile.height_cm + " cm" : "N/A"}
Weight: ${profile?.weight_kg ? profile.weight_kg + " kg" : "N/A"}
Known Medical Conditions: ${Array.isArray(profile?.known_conditions) ? profile.known_conditions.join(", ") : "None listed"}
Current Medications: ${Array.isArray(profile?.current_medications) ? profile.current_medications.join(", ") : "None listed"}
Known Allergies: ${Array.isArray(profile?.known_allergies) ? profile.known_allergies.join(", ") : "None listed"}
`;

    const formattedSummaries = summaries
      .map(
        (s, i) => `
Report #${i + 1}:
Type: ${s.summary_json?.report_type || "Unknown"}
Date: ${s.summary_json?.report_date || "Unknown"}
Overall Findings: ${s.summary_json?.summary || "No overall summary"}
Critical Flags: ${JSON.stringify(s.summary_json?.critical_flags || [])}
All Findings: ${JSON.stringify(s.summary_json?.all_findings || [])}
Recommendations: ${s.summary_json?.doctor_recommendation || "None"}
`,
      )
      .join("\n---\n");

    const overallSystemPrompt = `You are a chief clinical medical director. Your job is to review a patient's medical profile and the individual AI-analyzed summaries of all their uploaded medical reports, and synthesize a single, cohesive, holistic health summary.

Return ONLY a valid JSON object matching this structure exactly (no extra text, no markdown, no code fences):
{
  "overall_status": "Choose from: Excellent, Stable, Monitor, Action Required, or Critical",
  "executive_summary": "A 3-4 sentence comprehensive medical synthesis of the patient's current health status, integrating their clinical background and recent test results.",
  "active_clinical_concerns": [
    {
      "concern": "Name of the issue or concern",
      "findings": "Detailed list of abnormal parameters or findings from specific reports (include dates)",
      "severity": "high or moderate or low",
      "clinical_note": "A clinical explanation of why this matters and how it relates to their health profile."
    }
  ],
  "health_trends": [
    {
      "category": "E.g., Metabolic Health, Cardiovascular, Renal, Hematology, etc.",
      "description": "Analysis of trends or patterns observed across one or more reports (e.g. cholesterol levels are improving compared to past reports, or kidney function remains stable)."
    }
  ],
  "consolidated_allergies_and_risks": {
    "allergies": ["List of confirmed allergies from profile or reports"],
    "risks": ["Potential health risks based on the consolidated findings"]
  },
  "recommended_actions": [
    "List of actionable follow-ups, lifestyle recommendations, or physician consult requests."
  ]
}
Ensure all information is medically sound and directly synthesized from the provided inputs. Do not invent any values.`;

    const result = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Here is the patient's medical profile:
${formattedProfile}

Here are the individual medical report summaries:
${formattedSummaries}

Please synthesize the overall health summary.`,
            },
          ],
        },
      ],
      config: {
        systemInstruction: overallSystemPrompt,
        responseMimeType: "application/json",
      },
    });

    const responseText = result.text;
    let summaryJson;
    try {
      summaryJson = JSON.parse(responseText.trim());
    } catch {
      const clean = responseText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();
      try {
        summaryJson = JSON.parse(clean);
      } catch {
        const match = responseText.match(/\{[\s\S]*\}/);
        if (match) {
          summaryJson = JSON.parse(match[0]);
        } else {
          console.error("Raw Gemini response:", responseText);
          throw new Error("Could not locate a valid JSON object in the Gemini overall response.");
        }
      }
    }

    return summaryJson;
  } catch (error) {
    console.error("[GeminiService] Failed to generate overall summary:", error);
    throw error;
  }
};

