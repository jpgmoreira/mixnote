import { YesNo } from '@common/types/yesNo';

export type AppConfig = {
  hfProbability: number; // High frequency;
  lfProbability: number; // Low frequency
  reviewBucket: YesNo[];
};

export function getEmptyAppConfig(): AppConfig {
  return {
    hfProbability: 0.3,
    lfProbability: 0.1,
    reviewBucket: ['no'],
  };
}
