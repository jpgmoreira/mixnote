import { StartupDTO } from './startupDTO';

export type CreateProfileResponseDTO =
  | {
      status: 'error';
      errorMsg: string;
    }
  | {
      status: 'success';
      data: StartupDTO;
    };
