///////////
// GROUP //
///////////

// group
function Group_Model(group, selected) {

    // self
    var self = this;
    // members
    this.id = ko.observable();
    this.name = ko.observable();
    this.assigned_permission_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // select group
    this.select = function() {
        self.selected(!self.selected());
    };

    // initialize
    if (!group)
        return;

    // mapping
    ko.mapping.fromJS(group, {}, this);

};

////////////////
// PERMISSION //
////////////////

// permission
function Permission_Model(permission, selected) {

    // self
    var self = this;
    // members
    this.id = ko.observable();
    this.area = ko.observable();
    this.permission = ko.observable();
    this.description = ko.observable();
    this.actions = ko.observableArray();
    this.assigned_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // read/write actions from input
    this.entered_actions = ko.computed({
        read: function () { return self.actions().join(','); },
        write: function (value) { (value == "") ? self.actions([]) : self.actions(value.split(',')); },
        owner: self
    });

    // select permission
    this.select = function() {
        self.selected(!self.selected());
    };

    // initialize
    if (!permission)
        return;

    // mapping
    ko.mapping.fromJS(permission, {}, this);

};

//////////
// ROLE //
//////////

// role
function Role_Model(role, selected) {

    // self
    var self = this;
    // members
    this.id = ko.observable();
    this.name = ko.observable();
    this.filter = ko.observable();
    this.assigned_permission_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // filter css
    this.filter_css = ko.computed(function() {

        // switch on filter
        switch (self.filter()) {
            case 'A':
                return 'label-success';
            case 'D':
                return 'label-warning';
            case 'R':
                return 'label-important';
            default:
                return null;
        };

    });

    // filter text
    this.filter_text = ko.computed(function() {

        // switch on filter
        switch (self.filter()) {
            case 'A':
                return 'ALL ACCESS';
            case 'D':
                return 'NO ACCESS';
            case 'R':
                return 'REVOKE PERMISSIONS';
            default:
                return null;
        };

    });

    // select role
    this.select = function() {
        self.selected(!self.selected());
    };

    // initialize
    if (!role)
        return;

    // mapping
    ko.mapping.fromJS(role, {}, this);

};

//////////
// USER //
//////////

// user metadata
function User_Metadata_Model(user_metadata) {

    // members
    this.id = ko.observable();
    this.key = ko.observable();
    this.value = ko.observable();
    this.selected = ko.observable(false);
    // mapping
    ko.mapping.fromJS(user_metadata, {
        'include': [ 'key', 'value' ]
    }, this);

};

// user
function User_Model(user, selected) {

    // members
    this.id = ko.observable();
    this.username = ko.observable();
    this.password = ko.observable();
    this.email = ko.observable();
    this.assigned_permission_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // initialize
    if (!user)
        return;

    // mapping
    ko.mapping.fromJS(user, {}, this);

};

// user profile
function User_Profile_Model(user_profile) {

    // self
    var self = this;
    // members
    this.metadatas = ko.observableArray([]);
    this.id = ko.observable();

    // selected metadatas count
    this.selected_metadatas_count = ko.computed(function() {
        var count = 0;
        // get selected metadatas
        ko.utils.arrayForEach(self.metadatas(), function(metadata) {
            if (metadata.selected()) { count++; }
        });
        return count;
    });

    // select all metadatas
    this.select_all = function() {
        // if we have no selected metadatas, select them all
        var none_selected = (self.selected_metadatas_count() == 0);
        // select all metadatas
        ko.utils.arrayForEach(self.metadatas(), function(metadata) {
            metadata.selected(none_selected);
        });
    };

    // add metadata
    this.add = function() {
        self.metadatas.push(new User_Metadata_Model());
    };

    // remove metadatas
    this.remove = function() {
        var selected_metadatas = [];
        // get all selected metadatas
        ko.utils.arrayForEach(self.metadatas(), function(metadata) {
            if (metadata.selected()) selected_metadatas.push(metadata);
        });
        // remove all selected metadatas
        self.metadatas.removeAll(selected_metadatas);
    };

    // mapping
    ko.mapping.fromJS(user_profile, {
        'metadatas': { create: function(options) { return new User_Metadata_Model(options.data); } }
    }, this);

};

///////////////////////
// AUTHORITY MANAGER //
///////////////////////

