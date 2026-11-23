// ============================================================
// components/Stepper.jsx
// Top step navigation bar
// ============================================================

import React from 'react';

const STEPS = [
  { icon: '📂', label: 'Upload' },
  { icon: '🔀', label: 'Merge' },
  { icon: '🧹', label: 'Quality' },
  { icon: '📊', label: 'Preview' },
  { icon: '⬇',  label: 'Download' },
];

export function Stepper({ currentStep, onStepClick }) {
  return (
    <div className="stepper">
      {STEPS.map((step, i) => {
        const state = i === currentStep ? 'active' : i < currentStep ? 'done' : 'idle';
        return (
          <button
            key={i}
            className={`step-btn ${state}`}
            onClick={() => onStepClick(i)}
            title={`Step ${i + 1}: ${step.label}`}
          >
            <span className="step-num">
              {state === 'done' ? '✓' : i + 1}
            </span>
            <span>{step.icon}</span>
            <span>{step.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { STEPS };
