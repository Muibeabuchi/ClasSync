````markdown
# 🤖 AI Fix CSV with Gemini AI – Convex Action Guide for KIRO

## 🎯 Goal

This feature allows Classynk to **automatically repair malformed CSV class lists** uploaded by lecturers. When a CSV fails to parse (due to missing headers, bad formatting, etc.), an **"AI Fix CSV"** button appears. Clicking it triggers a backend **Convex Action** that sends the raw CSV text to **Gemini AI**, which restructures the file into the required schema.

This guide describes how KIRO should implement the AI Fix system using Gemini and Convex.

---

## 📋 Expected CSV Schema

Lecturer uploads are expected to be converted to this format:

```ts
type ExpectedStudentSchema = {
  name: string;
  gender: 'Male' | 'Female';
  regNumber: string;
};
```
````

---

## 🔁 When the AI Fix Trigger Is Used

- Lecturer uploads a CSV file.
- The file **fails** parsing/validation.
- KIRO should:
  - Show a **"⚡ AI Fix CSV"** button.
  - When clicked, send the raw CSV content to a Convex Action.
  - The action will call **Gemini AI** to restructure the data.

---

## 🧱 Tools Used

- ✅ Convex Actions (for calling external services)
- ✅ Gemini AI (via Google Generative AI SDK)
- ✅ Zod (for validating AI responses)

---

## 📁 KIRO Directory Structure

```bash
convex/
├── actions/
│   └── aiFixCsv.ts          # Main AI fix logic using Gemini
├── schemas/
│   └── studentSchema.ts     # Zod schema for expected structure
├── utils/
│   └── buildPrompt.ts       # Prompt builder for Gemini
```

---

## 1️⃣ Install Gemini SDK

```bash
pnpm add @google/generative-ai
```

Also, make sure you set the Gemini API key:

```bash
# .env.local
GENAI_API_KEY=your_google_genai_key
```

---

## 2️⃣ Prompt Generator (utils/buildPrompt.ts)

```ts
export const buildGeminiCsvFixPrompt = (rawCsv: string) => `
A lecturer uploaded a malformed CSV file containing student data. Your job is to:

1. Detect and rename headers to: Name, Gender, Registration Number
2. Correct malformed gender entries (e.g., "femlae" → "Female")
3. Capitalize student names properly
4. Infer missing gender based on the student's first name (with high confidence only)

Return ONLY a valid JSON array in this format:

[
  { "name": "John Doe", "gender": "Male", "regNumber": "202312345" },
  ...
]

If possible, include a "summary" field at the end that lists what was fixed.

Raw CSV:
${rawCsv}
`;
```

---

## 3️⃣ Convex Action (actions/aiFixCsv.ts)

```ts
import { action } from 'convex/server';
import { v } from 'convex/values';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { buildGeminiCsvFixPrompt } from '../utils/buildPrompt';

const genAI = new GoogleGenerativeAI(process.env.GENAI_API_KEY!);

export const aiFixCsv = action({
  args: {
    rawCsvText: v.string(),
  },
  handler: async (ctx, { rawCsvText }) => {
    const prompt = buildGeminiCsvFixPrompt(rawCsvText);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    try {
      const parsed = JSON.parse(response);

      if (!Array.isArray(parsed)) {
        throw new Error('Invalid format');
      }

      const cleanedData = parsed.map((row) => ({
        name: row.name?.trim(),
        gender: row.gender,
        regNumber: row.regNumber,
      }));

      return {
        repaired: true,
        data: cleanedData,
        summary: parsed.summary ?? 'No summary provided.',
      };
    } catch (err) {
      return {
        repaired: false,
        error: 'Failed to parse Gemini output.',
        debug: response,
      };
    }
  },
});
```

---

## 4️⃣ Frontend Call to Action

```ts
const handleAIFixClick = async (file: File) => {
  const rawText = await file.text();

  const result = await api.actions.aiFixCsv({ rawCsvText: rawText });

  if (result.repaired) {
    setPreviewData(result.data);
    setSummary(result.summary);
  } else {
    toast.error('AI Fix failed: ' + result.error);
    console.log('Debug output:', result.debug);
  }
};
```

---

## 5️⃣ Zod Schema for Validation (schemas/studentSchema.ts)

```ts
import { z } from 'zod';

export const studentSchema = z.object({
  name: z.string().min(1),
  gender: z.enum(['Male', 'Female']),
  regNumber: z.string(),
});
```

Use this if you want to validate the `cleanedData` before saving.

---

## ✅ What KIRO Should Ensure

- [ ] The AI Fix CSV button only appears if normal parsing fails.
- [ ] The raw CSV is sent to the Convex action as plain text.
- [ ] The repaired data is previewed to the lecturer before upload.
- [ ] Lecturers can confirm or discard the AI-repaired version.
- [ ] All outputs from Gemini are validated before saving to the database.

---

## 🧪 Example

### Raw Uploaded CSV

```csv
Full Name,Sex,Matriculation No
john doe,male,20230001
mary,,20230002
Tunde,Femlae,20230100
```

### Gemini Output

```json
[
  { "name": "John Doe", "gender": "Male", "regNumber": "20230001" },
  { "name": "Mary", "gender": "Female", "regNumber": "20230002" },
  { "name": "Tunde", "gender": "Female", "regNumber": "20230100" },
  "summary": "Headers normalized. Inferred gender for Mary. Fixed 'Femlae' to 'Female'."
]
```

---

## 🧱 Return Type from Action

```ts
{
  repaired: true | false
  data?: ExpectedStudentSchema[]
  summary?: string
  error?: string
  debug?: string
}
```

---

## 🔒 Safety Notes

- Never auto-apply AI changes without lecturer confirmation.
- If Gemini returns invalid JSON, gracefully report and log.

---

## 📦 Optional Improvements

- Highlight changed cells in the preview UI.
- Allow download of AI-fixed CSV before upload.
- Cache previous fixes per lecturer to learn header patterns.

---

```

```
