"use client";

import { AlertTriangleIcon, ClockIcon, ShieldIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { assessDentalTriage, type TriageInput } from "@/lib/triage";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Checkbox } from "../ui/checkbox";

const INITIAL_TRIAGE: TriageInput = {
  severeSwelling: false,
  fever: false,
  uncontrolledBleeding: false,
  traumaToFaceOrTooth: false,
  severePain: false,
  painMoreThan48Hours: false,
  troubleOpeningMouth: false,
  badTasteOrPus: false,
};

const questions: Array<{ key: keyof TriageInput; label: string }> = [
  { key: "severeSwelling", label: "Severe face or gum swelling" },
  { key: "fever", label: "Fever with dental symptoms" },
  { key: "uncontrolledBleeding", label: "Bleeding that does not stop" },
  { key: "traumaToFaceOrTooth", label: "Recent tooth or facial trauma" },
  { key: "severePain", label: "Severe tooth pain right now" },
  { key: "painMoreThan48Hours", label: "Pain lasting more than 48 hours" },
  {
    key: "troubleOpeningMouth",
    label: "Trouble opening mouth or jaw stiffness",
  },
  {
    key: "badTasteOrPus",
    label: "Bad taste, pus, or possible infection signs",
  },
];

function EmergencyTriageCard() {
  const [input, setInput] = useState<TriageInput>(INITIAL_TRIAGE);
  const result = useMemo(() => assessDentalTriage(input), [input]);

  const levelStyles = {
    EMERGENCY: "text-red-600 bg-red-100 border-red-200",
    URGENT: "text-amber-700 bg-amber-100 border-amber-200",
    ROUTINE: "text-green-700 bg-green-100 border-green-200",
  }[result.level];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldIcon className="size-5 text-primary" />
          Emergency Triage Check
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Quick self-check to identify whether you need emergency, urgent, or
          routine care.
        </p>

        <div className="grid md:grid-cols-2 gap-3">
          {questions.map((question) => (
            <label
              key={question.key}
              htmlFor={`triage-${question.key}`}
              className="flex items-start gap-2 rounded-md border p-3 cursor-pointer"
            >
              <Checkbox
                id={`triage-${question.key}`}
                checked={input[question.key]}
                onCheckedChange={(checked) =>
                  setInput((prev) => ({
                    ...prev,
                    [question.key]: Boolean(checked),
                  }))
                }
              />
              <span className="text-sm">{question.label}</span>
            </label>
          ))}
        </div>

        <div className={`rounded-lg border px-4 py-3 ${levelStyles}`}>
          <p className="font-semibold">{result.title}</p>
          <p className="text-sm mt-1">{result.summary}</p>
        </div>

        <div className="space-y-2">
          {result.nextSteps.map((step) => (
            <div key={step} className="flex items-start gap-2 text-sm">
              {result.level === "EMERGENCY" ? (
                <AlertTriangleIcon className="size-4 mt-0.5 text-red-600" />
              ) : (
                <ClockIcon className="size-4 mt-0.5 text-primary" />
              )}
              <span>{step}</span>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          <Link href="/appointments">
            <Button size="sm">Book Appointment</Button>
          </Link>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setInput(INITIAL_TRIAGE)}
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default EmergencyTriageCard;
