import {
  VisionGradingInput,
  StructuredGradingOutput,
  GradingGrade,
  DamageSeverity,
  ContaminationSeverity,
} from './grading.types.js';
import { GRADING_PROMPT_SYSTEM_INSTRUCTIONS } from './rubric.js';

export interface IVisionGradingProvider {
  readonly providerName: string;
  readonly modelName: string;
  gradePhotos(input: VisionGradingInput): Promise<StructuredGradingOutput>;
}

export class GeminiVisionGradingProvider implements IVisionGradingProvider {
  readonly providerName = 'google-gemini';
  readonly modelName: string;
  private readonly apiKey: string;

  constructor(apiKey: string, modelName = 'gemini-1.5-flash') {
    this.apiKey = apiKey;
    this.modelName = modelName;
  }

  async gradePhotos(input: VisionGradingInput): Promise<StructuredGradingOutput> {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.modelName}:generateContent?key=${this.apiKey}`;

    const promptText = `
${GRADING_PROMPT_SYSTEM_INSTRUCTIONS}

Declared Listing Information:
- Declared Material Category: ${input.materialCategory}
- Declared Material Subtype: ${input.materialSubtype}
- Declared Title: ${input.title}
- Declared Description: ${input.description}
- Grading Rubric Version: ${input.rubricVersion}

Return a JSON object conforming precisely to this schema:
{
  "materialDetected": "string",
  "grade": "A" | "B" | "C" | "reject",
  "confidence": number between 0.0 and 1.0,
  "damage": [
    { "type": "string", "severity": "minor" | "moderate" | "severe", "region": "string" }
  ],
  "contamination": [
    { "type": "string", "severity": "none" | "low" | "moderate" | "high" }
  ],
  "reusableUnitsEstimate": number or null,
  "notes": "string"
}
`;

    const parts: any[] = [{ text: promptText }];

    for (const photo of input.photos) {
      parts.push({
        inlineData: {
          mimeType: photo.mimeType,
          data: photo.buffer.toString('base64'),
        },
      });
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Vision API error [${response.status}]: ${errText.slice(0, 300)}`);
    }

    const jsonResponse: any = await response.json();
    const candidate = jsonResponse?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) {
      throw new Error('Empty response received from Gemini Vision model');
    }

    let parsed: any;
    try {
      parsed = JSON.parse(candidate);
    } catch {
      throw new Error(`Failed to parse structured JSON from vision model: ${candidate.slice(0, 100)}`);
    }

    return validateStructuredGradingOutput(parsed);
  }
}

export class DeterministicTestVisionProvider implements IVisionGradingProvider {
  readonly providerName = 'deterministic-test-provider';
  readonly modelName = 'test-vision-v1';

  private configuredResult?: Partial<StructuredGradingOutput>;

  constructor(configuredResult?: Partial<StructuredGradingOutput>) {
    this.configuredResult = configuredResult;
  }

  public setNextResult(result: Partial<StructuredGradingOutput>) {
    this.configuredResult = result;
  }

