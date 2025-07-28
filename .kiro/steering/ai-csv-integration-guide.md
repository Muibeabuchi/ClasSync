````markdown
# 🛠 AI-Powered CSV Auto-Fix System (For Lecturer Uploads)

## 🎯 Purpose

This module enhances the CSV upload experience for **lecturers** in Classynk by introducing an **AI Fix** fallback option when the uploaded file fails parsing or validation.

When triggered, the system will:

- Detect irregular headers and remap them to the required schema.
- Normalize malformed or inconsistent data entries.
- Infer missing gender where possible.
- Return a corrected preview of the class list for final review before upload.

---

## 📁 Trigger Condition

This feature activates **only when**:

- A lecturer uploads a `.csv` file
- The file **fails structural validation** (e.g., missing headers, invalid/malformed rows)
- The system cannot parse the data to fit the required schema:

```ts
type ExpectedStudentSchema = {
  name: string;
  gender: 'Male' | 'Female';
  regNumber: string; // must start with "202"
};
```
````

When this occurs, show the **"⚡ AI Fix CSV"** button.

---

## ⚙️ AI Fix Workflow

```mermaid
flowchart TD
    A[Lecturer uploads CSV] --> B[Parsing Fails]
    B --> C[Show Parsing Error + AI Fix Button]
    C --> D[Lecturer clicks "AI Fix CSV"]
    D --> E[Send file to AI Fix Processor]
    E --> F[Header remapping + Data normalization + Gender inference]
    F --> G[Return clean preview of fixed data]
    G --> H[Lecturer reviews + Confirms Upload]
```

---

## 🔧 AI Fix Processor Design

### Input

```ts
type RawCsvFile = File;
```

### Output

```ts
type AIRepairedCsvResult = {
  repaired: boolean;
  repairedData: ExpectedStudentSchema[];
  issues: string[]; // human-readable explanations of what was fixed
  warnings?: string[]; // e.g., "Gender for 3 students inferred"
  confidence: number; // 0 to 1
};
```

---

## 🧠 AI Tasks & Logic

### 1. **Header Remapping**

Detect alternate or missing headers and map them to:

- `Name`
- `Gender`
- `Registration Number`

Use fuzzy logic / dictionary mapping:

```ts
const headerMap = {
  name: ['Full Name', 'Student Name', 'Name'],
  gender: ['Sex', 'Gender', 'Gndr'],
  regNumber: ['Matric No', 'Reg No', 'Student ID', 'Registration'],
};
```

---

### 2. **Data Normalization**

- Trim whitespace
- Capitalize names properly (`john doe` → `John Doe`)
- Standardize gender values (`femlae`, `MALE` → `Female`, `Male`)
- Filter out empty or duplicate rows
- Validate that `regNumber` starts with `202`

---

### 3. **Gender Inference (Optional)**

If gender is missing:

- Use a name-to-gender map (e.g., from NameAPI or a local lookup)
- Only apply inference if confidence ≥ 80%
- Flag the row in output with a warning

---

## 🧪 Example Fix Scenario

### ❌ Original Upload

```csv
Full Name,Sex,Matric No
john doe,male,202312345
Mary Stone,,202312999
Tunde Bello,Femlae,202213456
```

### ✅ After AI Fix

```json
{
  "repaired": true,
  "repairedData": [
    { "name": "John Doe", "gender": "Male", "regNumber": "202312345" },
    { "name": "Mary Stone", "gender": "Female", "regNumber": "202312999" },
    { "name": "Tunde Bello", "gender": "Female", "regNumber": "202213456" }
  ],
  "issues": [
    "Header 'Full Name' → 'name'",
    "Header 'Matric No' → 'regNumber'",
    "Corrected 'Femlae' to 'Female'",
    "Inferred gender for Mary Stone"
  ],
  "confidence": 0.94
}
```

---

## 🧩 UI Flow

### On Upload Failure:

- Display error: `We couldn’t parse your file`
- Show fallback: `Having issues? Try using AI Fix`

```tsx
<Button onClick={handleAIFix}>⚡ AI Fix CSV</Button>
```

### After AI Repair:

- Show preview table with flagged cells
- Allow manual edit or `Confirm Upload`

---

## 📤 Final Submission to Backend

```ts
type FinalizedUploadPayload = {
  students: ExpectedStudentSchema[];
  autoFixed: boolean;
  repairedFromUpload?: File;
  repairedByAI?: true;
  repairMetadata?: {
    issueCount: number;
    inferredGenderCount: number;
    originalHeaders: string[];
  };
};
```

---

## 🧱 System Dependencies

- CSV Parser (e.g., `PapaParse`)
- AI/Fuzzy Matching Logic (e.g., custom regex, header heuristics, optional LLM)
- Optional: Gender map JSON or small inference model

---

## ✅ Success Criteria

- [ ] System accepts CSVs with non-standard headers and still succeeds after fix
- [ ] \>85% of malformed uploads can be auto-fixed with AI Fix
- [ ] Lecturer is never forced to manually re-edit CSV just to upload
- [ ] Warnings are clearly displayed and editable

---

## 🚫 Limitations

- Gender inference may not always be accurate
- Names with cultural ambiguity may require manual review
- No conversational interface — this is a pure backend utility

---

## 🔒 Safety

- Never overwrite original upload silently
- Always show preview before saving to DB
- Allow lecturer to cancel and upload a new file at any point

---

```

Let me know if you want a companion backend function spec (`convex/aiFixCsv.ts`) or if you'd like to plug this into an existing `UploadClassList` mutation.
```
