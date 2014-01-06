///////////
// GROUP //
///////////

function group_model(group, selected) {

    this.id = ko.observable();
    this.name = ko.observable();
    this.assigned_permission_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // select group
    this.select = function() {
        this.selected(!this.selected());
    }.bind(this);

    // initialize
    if (!group)
        return;

    // mapping
    ko.mapping.fromJS(group, {}, this);

}

////////////////
// PERMISSION //
////////////////

function permission_model(permission, selected) {

    this.id = ko.observable();
    this.area = ko.observable();
    this.permission = ko.observable();
    this.description = ko.observable();
    this.actions = ko.observableArray();
    this.assigned_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // read/write actions from input
    this.entered_actions = ko.computed({
        read: function () { return this.actions().join(','); },
        write: function (value) { (value == "") ? this.actions([]) : this.actions(value.split(',')); },
        owner: this
    });

    // select permission
    this.select = function() {
        this.selected(!this.selected());
    }.bind(this);

    // initialize
    if (!permission)
        return;

    // mapping
    ko.mapping.fromJS(permission, {}, this);

}

//////////
// ROLE //
//////////

function role_model(role, selected) {

    this.id = ko.observable();
    this.name = ko.observable();
    this.filter = ko.observable();
    this.assigned_permission_actions = ko.observableArray();
    this.selected = ko.observable(selected);

    // filter css
    this.filter_css = ko.computed(function() {

        // switch on filter
        switch (this.filter()) {
            case 'A':
                return 'label-success';
            case 'D':
                return 'label-warning';
            case 'R':
                return 'label-important';
            default:
                return null;
        };

    }.bind(this));

    // filter text
    this.filter_text = ko.computed(function() {

        // switch on filter
        switch (this.filter()) {
            case 'A':
                return 'ALL ACCESS';
            case 'D':
                return 'NO ACCESS';
            case 'R':
                return 'REVOKE PERMISSIONS';
            default:
                return null;
        };

    }.bind(this));

    // select role
    this.select = function() {
        this.selected(!this.selected());
    }.bind(this);

    // initialize
    if (!role)
        return;

    // mapping
    ko.mapping.fromJS(role, {}, this);

}

//////////
// USER //
//////////

function user_model(user, selected) {

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

}

///////////////////////
// AUTHORITY MANAGER //
///////////////////////

