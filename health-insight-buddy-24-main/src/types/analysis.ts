export interface AnalysisInput {
  name: string;
  age: number;
  gender: string;
  symptoms: string;
  medical_history: string;
}

export interface AnalysisResult {
  disease_name: string;
  description: string;
  risk_level: "Low" | "Medium" | "High";
  precautions: string[];
  things_to_avoid: string[];
  recommendations: string[];
  chart_data: { name: string; value: number; color: string }[];
}

export interface SavedAnalysis extends AnalysisInput, AnalysisResult {
  id: string;
  created_at: string;
}
