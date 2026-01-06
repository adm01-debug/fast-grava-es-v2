import * as React from "react";
import { motion } from "framer-motion";
import { useForm, useFieldArray, Controller, FieldValues, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, Check, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
  validation?: z.ZodObject<any>;
}

interface FormField {
  name: string;
  label: string;
  type: "text" | "email" | "password" | "number" | "textarea" | "select" | "checkbox" | "radio" | "date" | "custom";
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  component?: React.ComponentType<any>;
  helpText?: string;
  colSpan?: 1 | 2;
}

interface MultiStepFormProps {
  steps: FormStep[];
  onSubmit: (data: any) => Promise<void>;
  onStepChange?: (step: number) => void;
  initialData?: Record<string, any>;
  submitLabel?: string;
  className?: string;
}

export function MultiStepForm({
  steps,
  onSubmit,
  onStepChange,
  initialData = {},
  submitLabel = "Finalizar",
  className,
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [completedSteps, setCompletedSteps] = React.useState<Set<number>>(new Set());

  // Combine all validations
  const combinedSchema = React.useMemo(() => {
    const schemas = steps.map((step) => step.validation || z.object({}));
    return schemas.reduce((acc, schema) => acc.merge(schema), z.object({}));
  }, [steps]);

  const form = useForm({
    resolver: zodResolver(combinedSchema),
    defaultValues: initialData,
    mode: "onChange",
  });

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const step = steps[currentStep];

  // Validate current step fields
  const validateStep = async () => {
    const fields = step.fields.map((f) => f.name);
    const result = await form.trigger(fields as any);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateStep();
    if (isValid) {
      setCompletedSteps((prev) => new Set([...prev, currentStep]));
      if (!isLastStep) {
        setCurrentStep((prev) => prev + 1);
        onStepChange?.(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  const handleSubmit = async (data: any) => {
    const isValid = await validateStep();
    if (!isValid) return;

    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToStep = (index: number) => {
    // Only allow going to completed steps or the next step
    if (index <= currentStep || completedSteps.has(index - 1)) {
      setCurrentStep(index);
      onStepChange?.(index);
    }
  };

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        {/* Progress indicators */}
        <div className="space-y-4">
          <Progress value={progress} className="h-2" />

          <div className="flex justify-between">
            {steps.map((s, index) => (
              <button
                key={s.id}
                onClick={() => goToStep(index)}
                disabled={index > currentStep && !completedSteps.has(index - 1)}
                className={cn(
                  "flex flex-col items-center gap-1 transition-colors",
                  index === currentStep
                    ? "text-primary"
                    : completedSteps.has(index)
                    ? "text-success"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border-2",
                    index === currentStep
                      ? "border-primary bg-primary text-primary-foreground"
                      : completedSteps.has(index)
                      ? "border-success bg-success text-success-foreground"
                      : "border-muted"
                  )}
                >
                  {completedSteps.has(index) ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    index + 1
                  )}
                </div>
                <span className="text-xs hidden sm:block">{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <CardTitle>{step.title}</CardTitle>
          {step.description && (
            <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
          )}
        </div>
      </CardHeader>

      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <CardContent>
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 gap-4"
          >
            {step.fields.map((field) => (
              <FormFieldComponent
                key={field.name}
                field={field}
                form={form}
              />
            ))}
          </motion.div>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Anterior
          </Button>

          {isLastStep ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {submitLabel}
            </Button>
          ) : (
            <Button type="button" onClick={handleNext}>
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}

// Individual field renderer
function FormFieldComponent({
  field,
  form,
}: {
  field: FormField;
  form: UseFormReturn<any>;
}) {
  const error = form.formState.errors[field.name];

  const colSpanClass = field.colSpan === 2 ? "col-span-2" : "col-span-1";

  return (
    <div className={cn("space-y-2", colSpanClass)}>
      <Label htmlFor={field.name} className="flex items-center gap-1">
        {field.label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>

      <Controller
        name={field.name}
        control={form.control}
        render={({ field: formField }) => {
          switch (field.type) {
            case "textarea":
              return (
                <Textarea
                  {...formField}
                  id={field.name}
                  placeholder={field.placeholder}
                  className={cn(error && "border-destructive")}
                />
              );

            case "select":
              return (
                <select
                  {...formField}
                  id={field.name}
                  className={cn(
                    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
                    error && "border-destructive"
                  )}
                >
                  <option value="">Selecione...</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              );

            case "checkbox":
              return (
                <div className="flex items-center space-x-2">
                  <input
                    {...formField}
                    type="checkbox"
                    id={field.name}
                    checked={formField.value}
                    className="h-4 w-4"
                  />
                </div>
              );

            case "custom":
              if (field.component) {
                const CustomComponent = field.component;
                return <CustomComponent {...formField} error={error} />;
              }
              return null;

            default:
              return (
                <Input
                  {...formField}
                  type={field.type}
                  id={field.name}
                  placeholder={field.placeholder}
                  className={cn(error && "border-destructive")}
                />
              );
          }
        }}
      />

      {field.helpText && !error && (
        <p className="text-xs text-muted-foreground">{field.helpText}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-xs text-destructive flex items-center gap-1"
        >
          <AlertCircle className="h-3 w-3" />
          {error.message as string}
        </motion.p>
      )}
    </div>
  );
}

// Inline validation input component
interface ValidatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  success?: boolean;
  helpText?: string;
  isValidating?: boolean;
}

export function ValidatedInput({
  label,
  error,
  success,
  helpText,
  isValidating,
  className,
  ...props
}: ValidatedInputProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="flex items-center gap-1">
        {label}
        {props.required && <span className="text-destructive">*</span>}
      </Label>

      <div className="relative">
        <Input
          {...props}
          className={cn(
            className,
            error && "border-destructive focus-visible:ring-destructive",
            success && "border-success focus-visible:ring-success"
          )}
        />

        {isValidating && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}

        {!isValidating && success && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <Check className="h-4 w-4 text-success" />
          </motion.div>
        )}

        {!isValidating && error && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <AlertCircle className="h-4 w-4 text-destructive" />
          </motion.div>
        )}
      </div>

      {helpText && !error && (
        <p className="text-xs text-muted-foreground">{helpText}</p>
      )}

      {error && (
        <motion.p
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="text-xs text-destructive"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
