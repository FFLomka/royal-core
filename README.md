[![npm version](https://d25lcipzij17d.cloudfront.net/badge.svg?id=js&r=r&type=6e&v=2.0.0&x2=0)](https://badge.fury.io/js/angular2-expandable-list) [![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
# royal-core

> Guideline system controller for pretty roles
> Includes mongoDB and sync controllers

## Install

```sh
$ npm i royal-core
or
$ yarn add royal-core
```

## Table of contents

- Getting Started
  - [No DB (Sync)](#no-db-(sync))
  - [MongoDB (aSync)](#MongoDB-(aSync))
  - [other (aSync)](#other-(aSync))
  - [Usage](#usage)
  - [API](#api)

## No DB (Sync)

```js
import Royal, {SyncConnector} from 'royal-core'

const royal = new Royal(new SyncConnector())
```

## MongoDB (aSync)

```js
import Royal from 'royal-core'
import MongoConnector from 'royal-core/MongoConnector.js'

const royal = new Royal(new MongoConnector(uri, dbName, collectionName?))
```

## other (aSync)

Create self controller on base structure
```js
class _Connector {
	constructor() {}

	getAll() {}
	get() {}
	add(id, guidelines, payload, rules, upGuideline) {}
	remove(id) {}
	update(id, controller) {
		const {
			addRules = [],
			removeRules = [],
			addGuidelines = [],
			removeGuidelines = [],
			addUpGuidelines = [],
			removeUpGuidelines = [],
			payload = {},
		} = controller
	}
}
```

## Usage

### Add guideline

```js
royal.addGuideline(id, {
    guidlines: ['idGuideline'],
    payload: any,
    rules: ['example.test.1'],
    upGuideline: ['idGuideline']
})
```
### Remove guideline

```js
royal.removeGuideline(id)
```
### Get guideline from id

```js
royal.getGuideline(id)
```
### Get all guidelines

```js
royal.getGuidelines()
```
### Update guideline

```js
royal.updateGuidelines(id, {
	addRules = ['example.test.1'],
	removeRules = ['example.test.2'],
	addGuidelines = ['idGuideline'],
	removeGuidelines = ['idGuideline'],
	addUpGuidelines = ['idGuideline'],
	removeUpGuidelines = ['idGuideline'],
	payload = any,
})
```
### Can guideline do rule

```js
royal.canGuideline(id, 'example.test.10')
```

### Use without connector (front)
```js
front-end:
import {Utils} from 'royal-core'

...recive data from back...

Utils.canRules(data, 'example.test.1')

back-end:
const data royal.getGuidelineRules('idGuideline')

...transfer data to front...
```

## API

### Rules

```js
Utils.string2Rule('example.test.*')
```

#### How make rule

This rule `any.string.split.with.dot` get access to
`any`
`any.string`
`any.string.split`
`any.string.split.with`
`any.string.split.with.dot`
`any.string.split.with.dot.*`


This rule `you.can.use.*.to.access.all.middles` get access to
`you`
`you.can`
`you.can.use`
`you.can.use.access`
`you.can.use.to.to`
`you.can.use.all.to.access`
`you.can.use.any.to.access.all`
`you.can.use.namespace.to.access.all.middles`
`you.can.use.*.to.access.all.middles.*`


This rule `-just.*.access` and `just.*` get access to
`just.*.start`
`just.*.any`
`just.*.without`(access)

Example:

```js
royal.addGuideline('test', {
    rules: ['line.*', '-line.root.add']
})

royal.canGuideline('test', 'line') // true
royal.canGuideline('test', 'line.*') // true
royal.canGuideline('test', 'line.test.add') // true
royal.canGuideline('test', 'line.test.delete.user') // true
royal.canGuideline('test', 'line.test.any') // true
royal.canGuideline('test', 'line.any.move.place') // true
royal.canGuideline('test', 'line.root.move') // true
royal.canGuideline('test', 'line.root.delete') // true
royal.canGuideline('test', 'line.root.add') // false
royal.canGuideline('test', 'line.root.add.test') // false
```

### Guideline childrens

```js
royal.addGuideline('test', {
    guidelines: ['test1'], // include all rule from guideline "test1" "test2" "test3" without circular
    rules: ['test.*']
})
royal.addGuideline('test1', {
    guidelines: ['test2'],
    rules: ['test1.*', '-test.1.add']
})
royal.addGuideline('test2', {
    guidelines: ['test1', 'test3'],
    rules: ['test2.*', '-test.2.add']
})
royal.addGuideline('test3', {
    guidelines: ['test1', 'test2'],
    rules: ['test3.*', '-test.3.add']
})
```

## License

[MIT License](https://andreasonny.mit-license.org/2019) © FLomka