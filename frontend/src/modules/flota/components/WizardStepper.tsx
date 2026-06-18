interface Props {
  currentStep: number;
}

const STEPS = ["Datos de recogida", "Fecha y hora", "Selección de flota", "Confirmación"];

export function WizardStepper({ currentStep }: Props) {
  return (
    <div className="flex items-center justify-between relative">
      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-[2px] bg-surface-variant z-0" />

      {STEPS.map((label, i) => {
        const stepNum = i + 1;
        const isCompleted = stepNum < currentStep;
        const isActive = stepNum === currentStep;

        return (
          <div key={label} className="relative z-10 flex flex-col items-center">
            {isCompleted ? (
              <>
                <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md shadow-sm">
                  <span className="material-symbols-outlined text-[18px]">check</span>
                </div>
                <span className="mt-2 font-label-sm text-primary-container">{label}</span>
              </>
            ) : isActive ? (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-primary-container bg-surface-lowest text-primary-container flex items-center justify-center font-label-md shadow-sm ring-4 ring-primary-fixed">
                  {stepNum}
                </div>
                <span className="mt-2 font-label-sm text-primary-container font-semibold">{label}</span>
              </>
            ) : (
              <>
                <div className="w-8 h-8 rounded-full border-2 border-outline-variant bg-surface-lowest text-outline flex items-center justify-center font-label-md opacity-50">
                  {stepNum}
                </div>
                <span className="mt-2 font-label-sm text-outline">{label}</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
