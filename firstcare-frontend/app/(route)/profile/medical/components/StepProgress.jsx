// /app/(route)/profile/medical/components/StepProgress.jsx

export const StepProgress = ({ activeStep, steps }) => {
    return (
        <div className="mb-8 bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Step {activeStep + 1} of {steps.length}</span>
                <span className="text-sm font-medium text-blue-600">
                    {Math.round(((activeStep + 1) / steps.length) * 100)}% Complete
                </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                    className="bg-gradient-to-r from-blue-500 to-teal-500 h-2 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                ></div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
                {steps.map((step, index) => (
                    <span key={index} className={index === activeStep ? 'font-medium text-blue-600' : ''}>
                        {step.title}
                    </span>
                ))}
            </div>
        </div>
    );
};