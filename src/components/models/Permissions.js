// @flow

type Permission = {
  streamId: string,
  level: 'read'|'contribute'|'manage',
  defaultName: ?string,
  name: ?string,
};

export type PermissionsList = Array<Permission>;

class Permissions {
  list: PermissionsList;

  constructor (permissionsList: string|PermissionsList) {
    if (typeof permissionsList === 'string') {
      this.list = JSON.parse(permissionsList);
    } else {
      this.list = permissionsList;
    }
  }

  updateList (newList: PermissionsList): PermissionsList {
    this.list = newList;
    // Permissions may contain 'name' or 'defaultName' attributes
    // These fields make sense for auth request but not for access creation/update
    this.list.forEach(permission => {
      if (permission.name) delete permission.name;
      if (permission.defaultName) delete permission.defaultName;
    });
    return this.list;
  }
}

export default Permissions;
