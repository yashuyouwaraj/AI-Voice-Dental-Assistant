export type TriageInput = {
  severeSwelling: boolean;
  fever: boolean;
  uncontrolledBleeding: boolean;
  traumaToFaceOrTooth: boolean;
  severePain: boolean;
  painMoreThan48Hours: boolean;
  troubleOpeningMouth: boolean;
  badTasteOrPus: boolean;
};

export type TriageLevel = "EMERGENCY" | "URGENT" | "ROUTINE";

export type TriageResult = {
  level: TriageLevel;
  title: string;
  summary: string;
  nextSteps: string[];
};

export function assessDentalTriage(input: TriageInput): TriageResult {
  const emergencySignals =
    input.uncontrolledBleeding || (input.severeSwelling && input.fever);
  const urgentSignals =
    input.traumaToFaceOrTooth ||
    input.severePain ||
    input.painMoreThan48Hours ||
    input.troubleOpeningMouth ||
    input.badTasteOrPus;

  if (emergencySignals) {
    return {
      level: "EMERGENCY",
      title: "Emergency Care Recommended",
      summary: "Your answers suggest a potentially serious dental emergency.",
      nextSteps: [
        "Seek emergency dental or hospital care immediately.",
        "Do not delay if swelling is spreading or bleeding is not stopping.",
        "If breathing or swallowing becomes difficult, call local emergency services now.",
      ],
    };
  }

  if (urgentSignals) {
    return {
      level: "URGENT",
      title: "Urgent Dentist Visit Recommended",
      summary: "You should be seen by a dentist as soon as possible.",
      nextSteps: [
        "Book the earliest available appointment today or within 24 hours.",
        "Avoid very hot/cold foods and chew on the opposite side.",
        "If symptoms worsen (fever, swelling, bleeding), escalate to emergency care.",
      ],
    };
  }

  return {
    level: "ROUTINE",
    title: "Routine Care Is Appropriate",
    summary: "No high-risk signs detected from your current answers.",
    nextSteps: [
      "Book a regular dental checkup at your convenience.",
      "Maintain brushing, flossing, hydration, and avoid sugary snacks.",
      "Re-check triage if pain or swelling develops.",
    ],
  };
}
