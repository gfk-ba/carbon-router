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
  * `contentTemplate`: Either:
    * Name of the template to use for the page content.
    * An object, where the keys are the names of the content regions and the values the names of the templates for those regions.
  * `contentData`: Can either be an object or a function returning an object. The result is merged with the data context that is passed to the content template.
    * If it's a function, it can have two (optional) parameters `data` and `region`. The first contains data that will be passed in the data context. The second is a string identifying the content region the data is for.
  * `layoutTemplate`: Same as the `contentTemplate` option, but used for the layout template.
  * `layoutData`: Same as the `contentData` option, but used for the data context that is passed to the layout template.
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

Navigate to the specified URL. Make sure the URL is matched by one of the routes in the router.

Parameters:
* `url`: URL string to navigate to. Can be specified both with or without the application origin and path prefix.


#### `Router.url(name, params, options)`

Contruct the URL for the specified route.

Parameters:
* `name`: Name of the route.
* `params`: An object with route parameter keys and their values.
* `options`: An object with options for this method. Valid keys are:
  * `check`: Check whether the route exists, otherwise throw an exception. Default value: `false`.


## Building layout and content data contexts

TODO


## Customize layout

TODO


### Regions

TODO


## Hooks

TODO

### Before hook

TODO


## License

MIT

