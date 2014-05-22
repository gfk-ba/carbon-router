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

TODO


#### `Router.go(name, params)`

TODO


#### `Router.goUrl(url)`

TODO


#### `Router.url(name, params, options)`

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

