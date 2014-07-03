[![Build Status](https://secure.travis-ci.org/gfk-ba/carbon-router.png)](http://travis-ci.org/gfk-ba/carbon-router)

# Carbon-router

An alternative, lightweight, modular, customizable client side router for Meteor.

Carbon-router is designed to be flexible and easy-to-use, focusing only on what a router needs to do. Excluded from the responsibility of the router is the handling of subscriptions, because we feel this goes against the philosophy of Meteor. Subscriptions are better handled in the template helpers, where their data is actually used.



## Installation

```
mrt add carbon-router
```


## Upgrading

### From 0.0.10 to 0.1.0

* The CarbonRouter architecture has changed, making regions first-class.
* The route options and Router configuration key for `contentTemplate`, `contentData`, `layoutTemplate` and `layoutData` made place for the `regions` key. Converting to the new way should be trivial. An example:
```javascript
// Old situation:
{
    layoutTemplate: 'my_layout',
    layoutData: y,
    contentTemplate: 'my_content',
    contentData: x
}

// New situation:
{
    regions: {
        layout: {
            template: 'my_layout',
            data: y
        },
        content: {
            template: 'my_content',
            data: x
        }
    }
}
```
* The template placeholders `{{> carbon__layout}}` and `{{> carbon__content}}` are now DEPRECATED and will be removed in the next minor version. They are replaced with `{{> carbon__region region='<region_name>' layout=<is_layout>}}`, where `<region_name>` is `layout`, `content` or the name of another defined region and `<is_layout>` is a boolean indicating whether the region is a layout region (default: `false`).
* The concept of content-key/yield is no longer used.


## Example usage

Very simple example, using mostly default settings:

```html
<body>{{> carbon__region region='content' layout=true}}</body>

<template name="hello">
  <h1>Hello {{audience}}</h1>
  {{#each itemIds}}
    <p><a href="{{carbonUrl 'item' itemId=this}}">Item {{this}}</a></p>
  {{/each}}
</template>

<template name="item">
  <p>Item {{itemId}}: {{item.name}}</p>
  <a href="{{carbonUrl 'hello'}}">Back home</a>
</template>
```

```javascript
if (Meteor.isClient) {
  Router.add('hello', '/', {
    regions: {
      content: {
        template: 'hello',
        data: {audience: 'world'}
      }
    }
  });
  
  Router.add('item', '/item/{itemId}', {
    regions: {
      content: {
        template: 'item',
        data: function(data) {
          return {item: items[data.itemId]};
        }
      }
    }
  });
  
  var items = { foo: {name: 'Foo'}, bar: {name: 'Bar!'} }; // Example data.
  
  Template.hello.itemIds = function() { return _.keys(items); };
}
```


## API

### Overview

These are the methods of the global `CarbonRouter` instance called `Router`, which application developers generally need:

* `Router.add`: Add a route to the router.
* `Router.configure`: Update the router configuration. (TODO: Elaborate docs.)
* `Router.go`: Navigate to the specified route. (TODO: Elaborate docs.)
* `Router.goUrl`: Navigate to the specified URL. (TODO: Elaborate docs.)
* `Router.url`: Generate the URL for the specified route. (TODO: Elaborate docs.)

These template helpers are available:

* `carbonUrl`: Return the URL for the specified route.

#### `Router.add(name, url, options)`

Add a route to the router. It's recommended to use this only during the initialization phase of the application (i.e. before `Meteor.startup` functions are run).

Parameters:
* `name`: Unique name of the route.
* `url`: Route URL. It can contain parameters within curly braces.
* `options`: An object with options for this route. Valid option keys are:
  * `regions`: An object which keys are region names and the values are objects with the region configuration (template and data).
    * The region configuration can have two keys:
      * `template`: Name of the template for this region. Will override any template specified for this region in the router configuration.
      * `data`: Can either be an object or a function returning an object. The result is merged with the data context that is passed to the template.
        * If it's a function, it can have two (optional) parameters `data` and `region`. The first contains data that will be passed in the data context. The second is a string identifying the content region the data is for.
  * `paramDefaults`: Object containing default values for one or more route parameters. Parameters with default values are optional when constructing a URL for the route, the other parameters are required.
  * `before`: Before hook function, which is called before the layout for this route is rendered.

   
#### `Router.configure(config)`

Change the configuration options of the router. It's recommended to use this only during the initialization phase of the application (i.e. before `Meteor.startup` functions are run).

Parameters:
* `config`: An object with the configuration changes. Valid keys are:
  * `regions`: See the regions option in `Router.add(...)`.
  * `autoLoad`: A boolean option indicating whether to automatically load the route corresponding to the current URL on startup. Default value: `true`.


#### `Router.go(name, params)`

This is a convenience wrapper connecting `Router.url(...)` and `Router.goUrl(url)`. It will navigate to the named route with the specified route parameters.

Parameters:
* `name`: Name of the route to go to..
* `params`: An object with route parameter keys and their values.


#### `Router.goUrl(url)`

Navigate to the specified URL. Make sure the URL is matched by one of the routes in the router. If multiple routes will match the URL, then the order in which the routes are added to the router determines which route will be used; i.e. the route that is added first.

Parameters:
* `url`: URL string to navigate to. Can be specified both with or without the application origin and path prefix.


#### `Router.url(name, params, options)`

Contruct the URL for the specified route.

Parameters:
* `name`: Name of the route.
* `params`: An object with route parameter keys and their values.
* `options`: An object with options for this method. Valid keys are:
  * `check`: Check whether the route exists and all required route parameters are provided, otherwise throw an exception. Default value: `false`.


#### `Router.current()`

Return the current controller. Will return the same controller instance as long as the router has not switched to a different route. This method uses a reactive data source, which will trigger a re-computation after the current route is switched.



## Assembling region data contexts

The data contexts for region templates start out with the controller status (either 'found', 'not\_found' or 'loading') and route parameters. This data is extended by the data in the configuration options of the router (respectively `layoutData` and `contentData`). Then this data is extended by the data from the route options `layoutData` and `contentData`.

If a data function is used instead of an object for one of these configuration options, then the already existing data object that is constructed upto then is passed as the first argument and the return value should be an object by which the existing data is extended. Note that it is possible to override the values of existing data keys. In a data function it is also possible to delete keys from the existing data.

### Examples

```javascript
Router.configure({
  regions: {
    regionX: { a: 123, b: 456 }
  }
});

// This route overrides the data key 'a':
Router.add('override-a', '/example-a', {
  regions: {
    regionX: { a: 'overridden' }
  }
});

// There are several ways to override data keys using a data function:
Router.add('override-b-1', '/example-b1'. {
  regions: {
    regionX: function() {
      return { b: 'overridden' };
    }
  }
});

Router.add('override-b-2', '/example-b2'. {
  regions: {
    regionX: function() {
      data.b = 'overridden';
    }
  }
});
```


## Customize layout

### Page layout

The example usage at the top of this document shows the `carbon__region` helper included in the `body` template. This inclusion is the starting point of carbon-router within the application. It is where the layout template configured in your route will be inserted. If needed the `carbon__region` helper can be surrounded with some html or other templates that you want to have rendered always for each route. It can even be placed in a different template, as the small example below demonstrates:

```html
<body>
  <h1>For some reason I always want to see this header!</h1>
  {{> layout_wrapper}}
</body>

<template name="layout_wrapper">
  <div style="font-size: 2em">{{> carbon__region region='layout' layout=true}}</div>
</template>
```

Note the `layout=true` parameter passed to the `carbon__region` helper. It indicates that this region is a layout region, causing the click events on anchor tags inside to be captured and handled by the router.


### Layout templates

When creating your own layout template, you can use the `carbon__region` template helper to indicate where the content regions are inserted.

Example layout template:
```html
<template name="my_layout">
  <div class="sidebar" style="background: red">{{> carbon__region region='sidebar'}}</div>
  <div class="main" style="background: red">{{> carbon__region region='main_content'}}</div>
</template>
```


## Hooks

Hooks are configurable functions that will be run during predefined phases of the routing process.


### Before hook

The before hook is invoked before the rendering of the route layout when navigating to it. The route parameter values are passed in an object as the first argument.


## License

MIT

