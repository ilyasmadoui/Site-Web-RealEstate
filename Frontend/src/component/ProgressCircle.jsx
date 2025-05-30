export default function ProgressCircle({ reviewed, total }) {
  const percentage = (reviewed / total) * 100;
  const radius = 80; 
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-circle-container">
      <svg width="180" height="180"> 
        <circle
          cx="90" 
          cy="90" 
          r={radius}
          stroke="#e0e0e0"
          strokeWidth="12"
          fill="transparent"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="#6C63FF"
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
        />
        <text x="50%" y="50%" textAnchor="middle" dy=".3em" fontSize="20px" fill="#333">
          {Math.round(percentage)}%
        </text>
      </svg>
    </div>
  );
}
