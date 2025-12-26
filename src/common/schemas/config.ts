import { YesNo } from '@common/types/yesNo';

export type AppConfig = {
  highFrequencyProbability: number;
  lowFrequencyProbability: number;
  reviewBucket: YesNo[];
};

export function getEmptyAppConfig(): AppConfig {
  return {
    highFrequencyProbability: 0.3,
    lowFrequencyProbability: 0.1,
    reviewBucket: ['no'],
  };
}
