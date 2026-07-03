export const isNotAuth = (res, callback) => {
  if (res.status === 401 || res.status === 403) {
    callback();
  }
  return;
};