  async gradePhotos(input: VisionGradingInput): Promise<StructuredGradingOutput> {
    if (this.configuredResult) {
      return validateStructuredGradingOutput({
        materialDetected: this.configuredResult.materialDetected || input.materialSubtype || 'corrugated_cardboard',
        grade: this.configuredResult.grade || 'B',
        confidence: this.configuredResult.confidence !== undefined ? this.configuredResult.confidence : 0.88,
        damage: this.configuredResult.damage || [{ type: 'corner_fraying', severity: 'minor', region: 'top_corners' }],
        contamination: this.configuredResult.contamination || [{ type: 'adhesive_tape_labels', severity: 'low' }],
        reusableUnitsEstimate: this.configuredResult.reusableUnitsEstimate ?? 180,
        notes: this.configuredResult.notes || 'Automated inspection: structurally sound packaging lot with minor edge wear.',
      });
    }

    // Default deterministic evaluation based on listing input properties
    const isClean = !input.description.toLowerCase().includes('damaged') && !input.description.toLowerCase().includes('reject');
    const isSevere = input.description.toLowerCase().includes('reject') || input.description.toLowerCase().includes('heavily broken');

    const grade: GradingGrade = isSevere ? 'reject' : isClean ? 'A' : 'B';
    const confidence = isClean ? 0.92 : 0.78;

    return {
      materialDetected: input.materialSubtype || 'corrugated_cardboard',
      grade,
      confidence,
      damage: isClean
        ? []
        : [{ type: 'creasing_tear', severity: 'minor', region: 'outer_surface' }],
      contamination: isClean
        ? [{ type: 'dust_dirt_fouling', severity: 'none' }]
        : [{ type: 'adhesive_tape_labels', severity: 'low' }],
      reusableUnitsEstimate: 100,
      notes: `Deterministic evaluation for ${input.title}. Evaluated ${input.photos.length} multi-angle photographs.`,
    };
  }
}

export function validateStructuredGradingOutput(raw: any): StructuredGradingOutput {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid model output: expected JSON object');
  }

  const validGrades: GradingGrade[] = ['A', 'B', 'C', 'reject'];
  const rawGrade = String(raw.grade || '').trim();
  if (!validGrades.includes(rawGrade as GradingGrade)) {
    throw new Error(`Invalid model grade: "${rawGrade}". Must be one of A, B, C, reject`);
  }

  const confidence = Number(raw.confidence);
  if (isNaN(confidence) || confidence < 0 || confidence > 1) {
    throw new Error(`Invalid confidence value: "${raw.confidence}". Must be a number between 0.0 and 1.0`);
  }

  const validDamageSeverities: DamageSeverity[] = ['minor', 'moderate', 'severe'];
  const damage = Array.isArray(raw.damage)
    ? raw.damage.map((d: any) => ({
        type: String(d.type || 'unspecified_damage').trim().slice(0, 100),
        severity: validDamageSeverities.includes(d.severity) ? d.severity : 'minor',
        region: d.region ? String(d.region).trim().slice(0, 100) : undefined,
      }))
    : [];

  const validContamSeverities: ContaminationSeverity[] = ['none', 'low', 'moderate', 'high'];
  const contamination = Array.isArray(raw.contamination)
    ? raw.contamination.map((c: any) => ({
        type: String(c.type || 'unspecified_contamination').trim().slice(0, 100),
        severity: validContamSeverities.includes(c.severity) ? c.severity : 'low',
      }))
    : [];

  const reusableUnitsEstimate =
    raw.reusableUnitsEstimate !== undefined && raw.reusableUnitsEstimate !== null && !isNaN(Number(raw.reusableUnitsEstimate))
      ? Math.max(0, Math.round(Number(raw.reusableUnitsEstimate)))
      : undefined;

  return {
    materialDetected: String(raw.materialDetected || 'unknown').trim().slice(0, 150),
    grade: rawGrade as GradingGrade,
    confidence: Math.round(confidence * 1000) / 1000,
    damage,
    contamination,
    reusableUnitsEstimate,
    notes: String(raw.notes || '').trim().slice(0, 2000),
  };
}

let activeVisionProvider: IVisionGradingProvider | null = null;

export function getVisionGradingProvider(): IVisionGradingProvider {
  if (activeVisionProvider) return activeVisionProvider;

  const apiKey = process.env.GEMINI_API_KEY;
  if (process.env.NODE_ENV !== 'test' && apiKey) {
    activeVisionProvider = new GeminiVisionGradingProvider(apiKey);
  } else {
    activeVisionProvider = new DeterministicTestVisionProvider();
  }

  return activeVisionProvider;
}

export function setVisionGradingProvider(provider: IVisionGradingProvider | null) {
  activeVisionProvider = provider;
}
