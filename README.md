[![Build Status](https://secure.travis-ci.org/gfk-ba/carbon-router.png)](http://travis-ci.org/gfk-ba/carbon-router)

# Carbon-router

An alternative, lightweight, modular, customizable client side router for Meteor.


## Installation

```
mrt add carbon-router
```


## Example usage

Very simple example, using mostly default settings:

```html
<body>{{> carbon__layout}}</body>

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
    contentTemplate: 'hello',
    contentData: {audience: 'world'}
  });
  
  Router.add('item', '/item/{itemId}', {
    contentTemplate: 'item',
    contentData: function(data) {
      return {item: items[data.itemId]};
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
* `Router.configure`: Update the router configuration.
* `Router.go`: Navigate to the specified route.
* `Router.goUrl`: Navigate to the specified URL.
* `Router.url`: Generate the URL for the specified route.

These template helpers are available:

* `carbonUrl`: Return the URL for the specified route.

#### `Router.add(name, url, options)`

Add a route to the router. It's recommended to use this only during the initialization phase of the application (i.e. before `Meteor.startup` functions are run).

Parameters:
* `name`: Unique name of the route.
* `url`: Route URL. It can contain parameters within curly braces.
* `options`: An object with options for this route. Valid option keys are:
  * `contentTemplate`: Either:
    * Name of the template to use for the page content.
    * An object, where the keys are the names of the content regions and the values the names of the templates for those regions.
  * `contentData`: Can either be an object or a function returning an object. The result is merged with the data context that is passed to the content template.
    * If it's a function, it can have two (optional) parameters `data` and `region`. The first contains data that will be passed in the data context. The second is a string identifying the content region the data is for.
  * `layoutTemplate`: Same as the `contentTemplate` option, but used for the layout template.
  * `layoutData`: Same as the `contentData` option, but used for the data context that is passed to the layout template.
  * `paramDefaults`: Object containing default values for one or more route parameters. Parameters with default values are optional when constructing a URL for the route, the other parameters are required.
  * `before`: Before hook function, which is called before the layout for this route is rendered.

   
#### `Router.configure(config)`

Change the configuration options of the router. It's recommended to use this only during the initialization phase of the application (i.e. before `Meteor.startup` functions are run).

Parameters:
* `config`: An object with the configuration changes. Valid keys are:
  * `layoutTemplate`: Name of the layout template to use if no layout template is specified for the route itself.
  * `layoutData`: Layout data object or function returning an object, works the same as the `layoutData` option of `Router.add`. This layout-data is not overridden by the layout-data specified for the route, but it's extended by the layout-data of the route.
  * `contentTemplate`: Name of the content template to use if no content template is specified for the route itself.
  * `contentData`: Same as `layoutData`, only then for the content data.
  * `loading`: Object describing the template to use when showing the loading page. It contains two keys:
    * `layoutTemplate`: Name of the layout template to use. If not specified, the default layout template of the router is used.
    * `contentTemplate`: Name of the content template to use.
  * `notFound`: Same as the `loading` option, only then for the page-no-found template.
  * `contentKey`: The data key that is used to pass the content template and data in the context of the layout template. The default value is `yield`.
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


## Building layout and content data contexts

The data contexts for both the layout and content templates start out with the route parameters. This data is extended by the data in the configuration options of the router (respectively `layoutData` and `contentData`). Then this data is extended by the data from the route options `layoutData` and `contentData`.

If a data function is used instead of an object for one of these configuration options, then the already existing data object that is constructed upto then is passed as the first argument and the return value should be an object by which the existing data is extended. Note that it is possible to override the values of existing data keys. In a data function it is also possible to delete keys from the existing data.

### Examples

```javascript
Router.configure({
  contentData: { a: 123, b: 456 }
});

// This route overrides the data key 'a':
Router.add('override-a', '/example-a', {
  contentData: { a: 'overridden' }
});

// There are several ways to override data keys using a data function:
Router.add('override-b-1', '/example-b1'. {
  contentData: function() {
    return { b: 'overridden' };
  }
});

Router.add('override-b-2', '/example-b2'. {
  contentData: function(data) {
    data.b = 'overridden';
  }
});
```


## Customize layout

### Page layout

The example usage at the top of this document shows the `carbon__layout` helper included in the `body` template. This inclusion is the starting point of carbon-router within the application. It is where the layout template configured in your route will be inserted. If needed the `carbon__layout` helper can be surrounded with some html or other templates that you want to have rendered always for each route (including the loading page and not-found page). It can even be placed in a different template, as the small example below demonstrates:

```html
<body>
  <h1>For some reason I always want to see this header!</h1>
  {{> layout_wrapper}}
</body>

<template name="layout_wrapper">
  <div style="font-size: 2em">{{> carbon__layout}}</div>
</template>
```


### Carbon layout

When creating your own layout template, you can use the `carbon__content` template helper to indicate where the content is inserted, as long as you're using the default value `yield` for the router configuration `contentKey`. Always make sure the data context in which `carbon__content` is included contains the `yield` key.

Example layout template:
```html
<template name="my_layout">
  <div style="background: red">{{> carbon__content}}</div>
</template>
```


### Regions

When breaking up your layout in several regions, you can pass the region name to the `carbon__content` helper. But also pass `yield` in that case, as passing arguments will create a new data context.

Example using regions:
```html
<template name="my_layout">
  <div style="border: 1px solid black">{{> carbon__content region="header" yield=yield}}</div>
  <div style="background: red">{{> carbon__content}}</div>
</template>
```

```javascript
Router.add('my_page', '/page', {
  layoutTemplate: 'my_template',
  contentTemplate: {
    _: 'my_main_content',
    header: 'my_header'
  },
  contentData: function(data, region) {
    switch (region) {
      case header: return { x: 'Content data only passed to header.' };
      default: return { y: 'Main content data only.' };
    }
  }
});
```


## Hooks

Hooks are configurable functions that will be run during predefined phases of the routing process.


### Before hook

The before hook is invoked before the rendering of the route layout when navigating to it. The route parameter values are passed in an object as the first argument.


## License

MIT

