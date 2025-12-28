import { YesNo } from '@common/types/yesNo';

export type AppConfig = {
  hfProbability: number; // High frequency;
  lfProbability: number; // Low frequency
  reviewBucket: YesNo[];
};

export const DEFAULT_HF_PROBABILITY = 0.3;
export const DEFAULT_LF_PROBABILITY = 0.1;

export function getEmptyAppConfig(): AppConfig {
  return {
    hfProbability: DEFAULT_HF_PROBABILITY,
    lfProbability: DEFAULT_LF_PROBABILITY,
    reviewBucket: ['no'],
  };
}
