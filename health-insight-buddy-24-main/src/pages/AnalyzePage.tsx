import { useState } from "react";
import Navbar from "@/components/Navbar";
import AnalysisForm from "@/components/AnalysisForm";
import ResultsDashboard from "@/components/ResultsDashboard";
import type { AnalysisInput, AnalysisResult } from "@/types/analysis";

const AnalyzePage = () => {
  const [state, setState] = useState<{ input: AnalysisInput; result: AnalysisResult } | null>(null);

  if (state) {
    return (
      <>
        <Navbar />
        <ResultsDashboard input={state.input} result={state.result} onBack={() => setState(null)} />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AnalysisForm onResult={(input, result) => setState({ input, result })} />
    </>
  );
};

export default AnalyzePage;
