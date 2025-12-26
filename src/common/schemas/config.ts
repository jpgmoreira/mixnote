export type ProfileConfig = {
  highFrequencyProbability: number;
  lowFrequencyProbability: number;
  reviewBucket: boolean;
};

export function getEmptyProfileConfig(): ProfileConfig {
  return {
    highFrequencyProbability: 0.3,
    lowFrequencyProbability: 0.1,
    reviewBucket: false,
  };
}