// manager index model
function Manager_Index_Model() {

    // self
    var self = this;
    // inherit
    Component_Model.call(this);
    // item arrays
    this.users = ko.observableArray();
    this.groups = ko.observableArray();
    this.roles = ko.observableArray();
    this.permissions = ko.observableArray();
    // modified item arrays
    this.modified_users = ko.observableArray();
    this.modified_groups = ko.observableArray();
    this.modified_roles = ko.observableArray();
    this.modified_permissions = ko.observableArray();
    // filtered item arrays
    this.users_filter = ko.observable('');
    this.groups_filter = ko.observable('');
    this.roles_filter = ko.observable('');
    this.permissions_filter = ko.observable('');
    // mode
    this.current_type = ko.observable('');

    //////////////
    // MESSAGES //
    //////////////

    // fail
    this.fail = function(message) {
        alert('Failure Occurred, Try Again (' + message + ')');
    };

    // warn
    this.warn = function(message) {
        alert('Warning: ' + message);
    };

    //////////////////
    // ARRAY FILTER //
    //////////////////

    // filter
    this.filter = function(array, properties, filter) {

        // if we have no filter, return array
        if (filter == '')
            return array;
        // ensure properties is array
        if (!(properties instanceof Array))
            properties = [ properties ];

        // first get filter parts
        var filter_parts = filter.toLowerCase().split(',');
        // filter the array for each part
        return ko.utils.arrayFilter(array, function(item) {

            var found_filter_part = false;
            // loop through properties
            $.each(properties, function(properties_index, property) {
                var item_property_value = item[property]().toLowerCase();
                // loop through filter parts
                $.each(filter_parts, function(filter_part_index, filter_part) {
                    // if we found one of the filter parts in the item
                    if (item_property_value.indexOf(filter_part) !== -1) {
                        // set found and break
                        found_filter_part = true;
                        return false;
                    }
                });
            });

            // keep this item in the array of filtered items if we found one of the filter parts
            return found_filter_part;

        });
    };

    /////////////////////
    // FILTERED ARRAYS //
    /////////////////////

    // filtered users
    this.filtered_users = ko.computed(function() {
        // return standard
        if (self.current_type() == 'User_Model') return self.users();
        // return locally filtered
        return self.filter(self.users(), 'username', self.users_filter());
    });

    // filtered groups
    this.filtered_groups = ko.computed(function() {
        // return standard
        if (self.current_type() == 'Group_Model') return self.groups();
        // return locally filtered
        return self.filter(self.groups(), 'name', self.groups_filter());
    });

    // filtered roles
    this.filtered_roles = ko.computed(function() {
        // return standard
        if (self.current_type() == 'Role_Model') return self.roles();
        // return locally filtered
        return self.filter(self.roles(), 'name', self.roles_filter());
    });

    // filtered permissions
    this.filtered_permissions = ko.computed(function() {
        // return standard
        if (self.current_type() == 'Permission_Model') return self.permissions();
        // return locally filtered
        return self.filter(self.permissions(), 'permission', self.permissions_filter());
    });

    //////////////
    // CLEARING //
    //////////////

    // clear filter
    this.clear_filter = function(filter) {
        if (filter() == '')
            filter.valueHasMutated();
        else
            filter('');
    };

    // clear
    this.clear = function(type) {

        // clear users
        if (type != 'User_Model') {
            self.users.removeAll();
            self.clear_filter(self.users_filter);
        }
        // clear groups
        if (type != 'Group_Model') {
            self.groups.removeAll();
            self.clear_filter(self.groups_filter);
        }
        // clear roles
        if (type != 'Role_Model') {
            self.roles.removeAll();
            self.clear_filter(self.roles_filter);
        }
        // clear permissions
        if (type != 'Permission_Model') {
            self.permissions.removeAll();
            self.clear_filter(self.permissions_filter);
        }

        // if type specified, purge modified for type
        if (type) {
            // get modified array for type
            var modified = self.get_modified(type);
            // clear out
            modified.removeAll();
        }

    };

    /////////////////
    // MODE CHANGE //
    /////////////////

    // mode subscription
    this.current_type.subscribe(function() {
        self.clear();
    });

    //////////////////////////
    // FILTER SUBSCRIPTIONS //
    //////////////////////////

    // users filter subscription
    this.users_filter.subscribe(function(filter) {

        // if we aren't in users mode, run the filter locally
        if (self.current_type() != 'User_Model') return;
        // clear all but users
        self.clear('User_Model');
        // if we are in users mode, filter server side
        $.get('/manager/users.json', { filter: filter }, function (data) {
            self.users(ko.utils.arrayMap(data, function(user) { return new User_Model(user); }));
        });

    });

    // groups filter subscription
    this.groups_filter.subscribe(function(filter) {

        // if we aren't in groups mode, run the filter locally
        if (self.current_type() != 'Group_Model') return;
        // clear all but groups
        self.clear('Group_Model');
        // if we are in groups mode, filter server side
        $.get('/manager/groups.json', { filter: filter }, function (data) {
            self.groups(ko.utils.arrayMap(data, function(group) { return new Group_Model(group); }));
        });

    });

    // roles filter subscription
    this.roles_filter.subscribe(function(filter) {

        // if we aren't in roles mode, run the filter locally
        if (self.current_type() != 'Role_Model') return;
        // clear all but roles
        self.clear('Role_Model');
        // if we are in roles mode, filter server side
        $.get('/manager/roles.json', { filter: filter }, function (data) {
            self.roles(ko.utils.arrayMap(data, function(role) { return new Role_Model(role); }));
        });

    });

    // permissions filter subscription
    this.permissions_filter.subscribe(function(filter) {

        // if we aren't in permissions mode, run the filter locally
        if (self.current_type() != 'Permission_Model') return;
        // clear all but permissions
        self.clear('Permission_Model');
        // if we are in permissions mode, filter server side
        $.get('/manager/permissions.json', { filter: filter }, function (data) {
            self.permissions(ko.utils.arrayMap(data, function(permission) { return new Permission_Model(permission); }));
        });

    });

    ///////////////////////
    // ARRAYS MANAGEMENT //
    ///////////////////////

    // get modified array for type
    this.get_modified = function(type) {
        // switch on item type
        switch (type) {
            case 'User_Model': return self.modified_users;
            case 'Group_Model': return self.modified_groups;
            case 'Role_Model': return self.modified_roles;
            case 'Permission_Model': return self.modified_permissions;
        };

    };

    // get filtered array for type
    this.get_filtered = function(type) {
        // switch on item type
        switch (type) {
            case 'User_Model': return self.filtered_users;
            case 'Group_Model': return self.filtered_groups;
            case 'Role_Model': return self.filtered_roles;
            case 'Permission_Model': return self.filtered_permissions;
        };

    };

    // get filtered array for type
    this.get_array = function(type) {
        // switch on item type
        switch (type) {
            case 'User_Model': return self.users;
            case 'Group_Model': return self.groups;
            case 'Role_Model': return self.roles;
            case 'Permission_Model': return self.permissions;
        };

    };

    // get selected/unselected ids
    this.get_ids = function(array) {

        var selected = [];
        var unselected = [];
        // get all selected and unselected
        ko.utils.arrayForEach(array(), function(item) {
            if (item.selected())
                selected.push(item.id());
            else
                unselected.push(item.id());
        });

        // success
        return {
            'selected': selected,
            'unselected': unselected
        };

    };

    // get selected items
    this.get_selected = function(array) {

        var selected = [];
        // get all selected and unselected
        $.each(array(), function(index, item) {
            if (item.selected())
                selected.push(item);
        });

        // success
        return selected;

    };

    //////////
    // LOAD //
    //////////

    // load assignments
    this.load = function(from_type, to_type) {

        //////////////////////////////////
        // GATHER SELECTED IDS FOR LOAD //
        //////////////////////////////////

        // get filtered array for type
        var from_filtered = self.get_filtered(from_type);
        // get selected ids
        var from_ids = self.get_ids(from_filtered);
        // if we have no selections
        if (from_ids['selected'].length == 0) {
            // clear other sections
            self.clear(from_type);
            // done
            return;
        }

        //////////////////////////////
        // PERFORM LOAD ASSIGNMENTS //
        //////////////////////////////

        // set assignment for selected users
        $.post('/manager/load.json', { from_type: from_type, to_type: to_type, ids: from_ids['selected'] }, function (assignments) {

            // users
            if (assignments['assigned_users']) {
                var assigned_users = ko.utils.arrayMap(assignments['assigned_users'], function(user) { return new User_Model(user, true); });
                self.users(assigned_users);
            }

            // groups
            if (assignments['assigned_groups']) {
                var assigned_groups = ko.utils.arrayMap(assignments['assigned_groups'], function(group) { return new Group_Model(group, true); });
                var unassigned_groups = ko.utils.arrayMap(assignments['unassigned_groups'], function(group) { return new Group_Model(group); });
                self.groups(assigned_groups.concat(unassigned_groups));
            }

            // roles
            if (assignments['assigned_roles']) {
                var assigned_roles = ko.utils.arrayMap(assignments['assigned_roles'], function(role) { return new Role_Model(role, true); });
                var unassigned_roles = ko.utils.arrayMap(assignments['unassigned_roles'], function(role) { return new Role_Model(role); });
                self.roles(assigned_roles.concat(unassigned_roles));
            }

            // permissions
            if (assignments['assigned_permissions']) {

                var assigned_permissions = ko.utils.arrayMap(assignments['assigned_permissions'], function(permission) { return new Permission_Model(permission, true); })
                // process permission actions
                ko.utils.arrayForEach(assigned_permissions, function(assigned_permission) {
                    assigned_permission.assigned_actions(assignments['assigned_permission_actions'][assigned_permission.id()]);
                });
                // add unassigned items and set
                self.permissions(assigned_permissions.concat(ko.utils.arrayMap(assignments['unassigned_permissions'], function(permission) { return new Permission_Model(permission); })));

            }

            // user actions
            if (assignments['assigned_user_permission_actions']) {
                // process assigned user actions
                ko.utils.arrayForEach(assigned_users, function(assigned_user) {
                    assigned_user.assigned_permission_actions(assignments['assigned_user_permission_actions'][assigned_user.id()]);
                });
            }

            // group actions
            if (assignments['assigned_group_permission_actions']) {
                // process assigned group actions
                ko.utils.arrayForEach(assigned_groups, function(assigned_group) {
                    assigned_group.assigned_permission_actions(assignments['assigned_group_permission_actions'][assigned_group.id()]);
                });
            }

            // role actions
            if (assignments['assigned_role_permission_actions']) {
                // process assigned role actions
                ko.utils.arrayForEach(assigned_roles, function(assigned_role) {
                    assigned_role.assigned_permission_actions(assignments['assigned_role_permission_actions'][assigned_role.id()]);
                });
            }

            ////////////////////
            // CLEAR MODIFIED //
            ////////////////////

            // clear from modified
            var from_modified = self.get_modified(from_type);
            from_modified.removeAll();
            // clear to modified if we have it
            if (to_type) {
                var to_modified = self.get_modified(to_type);
                to_modified.removeAll();
            }

        }).fail(function() {

            // fail & clear
            self.fail('Load');
            self.clear(from_type);

        });

    };

    ////////////
    // ASSIGN //
    ////////////

    // assign
    this.assign = function(from_type, to_type) {

        // get filtered array for type
        var from_filtered = self.get_filtered(from_type);
        var to_modified = self.get_modified(to_type);
        // get selected from type and to type ids
        var from_ids = self.get_ids(from_filtered);
        var to_ids = self.get_ids(to_modified);
        // get call to do assignments
        $.post('/manager/assign.json', {
            from_type: from_type,
            to_type: to_type,
            from_ids: from_ids['selected'],
            assign_to_ids: to_ids['selected'],
            unassign_to_ids: to_ids['unselected']
        }, function() {
            // reload
            self.load(from_type, to_type);
        }).fail(function() {
            // fail
            self.fail('Assign');
        });

    };

    // assign
    this.assign_permission_actions = function(item, permission_action, assign) {

        var perms_ids;
        var from_ids;
        var from_type;
        // get item type
        var type = item.constructor.name;
        // if we have a specific permission, it is the only to id
        if (type == 'Permission_Model') {
            // from type is current type
            from_type = self.current_type();
            // get from filtered
            var from_filtered = self.get_filtered(from_type);
            // from ids are those selected of the current type
            from_ids = self.get_ids(from_filtered);
            from_ids = from_ids['selected'];
            // permission ids are those of the clicked permission item
            perms_ids = [ item.id() ];
        } else {
            // from type is item type
            from_type = type;
            // from ids are that of the item
            from_ids = [ item.id() ];
            // get to filtered permissions
            var to_filtered = self.get_filtered('Permission_Model');
            // get to ids
            var to_ids = self.get_ids(to_filtered);
            // get perm ids
            perms_ids = to_ids['selected'];
        }

        // get call to do assignments
        $.post('/manager/assign_permission_actions.json', {
            from_type: from_type,
            from_ids: from_ids,
            perms_ids: perms_ids,
            permission_action: permission_action,
            assign: assign
        }, function() {
            // reload
            if (type != 'Permission_Model')
                self.load('Permission_Model');
            else
                self.load(from_type, 'Permission_Model');
        }).fail(function() {
            // fail
            self.fail('Assign Permission Action');
        });

    };

    /////////////////
    // LOAD/ASSIGN //
    /////////////////

    // users
    this.load_assign = function(type) {

        // get mode
        var current_type = this.current_type();
        // load or assign
        if (type == current_type)
            self.load(current_type);
        else
            self.assign(current_type, type);

    };

    ////////////
    // SELECT //
    ////////////

    // select item
    this.select = function(item) {

        // invert item selection
        item.selected(!item.selected());
        // get item type
        var type = item.constructor.name;
        // get modified array for this type
        var modified = self.get_modified(type);
        // push modified item to array
        modified.push(item);
        // load assign based on item type
        self.load_assign(type);

    };

    // select all items
    this.select_all = function(type) {

        // get filtered array for this type
        var filtered = self.get_filtered(type);
        // verify we have at least one item
        if (filtered().length == 0)
            return;

        // get modified array for this type
        var modified = self.get_modified(type);
        // get selected status of first item
        var selected = !filtered()[0].selected();
        // invert selection
        ko.utils.arrayForEach(filtered(), function(item) {
            // see if it was modified
            if (item.selected() != selected)
                modified.push(item);
            // invert item selection
            item.selected(selected);
        });

        // load/assign items
        self.load_assign(type);

    };

    ////////////////
    // ADD/MODIFY //
    ////////////////

    this.add_modify = function(modify) {

        // reset the modal
        window.standard.modal.reset();

        var object;
        // get mode
        var current_type = self.current_type();
        // if we are modifying, set modal object to current
        if (modify) {

            // get filtered array for type
            var filtered = self.get_filtered(current_type);
            // get selected from type and to type ids
            var selected = self.get_selected(filtered);
            // verify only one selected
            if (selected.length != 1)
                return;

            // set original object
            window.standard.modal.original_object = selected[0];
            // deep copy selected to modal
            object = new window[current_type](ko.mapping.toJS(window.standard.modal.original_object));

        } else {

            // create new blank type
            object = new window[current_type]();

        }

        // switch on type
        switch (current_type) {
            case 'User_Model':
                window.standard.modal.title('ADD USER');
                window.standard.modal.template('user-form');
                break;
            case 'Group_Model':
                window.standard.modal.title('ADD GROUP');
                window.standard.modal.template('group-form');
                break;
            case 'Role_Model':
                window.standard.modal.title('ADD ROLE');
                window.standard.modal.template('role-form');
                break;
            case 'Permission_Model':
                window.standard.modal.title('ADD PERMISSION');
                window.standard.modal.template('permission-form');
                break;
        }

        // set object
        window.standard.modal.object(object);
        // set up modal
        window.standard.modal.type('template');
        // set modal callback
        window.standard.modal.ok = modify ? self.modify_ok : self.add_ok;
        // show modal
        window.standard.modal.show();

    };

    // add modify ok
    this.add_modify_ok = function(modify) {

        // get mode
        var current_type = self.current_type();
        // get call to do assignments
        $.post('/manager/add_modify.json', {
            type: current_type,
            object: ko.mapping.toJS(window.standard.modal.object)
        }, function(object) {

            // modify existing or add to array
            if (modify) {
                // replace filtered item with modified object
                ko.mapping.fromJS(object, {}, window.standard.modal.original_object);
            } else {
                // get array for current type
                var array = self.get_array(current_type);
                // push new object to array
                array.push(new window[current_type](object));
            }

        }).fail(function() {
            // fail
            self.fail('Add/Modify');
        });

        // hide modal
        window.standard.modal.hide();

    };

    // add callback
    this.add_ok = function() {
        self.add_modify_ok(false)
    };

    // modify callback
    this.modify_ok = function() {
        self.add_modify_ok(true)
    };

    // add
    this.add = function() {
        self.add_modify(false);
    };

    // modify
    this.modify = function() {
        self.add_modify(true);
    };

    ////////////
    // REMOVE //
    ////////////

    // remove
    this.remove = function() {

        // get mode
        var current_type = self.current_type();
        // switch on type
        switch (current_type) {
            case 'User_Model':
                window.standard.modal.title('DELETE USERS');
                window.standard.modal.text('Delete selected users?');
                break;
            case 'Group_Model':
                window.standard.modal.title('DELETE GROUPS');
                window.standard.modal.text('Delete selected groups?');
                break;
            case 'Role_Model':
                window.standard.modal.title('DELETE ROLES');
                window.standard.modal.text('Delete selected roles?');
                break;
            case 'Permission_Model':
                window.standard.modal.title('DELETE PERMISSIONS');
                window.standard.modal.text('Delete selected permissions?');
                break;
        }

        // set up modal type
        window.standard.modal.type('action');
        // set modal ok text
        window.standard.modal.ok_text('DELETE');
        // set modal callback
        window.standard.modal.ok = self.remove_ok;
        // show modal
        window.standard.modal.show();

    };

    // remove ok
    this.remove_ok = function() {

        // get mode
        var current_type = self.current_type();
        // get filtered array for type
        var filtered = self.get_filtered(current_type);
        // get selected from type and to type ids
        var ids = self.get_ids(filtered);

        // post call to do deletes
        $.post('/manager/remove.json', {
            type: current_type,
            ids: ids['selected']
        }, function() {

            // get selected items
            var selected = self.get_selected(filtered);
            // get array for type
            var array = self.get_array(current_type);
            // remove all selected items
            array.removeAll(selected);
            // reload
            self.clear(current_type);

        }).fail(function() {
            // fail
            self.fail('Remove');
        });

    };

    /////////////////////////
    // MODIFY USER PROFILE //
    /////////////////////////

    // modify user profile
    this.modify_user_profile = function() {

        // reset the modal
        window.standard.modal.reset();
        // get filtered array for type
        var filtered = self.get_filtered('User_Model');
        // get selected from type and to type ids
        var ids = self.get_ids(filtered);
        // get selected ids
        var selected_ids = ids['selected'];
        // verify we only got one
        if (selected_ids.length != 1)
            return;
        // get selected id
        var selected_id = selected_ids[0];

        // post call to get shared profile fields
        $.get('/manager/user_metadatas.json', {
            id: selected_id
        }, function(data) {

            // create the user profile object
            var user_profile = new User_Profile_Model({
                'metadatas': data ? data : [],
                'id': selected_id
            });

            // set model title
            window.standard.modal.title('MODIFY USER PROFILE');
            // set modal template
            window.standard.modal.template('user-profile-form');
            // set object
            window.standard.modal.object(user_profile);
            // set up modal
            window.standard.modal.type('template');
            // set modal callback
            window.standard.modal.ok = self.modify_user_profile_ok;
            // show modal
            window.standard.modal.show();

        }).fail(function() {
            // fail
            self.fail('User Metadatas');
        });

    };

    // modify user profile ok
    this.modify_user_profile_ok = function() {

        // call to re-profile users
        $.post('/manager/user_metadatas.json', {
            id: window.standard.modal.object().id(),
            metadatas: ko.mapping.toJS(window.standard.modal.object().metadatas)
        }).fail(function() {
            self.fail('Save User Metadatas');
        });
        // hide modal
        window.standard.modal.hide();

    };

    // initialize
    this.initialize = function() {
        // call base
        Component_Model.prototype.initialize.call(this);
        // set initial mode
        self.current_type('User_Model');
    };

};

// manager index model prototype
Manager_Index_Model.prototype = Object.create(Component_Model.prototype);
Manager_Index_Model.prototype.constructor = Manager_Index_Model;

///////////
// READY //
///////////

$(function() {

    // set up standard model
    window.standard.initialize_component('modal');

});