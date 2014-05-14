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

These are the methods of the global `CarbonRouter` instance called `Router`, which application developers generally need:

* `Router.add`: Add a route to the router. (TODO: Elaborate docs.)
* `Router.configure`: Update the router configuration. (TODO: Elaborate docs.)
* `Router.go`: Navigate to the specified route. (TODO: Elaborate docs.)
* `Router.goUrl`: Navigate to the specified URL. (TODO: Elaborate docs.)
* `Router.url`: Generate the URL for the specified route. (TODO: Elaborate docs.)

These template helpers are available:

* `carbonUrl`: Return the URL for the specified route.


## License

MIT

