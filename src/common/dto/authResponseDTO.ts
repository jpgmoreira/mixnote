import { StartupDTO } from './startupDTO';

export type AuthResponseDTO =
  | {
      status: 'error';
      errorMsg: string;
    }
  | {
      status: 'success';
      data: StartupDTO;
    };