function authority_manager_model() {

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
    this.current_type = ko.observable();

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
        if (this.current_type() == 'user_model') return this.users();
        // return locally filtered
        return this.filter(this.users(), 'username', this.users_filter());
    }.bind(this));

    // filtered groups
    this.filtered_groups = ko.computed(function() {
        // return standard
        if (this.current_type() == 'group_model') return this.groups();
        // return locally filtered
        return this.filter(this.groups(), 'name', this.groups_filter());
    }.bind(this));

    // filtered roles
    this.filtered_roles = ko.computed(function() {
        // return standard
        if (this.current_type() == 'role_model') return this.roles();
        // return locally filtered
        return this.filter(this.roles(), 'name', this.roles_filter());
    }.bind(this));

    // filtered permissions
    this.filtered_permissions = ko.computed(function() {
        // return standard
        if (this.current_type() == 'permission_model') return this.permissions();
        // return locally filtered
        return this.filter(this.permissions(), 'permission', this.permissions_filter());
    }.bind(this));

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
        if (type != 'user_model') {
            this.users.removeAll();
            this.clear_filter(this.users_filter);
        }
        // clear groups
        if (type != 'group_model') {
            this.groups.removeAll();
            this.clear_filter(this.groups_filter);
        }
        // clear roles
        if (type != 'role_model') {
            this.roles.removeAll();
            this.clear_filter(this.roles_filter);
        }
        // clear permissions
        if (type != 'permission_model') {
            this.permissions.removeAll();
            this.clear_filter(this.permissions_filter);
        }

        // if type specified, purge modified for type
        if (type) {
            // get modified array for type
            var modified = this.get_modified(type);
            // clear out
            modified.removeAll();
        }

    }.bind(this);

    /////////////////
    // MODE CHANGE //
    /////////////////

    // mode subscription
    this.current_type.subscribe(function() {
        this.clear();
    }.bind(this));

    //////////////////////////
    // FILTER SUBSCRIPTIONS //
    //////////////////////////

    // users filter subscription
    this.users_filter.subscribe(function(filter) {

        // if we aren't in users mode, run the filter locally
        if (this.current_type() != 'user_model') return;
        // clear all but users
        this.clear('user_model');
        // if we are in users mode, filter server side
        $.get('/manager/users.json', { filter: filter }, function (data) {
            this.users(ko.utils.arrayMap(data, function(user) { return new user_model(user); }));
        }.bind(this));

    }.bind(this));

    // groups filter subscription
    this.groups_filter.subscribe(function(filter) {

        // if we aren't in groups mode, run the filter locally
        if (this.current_type() != 'group_model') return;
        // clear all but groups
        this.clear('group_model');
        // if we are in groups mode, filter server side
        $.get('/manager/groups.json', { filter: filter }, function (data) {
            this.groups(ko.utils.arrayMap(data, function(group) { return new group_model(group); }));
        }.bind(this));

    }.bind(this));

    // roles filter subscription
    this.roles_filter.subscribe(function(filter) {

        // if we aren't in roles mode, run the filter locally
        if (this.current_type() != 'role_model') return;
        // clear all but roles
        this.clear('role_model');
        // if we are in roles mode, filter server side
        $.get('/manager/roles.json', { filter: filter }, function (data) {
            this.roles(ko.utils.arrayMap(data, function(role) { return new role_model(role); }));
        }.bind(this));

    }.bind(this));

    // permissions filter subscription
    this.permissions_filter.subscribe(function(filter) {

        // if we aren't in permissions mode, run the filter locally
        if (this.current_type() != 'permission_model') return;
        // clear all but permissions
        this.clear('permission_model');
        // if we are in permissions mode, filter server side
        $.get('/manager/permissions.json', { filter: filter }, function (data) {
            this.permissions(ko.utils.arrayMap(data, function(permission) { return new permission_model(permission); }));
        }.bind(this));

    }.bind(this));

    ///////////////////////
    // ARRAYS MANAGEMENT //
    ///////////////////////

    // get modified array for type
    this.get_modified = function(type) {
        // switch on item type
        switch (type) {
            case 'user_model': return this.modified_users;
            case 'group_model': return this.modified_groups;
            case 'role_model': return this.modified_roles;
            case 'permission_model': return this.modified_permissions;
        };

    }.bind(this);

    // get filtered array for type
    this.get_filtered = function(type) {
        // switch on item type
        switch (type) {
            case 'user_model': return this.filtered_users;
            case 'group_model': return this.filtered_groups;
            case 'role_model': return this.filtered_roles;
            case 'permission_model': return this.filtered_permissions;
        };

    }.bind(this);

    // get filtered array for type
    this.get_array = function(type) {
        // switch on item type
        switch (type) {
            case 'user_model': return this.users;
            case 'group_model': return this.groups;
            case 'role_model': return this.roles;
            case 'permission_model': return this.permissions;
        };

    }.bind(this);

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
        var from_filtered = this.get_filtered(from_type);
        // get selected ids
        var from_ids = this.get_ids(from_filtered);
        // if we have no selections
        if (from_ids['selected'].length == 0) {
            // clear other sections
            this.clear(from_type);
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
                var assigned_users = ko.utils.arrayMap(assignments['assigned_users'], function(user) { return new user_model(user, true); });
                this.users(assigned_users);
            }

            // groups
            if (assignments['assigned_groups']) {
                var assigned_groups = ko.utils.arrayMap(assignments['assigned_groups'], function(group) { return new group_model(group, true); });
                var unassigned_groups = ko.utils.arrayMap(assignments['unassigned_groups'], function(group) { return new group_model(group); });
                this.groups(assigned_groups.concat(unassigned_groups));
            }

            // roles
            if (assignments['assigned_roles']) {
                var assigned_roles = ko.utils.arrayMap(assignments['assigned_roles'], function(role) { return new role_model(role, true); });
                var unassigned_roles = ko.utils.arrayMap(assignments['unassigned_roles'], function(role) { return new role_model(role); });
                this.roles(assigned_roles.concat(unassigned_roles));
            }

            // permissions
            if (assignments['assigned_permissions']) {

                var assigned_permissions = ko.utils.arrayMap(assignments['assigned_permissions'], function(permission) { return new permission_model(permission, true); })
                // process permission actions
                ko.utils.arrayForEach(assigned_permissions, function(assigned_permission) {
                    assigned_permission.assigned_actions(assignments['assigned_permission_actions'][assigned_permission.id()]);
                });
                // add unassigned items and set
                this.permissions(assigned_permissions.concat(ko.utils.arrayMap(assignments['unassigned_permissions'], function(permission) { return new permission_model(permission); })));

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
            var from_modified = this.get_modified(from_type);
            from_modified.removeAll();
            // clear to modified if we have it
            if (to_type) {
                var to_modified = this.get_modified(to_type);
                to_modified.removeAll();
            }

        }.bind(this)).fail(function() {

            // fail & clear
            this.fail('Load');
            this.clear(from_type);

        }.bind(this));

    }.bind(this);

    ////////////
    // ASSIGN //
    ////////////

    // assign
    this.assign = function(from_type, to_type) {

        // get filtered array for type
        var from_filtered = this.get_filtered(from_type);
        var to_modified = this.get_modified(to_type);
        // get selected from type and to type ids
        var from_ids = this.get_ids(from_filtered);
        var to_ids = this.get_ids(to_modified);
        // get call to do assignments
        $.post('/manager/assign.json', {
            from_type: from_type,
            to_type: to_type,
            from_ids: from_ids['selected'],
            assign_to_ids: to_ids['selected'],
            unassign_to_ids: to_ids['unselected']
        }, function() {
            // reload
            this.load(from_type, to_type);
        }.bind(this)).fail(function() {
            // fail
            this.fail('Assign');
        }.bind(this));

    }.bind(this);

    // assign
    this.assign_permission_actions = function(item, permission_action, assign) {

        var perms_ids;
        var from_ids;
        var from_type;
        // get item type
        var type = item.constructor.name;
        // if we have a specific permission, it is the only to id
        if (type == 'permission_model') {
            // from type is current type
            from_type = this.current_type();
            // get from filtered
            var from_filtered = this.get_filtered(from_type);
            // from ids are those selected of the current type
            from_ids = this.get_ids(from_filtered);
            from_ids = from_ids['selected'];
            // permission ids are those of the clicked permission item
            perms_ids = [ item.id() ];
        } else {
            // from type is item type
            from_type = type;
            // from ids are that of the item
            from_ids = [ item.id() ];
            // get to filtered permissions
            var to_filtered = this.get_filtered('permission_model');
            // get to ids
            var to_ids = this.get_ids(to_filtered);
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
            if (type != 'permission_model')
                this.load('permission_model');
            else
                this.load(from_type, 'permission_model');
        }.bind(this)).fail(function() {
            // fail
            this.fail('Assign Permission Action');
        }.bind(this));

    }.bind(this);

    /////////////////
    // LOAD/ASSIGN //
    /////////////////

    // users
    this.load_assign = function(type) {

        // get mode
        var current_type = this.current_type();
        // load or assign
        if (type == current_type)
            this.load(current_type);
        else
            this.assign(current_type, type);

    }.bind(this);

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
        var modified = this.get_modified(type);
        // push modified item to array
        modified.push(item);
        // load assign based on item type
        this.load_assign(type);

    }.bind(this);

    // select all items
    this.select_all = function(type) {

        // get filtered array for this type
        var filtered = this.get_filtered(type);
        // verify we have at least one item
        if (filtered().length == 0)
            return;

        // get modified array for this type
        var modified = this.get_modified(type);
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
        this.load_assign(type);

    }.bind(this);

    ////////////////
    // ADD/MODIFY //
    ////////////////

    this.add_modify = function(modify) {

        // reset the modal
        modal.reset();

        var object;
        // get mode
        var current_type = this.current_type();
        // if we are modifying, set modal object to current
        if (modify) {

            // get filtered array for type
            var filtered = this.get_filtered(current_type);
            // get selected from type and to type ids
            var selected = this.get_selected(filtered);
            // verify only one selected
            if (selected.length != 1)
                return;

            // set original object
            modal.original_object = selected[0];
            // deep copy selected to modal
            object = new window[current_type](ko.mapping.toJS(modal.original_object));

        } else {

            // create new blank type
            object = new window[current_type]();

        }

        // switch on type
        switch (current_type) {
            case 'user_model':
                modal.title('ADD USER');
                modal.template('user-form');
                break;
            case 'group_model':
                modal.title('ADD GROUP');
                modal.template('group-form');
                break;
            case 'role_model':
                modal.title('ADD ROLE');
                modal.template('role-form');
                break;
            case 'permission_model':
                modal.title('ADD PERMISSION');
                modal.template('permission-form');
                break;
        }

        // set object
        modal.object(object);
        // set up modal
        modal.type('template');
        // set modal callback
        modal.ok = modify ? this.modify_ok : this.add_ok;
        // show modal
        modal.show();

    }.bind(this);

    // add modify ok
    this.add_modify_ok = function(modify) {

        // get mode
        var current_type = this.current_type();
        // get call to do assignments
        $.post('/manager/add_modify.json', {
            type: current_type,
            object: ko.mapping.toJS(modal.object)
        }, function(object) {

            // modify existing or add to array
            if (modify) {
                // replace filtered item with modified object
                ko.mapping.fromJS(object, {}, modal.original_object);
            } else {
                // get array for current type
                var array = this.get_array(current_type);
                // push new object to array
                array.push(new window[current_type](object));
            }

        }.bind(this)).fail(function() {
            // fail
            this.fail('Add/Modify');
        }.bind(this));

        // hide modal
        modal.hide();

    }.bind(this);

    // add callback
    this.add_ok = function() {
        this.add_modify_ok(false)
    }.bind(this);

    // modify callback
    this.modify_ok = function() {
        this.add_modify_ok(true)
    }.bind(this);

    // add
    this.add = function() {
        this.add_modify(false);
    }.bind(this);

    // modify
    this.modify = function() {
        this.add_modify(true);
    }.bind(this);

    ////////////
    // REMOVE //
    ////////////

    this.remove = function() {

        // get mode
        var current_type = this.current_type();
        // get filtered array for type
        var filtered = this.get_filtered(current_type);
        // get selected from type and to type ids
        var ids = this.get_ids(filtered);
        // post call to do deletes
        $.post('/manager/remove.json', {
            type: current_type,
            ids: ids['selected']
        }, function() {

            // get selected items
            var selected = this.get_selected(filtered);
            // get array for type
            var array = this.get_array(current_type);
            // remove all selected items
            array.removeAll(selected);
            // reload
            this.clear(current_type);

        }.bind(this)).fail(function() {
            // fail
            this.fail('Remove');
        }.bind(this));

    }.bind(this);

    ////////////////
    // INITIALIZE //
    ////////////////

    // start in users mode
    this.current_type('user_model');

}

///////////
// HOOKS //
///////////

// manager
function hook_authority_manager() {

    // playing
    ko.applyBindings(new authority_manager_model(), document.getElementById('authority-manager'));

}

///////////
// READY //
///////////

$(function() {
    hook_authority_manager();
});