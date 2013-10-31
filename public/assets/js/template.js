///////////
// GROUP //
///////////

function group_model(group, selected) {

    this.id = ko.observable();
    this.name = ko.observable();
    this.selected = ko.observable(selected);

    // select group
    this.select = function() {
        this.selected(!this.selected());
    }.bind(this);

    // initialize
    if (!group)
        return;

    this.id(group.id);
    this.name(group.name);

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

    // select permission
    this.select = function() {
        this.selected(!this.selected());
    }.bind(this);

    // initialize
    if (!permission)
        return;

    this.id(permission.id);
    this.area(permission.area);
    this.permission(permission.permission);
    this.actions(permission.actions);

}

//////////
// ROLE //
//////////

function role_model(role, selected) {

    this.id = ko.observable();
    this.name = ko.observable();
    this.filter = ko.observable();
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

    this.id(role.id);
    this.name(role.name);
    this.filter(role.filter);

}

//////////
// USER //
//////////

function user_model(user, selected) {

    this.id = ko.observable();
    this.username = ko.observable();
    this.selected = ko.observable(selected);

    // initialize
    if (!user)
        return;

    this.id(user.id);
    this.username(user.username);

}

///////////////////////
// AUTHORITY MANAGER //
///////////////////////

function authority_manager_model() {

    // object arrays
    this.users = ko.observableArray();
    this.groups = ko.observableArray();
    this.roles = ko.observableArray();
    this.permissions = ko.observableArray();
    // filters
    this.users_filter = ko.observable('');
    this.groups_filter = ko.observable('');
    this.roles_filter = ko.observable('');
    this.permissions_filter = ko.observable('');
    // mode
    this.mode = ko.observable('users');

    // filter
    this.filter = function(array, properties, filter) {

        // if we have no filter, return array
        if (filter == '')
            return array;
        // ensure properties is array
        if (!(properties instanceof Array))
            properties = [ properties ];

        // first get filter parts
        var filter_parts = filter.split(',');
        // filter the array for each part
        return ko.utils.arrayFilter(array, function(item) {

            var found_filter_part = false;
            // loop through properties
            $.each(properties, function(properties_index, property) {
                var item_property_value = item[property]();
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

    // filtered users
    this.filtered_users = ko.computed(function() {
        // return locally filtered
        if (this.mode() != 'users') return this.filter(this.users(), 'username', this.users_filter());
        // return standard
        return this.users();
    }.bind(this));

    // filtered groups
    this.filtered_groups = ko.computed(function() {
        // return locally filtered
        if (this.mode() != 'groups') return this.filter(this.groups(), 'name', this.groups_filter());
        // return standard
        return this.groups();
    }.bind(this));

    // filtered roles
    this.filtered_roles = ko.computed(function() {
        // return locally filtered
        if (this.mode() != 'roles') return this.filter(this.roles(), 'name', this.roles_filter());
        // return standard
        return this.roles();
    }.bind(this));

    // filtered permissions
    this.filtered_permissions = ko.computed(function() {
        // return locally filtered
        if (this.mode() != 'permissions') return this.filter(this.permissions(), 'permission', this.permissions_filter());
        // return standard
        return this.permissions();
    }.bind(this));

    // clear
    this.clear = function() {

        // clear out arrays
        this.users.removeAll();
        this.groups.removeAll();
        this.roles.removeAll();
        this.permissions.removeAll();
        // clear out all filters
        this.users_filter('');
        this.groups_filter('');
        this.roles_filter('');
        this.permissions_filter('');
        // force re-evaluations
        this.groups_filter.valueHasMutated();
        this.roles_filter.valueHasMutated();
        this.permissions_filter.valueHasMutated();

    }.bind(this);

    /////////////////
    // MODE CHANGE //
    /////////////////

    // mode subscription
    this.mode.subscribe(function(mode) {
        // clear out everything
        this.clear();
    }.bind(this));

    ////////////////////
    // FILTERS CHANGE //
    ////////////////////

    // users filter subscription
    this.users_filter.subscribe(function(filter) {

        // if we aren't in users mode, run the filter locally
        if (this.mode() != 'users')
            return;
        // if we are in users mode, filter server side
        $.get('/manager/users.json', { filter: filter }, function (data) {
            this.users(ko.utils.arrayMap(data, function(user) { return new user_model(user); }));
        }.bind(this));

    }.bind(this));

    // groups filter subscription
    this.groups_filter.subscribe(function(filter) {

        // if we aren't in groups mode, run the filter locally
        if (this.mode() != 'groups')
            return;
        // if we are in groups mode, filter server side
        $.get('/manager/groups.json', { filter: filter }, function (data) {
            this.groups(ko.utils.arrayMap(data, function(group) { return new group_model(group); }));
        }.bind(this));

    }.bind(this));

    // roles filter subscription
    this.roles_filter.subscribe(function(filter) {

        // if we aren't in roles mode, run the filter locally
        if (this.mode() != 'roles')
            return;
        // if we are in roles mode, filter server side
        $.get('/manager/roles.json', { filter: filter }, function (data) {
            this.roles(ko.utils.arrayMap(data, function(role) { return new role_model(role); }));
        }.bind(this));

    }.bind(this));

    // permissions filter subscription
    this.permissions_filter.subscribe(function(filter) {

        // if we aren't in permissions mode, run the filter locally
        if (this.mode() != 'permissions')
            return;
        // if we are in permissions mode, filter server side
        $.get('/manager/permissions.json', { filter: filter }, function (data) {
            this.permissions(ko.utils.arrayMap(data, function(permission) { return new permission_model(permission); }));
        }.bind(this));

    }.bind(this));

    ////////////////////////
    // ASSIGNMENT LOADERS //
    ////////////////////////

    this.load_users_assignments = function() {

        var selected_user_ids = [];
        // get selected user ids
        ko.utils.arrayForEach(this.users(), function(user) {
           if (user.selected()) selected_user_ids.push(user.id());
        });

        // set assignment for selected users
        $.get('/manager/users_assignments.json', { ids: selected_user_ids }, function (assignments) {

            // create arrays
            var groups = [ new group_model(assignments['assigned_group'], true) ];
            var roles = ko.utils.arrayMap(assignments['assigned_roles'], function(role) { return new role_model(role, true); });
            var permissions = ko.utils.arrayMap(assignments['assigned_permissions'], function(permission) { return new permission_model(permission, true); })
            // add unassigned items and set
            this.groups(groups.concat(ko.utils.arrayMap(assignments['unassigned_groups'], function(group) { return new group_model(group); })));
            this.roles(roles.concat(ko.utils.arrayMap(assignments['unassigned_roles'], function(role) { return new role_model(role); })));
            permissions = permissions.concat(ko.utils.arrayMap(assignments['unassigned_permissions'], function(permission) { return new permission_model(permission); }));
            // process permission actions
            $.each(assignments['assigned_permission_actions'], function(assigned_permission_actions_index, assigned_permission_actions) {
                permissions[assigned_permission_actions_index].assigned_actions(assigned_permission_actions);
            });
            // set permissions
            this.permissions(permissions);

        }.bind(this));

    }.bind(this);

    ///////////////
    // SELECTION //
    ///////////////

    // select user
    this.select_user = function(user) {

        // invert user selection
        user.selected(!user.selected());
        // switch on mode to either load or assign
        switch (this.mode()) {
            case 'users':
                return this.load_users_assignments();
            case 'groups':
                return this.assign_user_group();
            case 'roles':
                return this.assign_user_role();
            case 'permissions':
                return this.assign_user_permission();
        }

    }.bind(this);

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