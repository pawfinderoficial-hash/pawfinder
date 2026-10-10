"use client";

import { AlertCircle, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function FormStepper({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  return (
    <div className="space-y-2" aria-label={`Paso ${currentStep + 1} de ${steps.length}`}>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-primary">
          Paso {currentStep + 1} de {steps.length}
        </span>
        <span className="truncate font-medium text-muted-foreground">
          {steps[currentStep]}
        </span>
      </div>
      <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${steps.length}, 1fr)` }}>
        {steps.map((step, index) => (
          <span
            key={step}
            className={cn(
              "h-1.5 rounded-full transition-colors",
              index <= currentStep ? "bg-primary" : "bg-muted",
            )}
            aria-hidden
          />
        ))}
      </div>
    </div>
  );
}

export function FormStepActions({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  submitting = false,
  submitLabel,
  submittingLabel = "Publicando…",
}: {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  submitting?: boolean;
  submitLabel: string;
  submittingLabel?: string;
}) {
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="sticky bottom-20 z-20 -mx-5 flex gap-2 border-t border-border/60 bg-background/95 px-5 py-3 backdrop-blur-xl">
      {currentStep > 0 ? (
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="shrink-0"
          onClick={onBack}
          disabled={submitting}
        >
          <ArrowLeft className="size-4" />
          Atrás
        </Button>
      ) : null}
      {isLastStep ? (
        <Button
          type="submit"
          size="lg"
          className="pf-btn-emphasis flex-1 shadow-none"
          disabled={submitting}
        >
          {submitting ? submittingLabel : submitLabel}
        </Button>
      ) : (
        <Button type="button" size="lg" className="flex-1" onClick={onNext}>
          Continuar
          <ArrowRight className="size-4" />
        </Button>
      )}
    </div>
  );
}

export function FormErrors({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;

  return (
    <div
      className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
      role="alert"
    >
      <AlertCircle className="size-5 shrink-0" />
      <ul className="list-inside list-disc space-y-0.5">
        {errors.map((error) => (
          <li key={error}>{error}</li>
        ))}
      </ul>
    </div>
  );
}
