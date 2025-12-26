export type Settings = {
  highFrequencyProbability: number;
  lowFrequencyProbability: number;
  reviewBucket: boolean;
};

export function getEmptySettings(): Settings {
  return {
    highFrequencyProbability: 0.3,
    lowFrequencyProbability: 0.1,
    reviewBucket: false,
  };
}
