// @flow

type Permission = {
  streamId: string,
  level: 'read'|'contribute'|'manage',
  defaultName: ?string,
};

class Permissions {
  list: Array<Permission>;

  constructor (permissionsList: string|Array<Permission>) {
    if (typeof permissionsList === 'string') {
      this.list = JSON.parse(permissionsList);
    } else if (Array.isArray(permissionsList)) {
      this.list = permissionsList;
    }
  }

  updateList (newList: Array<Permission>): Array<Permission> {
    this.list = newList;
    return this.list;
  }
}

export default Permissions;
