import { IUser, IWorkspace, IProject } from './index';

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
      isAdmin?: boolean;
      workspace?: IWorkspace;
      project?: IProject;
      refreshToken?: string;
    }
  }
}
