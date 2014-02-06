/*global define*/
define([
        '../../Core/createGuid',
        '../../Core/defaultValue',
        '../../Core/defined',
        '../../Core/defineProperties',
        '../../Core/DeveloperError',
        '../../Core/EventHelper',
        '../createCommand',
        '../../ThirdParty/knockout'
    ], function(
        createGuid,
        defaultValue,
        defined,
        defineProperties,
        DeveloperError,
        EventHelper,
        createCommand,
        knockout) {
    "use strict";

    var clockPath = 'M15.5,2.374C8.251,2.375,2.376,8.251,2.374,15.5C2.376,22.748,8.251,28.623,15.5,28.627c7.249-0.004,13.124-5.879,13.125-13.127C28.624,8.251,22.749,2.375,15.5,2.374zM15.5,25.623C9.909,25.615,5.385,21.09,5.375,15.5C5.385,9.909,9.909,5.384,15.5,5.374c5.59,0.01,10.115,4.535,10.124,10.125C25.615,21.09,21.091,25.615,15.5,25.623zM8.625,15.5c-0.001-0.552-0.448-0.999-1.001-1c-0.553,0-1,0.448-1,1c0,0.553,0.449,1,1,1C8.176,16.5,8.624,16.053,8.625,15.5zM8.179,18.572c-0.478,0.277-0.642,0.889-0.365,1.367c0.275,0.479,0.889,0.641,1.365,0.365c0.479-0.275,0.643-0.887,0.367-1.367C9.27,18.461,8.658,18.297,8.179,18.572zM9.18,10.696c-0.479-0.276-1.09-0.112-1.366,0.366s-0.111,1.09,0.365,1.366c0.479,0.276,1.09,0.113,1.367-0.366C9.821,11.584,9.657,10.973,9.18,10.696zM22.822,12.428c0.478-0.275,0.643-0.888,0.366-1.366c-0.275-0.478-0.89-0.642-1.366-0.366c-0.479,0.278-0.642,0.89-0.366,1.367C21.732,12.54,22.344,12.705,22.822,12.428zM12.062,21.455c-0.478-0.275-1.089-0.111-1.366,0.367c-0.275,0.479-0.111,1.09,0.366,1.365c0.478,0.277,1.091,0.111,1.365-0.365C12.704,22.344,12.54,21.732,12.062,21.455zM12.062,9.545c0.479-0.276,0.642-0.888,0.366-1.366c-0.276-0.478-0.888-0.642-1.366-0.366s-0.642,0.888-0.366,1.366C10.973,9.658,11.584,9.822,12.062,9.545zM22.823,18.572c-0.48-0.275-1.092-0.111-1.367,0.365c-0.275,0.479-0.112,1.092,0.367,1.367c0.477,0.275,1.089,0.113,1.365-0.365C23.464,19.461,23.3,18.848,22.823,18.572zM19.938,7.813c-0.477-0.276-1.091-0.111-1.365,0.366c-0.275,0.48-0.111,1.091,0.366,1.367s1.089,0.112,1.366-0.366C20.581,8.702,20.418,8.089,19.938,7.813zM23.378,14.5c-0.554,0.002-1.001,0.45-1.001,1c0.001,0.552,0.448,1,1.001,1c0.551,0,1-0.447,1-1C24.378,14.949,23.929,14.5,23.378,14.5zM15.501,6.624c-0.552,0-1,0.448-1,1l-0.466,7.343l-3.004,1.96c-0.478,0.277-0.642,0.889-0.365,1.365c0.275,0.479,0.889,0.643,1.365,0.367l3.305-1.676C15.39,16.99,15.444,17,15.501,17c0.828,0,1.5-0.671,1.5-1.5l-0.5-7.876C16.501,7.072,16.053,6.624,15.501,6.624zM15.501,22.377c-0.552,0-1,0.447-1,1s0.448,1,1,1s1-0.447,1-1S16.053,22.377,15.501,22.377zM18.939,21.455c-0.479,0.277-0.643,0.889-0.366,1.367c0.275,0.477,0.888,0.643,1.366,0.365c0.478-0.275,0.642-0.889,0.366-1.365C20.028,21.344,19.417,21.18,18.939,21.455z';

    var DataSourceViewModel = function(dataSourceBrowserViewModel, dataSource) {
        if (!defined(dataSourceBrowserViewModel)) {
            throw new DeveloperError('dataSourceBrowserViewModel is required.');
        }
        if (!defined(dataSource)) {
            throw new DeveloperError('dataSource is required.');
        }

        this._dataSourceBrowserViewModel = dataSourceBrowserViewModel;
        this._dataSource = dataSource;

        this.id = 'cesium-dataSourceBrowser-node-' + createGuid();

        /**
         * Gets or sets the name of this data source.  This property is observable.
         * @type {String}
         */
        this.name = dataSource.getName();
        this.children = [];
        this.expanded = true;
        this._isLoading = false;
        this._uiShow = true;

        knockout.track(this, ['name', 'children', 'expanded', '_isLoading', '_uiShow']);

        /**
         * Gets whether the data source is currently loading.  This property is observable.
         * @type {Boolean}
         */
        this.isLoading = undefined;
        knockout.defineProperty(this, 'isLoading', function() {
            return this._isLoading;
        });

        this.displayName = undefined;
        knockout.defineProperty(this, 'displayName', function() {
            var name = defaultValue(this.name, '');
            // allow break after slash
            name = name.replace(/\//g, '/\u200b');
            // replace empty string with non-breaking space
            if (name === '') {
                name = '\xA0';
            }
            return name;
        });

        this.uiShow = undefined;
        knockout.defineProperty(this, 'uiShow', {
            get : function() {
                return this._uiShow;
            },
            set : function(newValue) {
                this._uiShow = newValue;
                var len = this.children.length;
                for (var i = 0; i < len; ++i) {
                    this.children[i].uiShow = newValue;
                }
            }
        });

        this.hasChildren = undefined;
        knockout.defineProperty(this, 'hasChildren', function() {
            return this.children.length > 0;
        });

        this.isSelected = undefined;
        knockout.defineProperty(this, 'isSelected', function() {
            return this._dataSourceBrowserViewModel.selectedViewModel === this;
        });

        this.isFilteredOut = undefined;
        knockout.defineProperty(this, 'isFilteredOut', function() {
            return dataSourceBrowserViewModel.isNodeFiltered(this);
        });

        knockout.getObservable(this, 'isFilteredOut').extend({
            throttle : 10
        });

        /**
         * Gets an HTML arrow indicating expand status.
         * @type {String}
         */
        this.expandIndicator = undefined;
        knockout.defineProperty(this, 'expandIndicator', function() {
            return this.expanded ? '&#9660;' : '&#9658;';
        });

        /**
         * True if the clock icon is selected.
         * @type {Boolean}
         */
        this.clockTracking = undefined;
        knockout.defineProperty(this, 'clockTracking', function() {
            return this._dataSourceBrowserViewModel.clockTrackedDataSource === this._dataSource;
        });

        /**
         * True if this is the only data source loaded.
         * @type {Boolean}
         */
        this.isSoleSource = undefined;
        knockout.defineProperty(this, 'isSoleSource', function() {
            var dataSourceBrowserViewModel = this._dataSourceBrowserViewModel;
            return dataSourceBrowserViewModel.dataSourcesLength === 1 && dataSourceBrowserViewModel.dataSources.get(0) === this._dataSource;
        });

        /**
         * True if this data source is being configured.
         * @type {Boolean}
         */
        this.isConfiguring = undefined;
        knockout.defineProperty(this, 'isConfiguring', function() {
            var dataSourceConfigurationPanelViewModel = this._dataSourceBrowserViewModel.dataSourceConfigurationPanelViewModel;
            return defined(this._dataSource.getConfigurationPanel) &&
                   dataSourceConfigurationPanelViewModel.visible &&
                   dataSourceConfigurationPanelViewModel.activeDataSourceConfigurationPanel === this._dataSource.getConfigurationPanel();
        });

        var that = this;
        this._eventHelper = new EventHelper();
        this._eventHelper.add(dataSource.getLoadingEvent(), function(isLoading) {
            that._isLoading = isLoading;
        });
        this._eventHelper.add(dataSource.getChangedEvent(), function(dataSource) {
            that.name = dataSource.getName();
        });

        this._trackClock = createCommand(function() {
            that._dataSourceBrowserViewModel.clockTrackedDataSource = that._dataSource;
        });

        this._toggleExpanded = createCommand(function() {
            that.expanded = !that.expanded;
        });

        this._select = createCommand(function() {
            that._dataSourceBrowserViewModel.selectedViewModel = that;
        });

        this._remove = createCommand(function() {
            that._dataSourceBrowserViewModel.dataSources.remove(that._dataSource);
        });

        this._configure = createCommand(function() {
            var dataSourceConfigurationPanelViewModel = that._dataSourceBrowserViewModel.dataSourceConfigurationPanelViewModel;
            dataSourceConfigurationPanelViewModel.visible = true;
            dataSourceConfigurationPanelViewModel.activeDataSourceConfigurationPanel = that._dataSource.getConfigurationPanel();
        }, defined(that._dataSource.getConfigurationPanel));
    };

    defineProperties(DataSourceViewModel.prototype, {
        /**
         * Gets the {@link DataSource} that this view model represents.
         * @memberof DataSourceViewModel.prototype
         * @type {DataSource}
         */
        dataSource : {
            get : function() {
                return this._dataSource;
            }
        },

        /**
         * Gets the root view model for this view model.
         * @memberof DataSourceViewModel.prototype
         * @type {DataSourceBrowserViewModel}
         */
        dataSourceBrowserViewModel : {
            get : function() {
                return this._dataSourceBrowserViewModel;
            }
        },

        trackClock : {
            get : function() {
                return this._trackClock;
            }
        },

        toggleExpanded : {
            get : function() {
                return this._toggleExpanded;
            }
        },

        select : {
            get : function() {
                return this._select;
            }
        },

        remove : {
            get : function() {
                return this._remove;
            }
        },

        configure : {
            get : function() {
                return this._configure;
            }
        },

        _clockPath : {
            get : function() {
                return clockPath;
            }
        }
    });

    DataSourceViewModel.prototype.destroy = function() {
        this._eventHelper.removeAll();
        if (typeof this._dataSource.destroy === 'function') {
            this._dataSource.destroy();
        }
    };

    return DataSourceViewModel;
});