declare namespace Express {
    interface Request {
      user?: User;
      repository?: Repository;
      target_user?: User;
      resource?: Resource;


    }
}
