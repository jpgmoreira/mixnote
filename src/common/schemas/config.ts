import { YesNo } from '@common/types/yesNo';

export type ProfileConfig = {
  highFrequencyProbability: number;
  lowFrequencyProbability: number;
  reviewBucket: YesNo[];
};

export function getEmptyProfileConfig(): ProfileConfig {
  return {
    highFrequencyProbability: 0.3,
    lowFrequencyProbability: 0.1,
    reviewBucket: ['no'],
  };
}
